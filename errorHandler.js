/**
 * Error handling middleware for Express.js
 */

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Global error handler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, status: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, status: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, status: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, status: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, status: 401 };
  }

  // Rate limit error
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: err.retryAfter || 60
    });
  }

  // Cursor AI specific errors
  if (err.name === 'CursorAIError') {
    return res.status(502).json({
      success: false,
      error: 'AI Service Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      field: err.field || null,
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  const statusCode = error.status || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isDevelopment && {
      stack: err.stack,
      details: err.message
    }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};

/**
 * Async error wrapper
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for Cursor AI errors
 */
class CursorAIError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = 'CursorAIError';
    this.statusCode = statusCode;
  }
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  CursorAIError,
  ValidationError
};
