# Google Places API Setup Guide

## Overview
This guide will help you set up Google Places API for location autocomplete in your trip planner app.

## Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Note your project ID** for reference

## Step 2: Enable Google Places API

1. **Navigate to APIs & Services** → **Library**
2. **Search for "Places API"**
3. **Click on "Places API"** and **Enable** it
4. **Also enable "Geocoding API"** (recommended for additional features)

## Step 3: Create API Credentials

1. **Go to APIs & Services** → **Credentials**
2. **Click "Create Credentials"** → **API Key**
3. **Copy the generated API key**
4. **Click "Restrict Key"** for security

## Step 4: Configure API Key Restrictions (Recommended)

### Application Restrictions:
- **Select "HTTP referrers (web sites)"**
- **Add your domains**:
  - `http://localhost:3000/*` (for development)
  - `http://localhost:5001/*` (for backend)
  - `https://yourdomain.com/*` (for production)

### API Restrictions:
- **Select "Restrict key"**
- **Choose these APIs**:
  - Places API
  - Geocoding API

## Step 5: Add API Key to Your App

1. **Copy your API key**
2. **Add to server/.env**:
   ```bash
   GOOGLE_PLACES_API_KEY=your_actual_api_key_here
   ```
3. **Restart your backend server**

## Step 6: Test the Integration

1. **Start your app**:
   ```bash
   # Terminal 1 - Backend
   cd server && npm start
   
   # Terminal 2 - Frontend  
   cd client && npm start
   ```

2. **Go to trip creation** and test location autocomplete
3. **Type in location fields** - you should see real Google Places suggestions

## Pricing Information

- **Free tier**: 1,000 requests per month
- **Pay-as-you-go**: $17 per 1,000 requests after free tier
- **For development**: Free tier is usually sufficient

## Troubleshooting

### Common Issues:

**"API key not valid"**
- Check that Places API is enabled
- Verify API key is correct in .env file
- Restart your server after adding the key

**"This API project is not authorized"**
- Add your domain to HTTP referrer restrictions
- Make sure localhost:3000 and localhost:5001 are allowed

**"Quota exceeded"**
- You've hit the free tier limit
- Either wait for next month or enable billing

**No suggestions appearing**
- Check browser console for errors
- Verify backend server is running on correct port
- Check that GOOGLE_PLACES_API_KEY is set in server/.env

### Fallback Behavior:
If no API key is provided, the app will automatically use mock data with major US cities, so the feature still works during development.

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** only
3. **Set up API restrictions** to prevent unauthorized usage
4. **Monitor usage** in Google Cloud Console
5. **Rotate keys** periodically

## Next Steps

Once Google Places is working:
- The autocomplete will show real cities worldwide
- Coordinates will be accurate for mapping features
- You can expand to include landmarks, airports, etc.
- Consider adding place photos and ratings in the future
