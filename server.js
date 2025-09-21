const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const cursorAI = require('./services/cursorAI');
const { validatePrompt } = require('./middleware/validation');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Validate configuration
config.validateConfig();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api', require('./routes/api'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Frontend Builder Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      generate: '/api/generate',
      docs: '/api/docs'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${config.frontendUrl}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Generate: http://localhost:${PORT}/api/generate`);
  
  if (config.nodeEnv === 'development') {
    console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
