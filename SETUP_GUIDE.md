# Trip Planner App Setup Guide

## Quick Setup

### 1. Environment Variables Setup

Create the following `.env` files:

#### Server Environment (server/.env)
```bash
# Database
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
```

#### Client Environment (client/.env)
```bash
REACT_APP_SERVER_URL=http://localhost:5001
```

### 2. API Keys Setup

#### Google Gemini API (Required for AI features)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `server/.env` as `GEMINI_API_KEY`

**Available Models:**
- `gemini-1.5-pro` (Default) - Most capable model for detailed, personalized itineraries
- `gemini-1.5-flash` - Fast and efficient, good balance of speed and quality
- `gemini-1.5-flash-lite` - Fastest model, basic itinerary generation

To change models, add `GEMINI_MODEL=your-preferred-model` to `server/.env`

#### Google Places API (Optional - for location autocomplete)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Places API
3. Create API key
4. Add it to `server/.env` as `GOOGLE_PLACES_API_KEY`

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `MONGODB_URI=mongodb://localhost:27017/trip-planner`

#### Option B: MongoDB Atlas (Cloud)
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster
3. Get connection string
4. Use `MONGODB_URI=your-atlas-connection-string`

### 4. Start the Application

```bash
# Install dependencies
npm run install-all

# Start both servers
npm run dev
```

## Features Status

### ✅ Working Features
- User authentication (register/login)
- Trip creation and management
- Basic itinerary planning
- Manual activity addition
- Real-time collaboration (Socket.io)

### 🤖 AI Features
- **With Gemini API Key**: Full AI-powered itinerary generation
- **Without Gemini API Key**: Basic fallback itinerary generation
- **Model**: Gemini 1.5 Flash Lite (fastest and most cost-effective)

### 📍 Location Features
- **With Google Places API**: Real location autocomplete
- **Without Google Places API**: Basic text input (still works)

## Troubleshooting

### AI Not Working
- Check if `GEMINI_API_KEY` is set in `server/.env`
- Verify the API key is valid
- Check server console for error messages
- The app will fall back to basic itinerary generation

### Location Autocomplete Not Working
- Check if `GOOGLE_PLACES_API_KEY` is set
- Verify Places API is enabled in Google Cloud Console
- The app will fall back to manual text input

### Database Connection Issues
- Check if MongoDB is running (local) or accessible (Atlas)
- Verify `MONGODB_URI` is correct
- Check network connectivity

### Port Issues
- Default ports: Server (5001), Client (3000)
- Change ports in `.env` files if needed
- Update `CLIENT_URL` and `REACT_APP_SERVER_URL` accordingly

## Development Notes

- The app gracefully handles missing API keys
- Fallback functionality ensures core features work without external APIs
- All error messages are user-friendly
- Real-time features work with Socket.io regardless of API status
