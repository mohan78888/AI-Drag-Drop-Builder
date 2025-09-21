const axios = require('axios');
const config = require('../config');

class CursorAI {
  constructor() {
    this.apiKey = config.cursorApiKey;
    this.apiUrl = config.cursorApiUrl;
    this.timeout = 30000; // 30 seconds timeout
    
    if (!this.apiKey || this.apiKey === 'your_real_cursor_ai_api_key') {
      console.warn('⚠️  Cursor AI API key not configured properly');
    }
  }

  /**
   * Generate code using Cursor AI
   * @param {string} prompt - The user's prompt
   * @returns {Promise<Object>} - AI response with generated code
   */
  async generateCode(prompt) {
    try {
      if (!this.apiKey || this.apiKey === 'your_real_cursor_ai_api_key') {
        throw new Error('Cursor AI API key not configured');
      }

      const requestData = {
        model: 'gpt-4', // or 'gpt-3.5-turbo' for faster responses
        messages: [
          {
            role: 'system',
            content: `You are an expert frontend developer. Generate clean, modern, and responsive code based on user prompts. 
            Always provide:
            1. Complete HTML structure
            2. CSS with modern styling (use CSS Grid, Flexbox, custom properties)
            3. JavaScript for interactivity if needed
            4. Responsive design considerations
            5. Accessibility features
            6. Clean, commented code
            
            Focus on:
            - Modern CSS (Grid, Flexbox, custom properties)
            - Responsive design
            - Accessibility (ARIA labels, semantic HTML)
            - Performance optimization
            - Clean, maintainable code`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      };

      console.log('🚀 Sending request to Cursor AI...');
      
      const response = await axios.post(this.apiUrl, requestData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Frontend-Builder/1.0.0'
        },
        timeout: this.timeout
      });

      if (response.status !== 200) {
        throw new Error(`Cursor AI API returned status ${response.status}`);
      }

      const aiResponse = response.data;
      
      if (!aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message) {
        throw new Error('Invalid response format from Cursor AI');
      }

      const generatedContent = aiResponse.choices[0].message.content;
      
      // Parse the response to extract code blocks
      const codeBlocks = this.extractCodeBlocks(generatedContent);
      
      return {
        generatedCode: generatedContent,
        codeBlocks: codeBlocks,
        usage: aiResponse.usage || null,
        model: aiResponse.model || 'unknown',
        suggestions: this.generateSuggestions(prompt, generatedContent)
      };

    } catch (error) {
      console.error('❌ Cursor AI API Error:', error.message);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - Cursor AI took too long to respond');
      }
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || error.message;
        
        switch (status) {
          case 401:
            throw new Error('Invalid API key - please check your Cursor AI credentials');
          case 429:
            throw new Error('Rate limit exceeded - please try again later');
          case 500:
            throw new Error('Cursor AI service is temporarily unavailable');
          default:
            throw new Error(`Cursor AI API error: ${message}`);
        }
      }
      
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to Cursor AI service');
      }
      
      throw new Error(`Cursor AI request failed: ${error.message}`);
    }
  }

  /**
   * Extract code blocks from AI response
   * @param {string} content - The AI response content
   * @returns {Array} - Array of code blocks
   */
  extractCodeBlocks(content) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }

    return blocks;
  }

  /**
   * Generate helpful suggestions based on prompt and response
   * @param {string} prompt - Original prompt
   * @param {string} response - AI response
   * @returns {Array} - Array of suggestions
   */
  generateSuggestions(prompt, response) {
    const suggestions = [];
    
    // Check for responsive design
    if (!response.includes('@media') && !response.includes('responsive')) {
      suggestions.push('Consider adding responsive design with CSS media queries');
    }
    
    // Check for accessibility
    if (!response.includes('aria-') && !response.includes('alt=') && !response.includes('role=')) {
      suggestions.push('Add accessibility features like ARIA labels and alt text');
    }
    
    // Check for modern CSS
    if (!response.includes('grid') && !response.includes('flex')) {
      suggestions.push('Consider using CSS Grid or Flexbox for better layouts');
    }
    
    // Check for JavaScript
    if (prompt.toLowerCase().includes('interactive') && !response.includes('addEventListener')) {
      suggestions.push('Add JavaScript for interactive functionality');
    }
    
    return suggestions;
  }

  /**
   * Test the API connection
   * @returns {Promise<boolean>} - True if connection is successful
   */
  async testConnection() {
    try {
      const testPrompt = 'Generate a simple "Hello World" HTML page';
      await this.generateCode(testPrompt);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = new CursorAI();
