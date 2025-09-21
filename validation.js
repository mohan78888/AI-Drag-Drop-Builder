/**
 * Validation middleware for API requests
 */

/**
 * Validate prompt in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePrompt = (req, res, next) => {
  try {
    const { prompt } = req.body;

    // Check if prompt exists
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
        field: 'prompt'
      });
    }

    // Check if prompt is a string
    if (typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Prompt must be a string',
        field: 'prompt'
      });
    }

    // Check prompt length
    if (prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt cannot be empty',
        field: 'prompt'
      });
    }

    if (prompt.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is too long (maximum 5000 characters)',
        field: 'prompt',
        maxLength: 5000,
        currentLength: prompt.length
      });
    }

    if (prompt.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is too short (minimum 10 characters)',
        field: 'prompt',
        minLength: 10,
        currentLength: prompt.length
      });
    }

    // Check for potentially harmful content
    const harmfulPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /document\.cookie/gi
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(prompt)) {
        return res.status(400).json({
          success: false,
          error: 'Prompt contains potentially harmful content',
          field: 'prompt'
        });
      }
    }

    // Sanitize prompt (basic sanitization)
    const sanitizedPrompt = prompt
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .substring(0, 5000); // Ensure max length

    // Add sanitized prompt to request
    req.body.prompt = sanitizedPrompt;

    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }
};

/**
 * Validate request content type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateContentType = (req, res, next) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    return res.status(400).json({
      success: false,
      error: 'Content-Type must be application/json'
    });
  }
  next();
};

/**
 * Validate API key presence
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateApiKey = (req, res, next) => {
  const config = require('../config');
  
  if (!config.cursorApiKey || config.cursorApiKey === 'your_real_cursor_ai_api_key') {
    return res.status(503).json({
      success: false,
      error: 'AI service not configured',
      message: 'Please configure Cursor AI API key'
    });
  }
  
  next();
};

module.exports = {
  validatePrompt,
  validateContentType,
  validateApiKey
};
