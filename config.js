require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Cursor AI API Configuration
  cursorApiKey: process.env.CURSOR_API_KEY,
  cursorApiUrl: process.env.CURSOR_API_URL || 'https://api.cursor.sh/v1/chat/completions',
  
  // CORS Configuration
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // Validation
  validateConfig() {
    if (!this.cursorApiKey || this.cursorApiKey === 'your_real_cursor_ai_api_key') {
      console.warn('⚠️  CURSOR_API_KEY not set or using default value');
      console.warn('   Please set your real Cursor AI API key in .env file');
    }
    
    if (this.nodeEnv === 'development') {
      console.log('🚀 Running in development mode');
    }
  }
};

module.exports = config;
