#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Frontend Builder Backend...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'config.js');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Cursor AI API Configuration
CURSOR_API_KEY=your_real_cursor_ai_api_key
CURSOR_API_URL=https://api.cursor.sh/v1/chat/completions

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
} else {
  console.log('✅ .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\n📦 Installing dependencies...');
  console.log('Run: npm install');
} else {
  console.log('✅ Dependencies already installed');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Get your Cursor AI API key from https://cursor.sh');
console.log('2. Update CURSOR_API_KEY in .env file');
console.log('3. Run: npm install');
console.log('4. Run: npm run dev');
console.log('\n🔗 Server will start at: http://localhost:3001');
console.log('📚 API docs: http://localhost:3001/api/docs');
