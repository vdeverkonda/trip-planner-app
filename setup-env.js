#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Trip Planner App Environment Setup\n');

// Server .env content
const serverEnvContent = `# Database
MONGODB_URI=mongodb://localhost:27017/trip-planner

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# External APIs
GOOGLE_PLACES_API_KEY=your-google-places-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# Server Configuration
PORT=5001
CLIENT_URL=http://localhost:3000

# Optional: Enable detailed logging
NODE_ENV=development
`;

// Client .env content
const clientEnvContent = `REACT_APP_SERVER_URL=http://localhost:5001
`;

// Create server .env
const serverEnvPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(serverEnvPath)) {
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Created server/.env');
} else {
  console.log('⚠️  server/.env already exists');
}

// Create client .env
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Created client/.env');
} else {
  console.log('⚠️  client/.env already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Get your Gemini API key from: https://makersuite.google.com/app/apikey');
console.log('2. Get your Google Places API key from: https://console.cloud.google.com/');
console.log('3. Update the API keys in server/.env');
console.log('4. Run: npm run dev');
console.log('\n💡 The app will work without API keys, but with limited features.');
console.log('   - Without Gemini: Basic itinerary generation');
console.log('   - Without Places: Manual location input');
