const express = require('express');
const router = express.Router();
const cursorAI = require('../services/cursorAI');
const { validatePrompt } = require('../middleware/validation');

// API Documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    title: 'Frontend Builder API Documentation',
    version: '1.0.0',
    description: 'API for Frontend Builder with Cursor AI integration',
    endpoints: [
      {
        method: 'POST',
        path: '/generate',
        description: 'Generate code using Cursor AI',
        requestBody: {
          type: 'application/json',
          schema: {
            prompt: {
              type: 'string',
              required: true,
              description: 'The prompt to send to Cursor AI',
              example: 'Create a responsive navbar component'
            }
          }
        },
        responses: {
          200: {
            description: 'Successful response',
            schema: {
              success: 'boolean',
              data: 'object',
              message: 'string'
            }
          },
          400: {
            description: 'Bad request - invalid input',
            schema: {
              success: 'boolean',
              error: 'string'
            }
          },
          500: {
            description: 'Internal server error',
            schema: {
              success: 'boolean',
              error: 'string'
            }
          }
        }
      }
    ],
    examples: {
      request: {
        prompt: 'Create a modern login form with validation'
      },
      response: {
        success: true,
        data: {
          generatedCode: '...',
          suggestions: '...'
        },
        message: 'Code generated successfully'
      }
    }
  });
});

// Generate endpoint
router.post('/generate', validatePrompt, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    console.log(`🤖 Processing prompt: ${prompt.substring(0, 100)}...`);
    
    // Call Cursor AI service
    const result = await cursorAI.generateCode(prompt);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Code generated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in /generate endpoint:', error);
    
    // Handle different types of errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.name === 'CursorAIError') {
      return res.status(502).json({
        success: false,
        error: 'AI service temporarily unavailable',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for development
if (process.env.NODE_ENV === 'development') {
  router.get('/test', (req, res) => {
    res.json({
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });
}

module.exports = router;
