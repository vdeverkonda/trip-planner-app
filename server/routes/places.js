const express = require('express');
const axios = require('axios');
const placesService = require('../services/placesService');
const auth = require('../middleware/auth');

const router = express.Router();

// Google Places Autocomplete (MUST come before /:placeId route)
router.get('/autocomplete', async (req, res) => {
  try {
    const { query } = req.query;
    
    console.log('Autocomplete request received:', query); // Debug log
    
    if (!query || query.length < 2) {
      return res.json({ predictions: [] });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    console.log('API Key exists:', !!apiKey); // Debug log
    
    if (!apiKey) {
      // Fallback to mock data if no API key is provided
      console.log('Using mock data fallback'); // Debug log
      const mockLocations = [
        { place_id: 'mock_1', description: 'New York, NY, USA', structured_formatting: { main_text: 'New York', secondary_text: 'NY, USA' } },
        { place_id: 'mock_2', description: 'Los Angeles, CA, USA', structured_formatting: { main_text: 'Los Angeles', secondary_text: 'CA, USA' } },
        { place_id: 'mock_3', description: 'Chicago, IL, USA', structured_formatting: { main_text: 'Chicago', secondary_text: 'IL, USA' } },
        { place_id: 'mock_4', description: 'Houston, TX, USA', structured_formatting: { main_text: 'Houston', secondary_text: 'TX, USA' } },
        { place_id: 'mock_5', description: 'Phoenix, AZ, USA', structured_formatting: { main_text: 'Phoenix', secondary_text: 'AZ, USA' } },
        { place_id: 'mock_6', description: 'Philadelphia, PA, USA', structured_formatting: { main_text: 'Philadelphia', secondary_text: 'PA, USA' } },
        { place_id: 'mock_7', description: 'San Antonio, TX, USA', structured_formatting: { main_text: 'San Antonio', secondary_text: 'TX, USA' } },
        { place_id: 'mock_8', description: 'San Diego, CA, USA', structured_formatting: { main_text: 'San Diego', secondary_text: 'CA, USA' } },
        { place_id: 'mock_9', description: 'Dallas, TX, USA', structured_formatting: { main_text: 'Dallas', secondary_text: 'TX, USA' } },
        { place_id: 'mock_10', description: 'San Jose, CA, USA', structured_formatting: { main_text: 'San Jose', secondary_text: 'CA, USA' } },
        { place_id: 'mock_11', description: 'Austin, TX, USA', structured_formatting: { main_text: 'Austin', secondary_text: 'TX, USA' } },
        { place_id: 'mock_12', description: 'Jacksonville, FL, USA', structured_formatting: { main_text: 'Jacksonville', secondary_text: 'FL, USA' } },
        { place_id: 'mock_13', description: 'San Francisco, CA, USA', structured_formatting: { main_text: 'San Francisco', secondary_text: 'CA, USA' } },
        { place_id: 'mock_14', description: 'Indianapolis, IN, USA', structured_formatting: { main_text: 'Indianapolis', secondary_text: 'IN, USA' } },
        { place_id: 'mock_15', description: 'Seattle, WA, USA', structured_formatting: { main_text: 'Seattle', secondary_text: 'WA, USA' } },
        { place_id: 'mock_16', description: 'Denver, CO, USA', structured_formatting: { main_text: 'Denver', secondary_text: 'CO, USA' } },
        { place_id: 'mock_17', description: 'Boston, MA, USA', structured_formatting: { main_text: 'Boston', secondary_text: 'MA, USA' } },
        { place_id: 'mock_18', description: 'Miami, FL, USA', structured_formatting: { main_text: 'Miami', secondary_text: 'FL, USA' } },
        { place_id: 'mock_19', description: 'Las Vegas, NV, USA', structured_formatting: { main_text: 'Las Vegas', secondary_text: 'NV, USA' } },
        { place_id: 'mock_20', description: 'Nashville, TN, USA', structured_formatting: { main_text: 'Nashville', secondary_text: 'TN, USA' } }
      ];

      const filtered = mockLocations.filter(location =>
        location.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

      console.log('Mock filtered results:', filtered.length); // Debug log
      return res.json({ predictions: filtered });
    }

    // Make request to Google Places API
    console.log('Making Google Places API request'); // Debug log
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input: query,
        key: apiKey,
        types: '(cities)',
        language: 'en'
      }
    });

    console.log('Google Places response:', response.data.predictions?.length || 0, 'results'); // Debug log
    res.json(response.data);
  } catch (error) {
    console.error('Places autocomplete error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch location suggestions',
      predictions: []
    });
  }
});

// Get place details by place_id
router.get('/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      // Mock place details for development
      const mockDetails = {
        place_id: placeId,
        name: 'Mock Location',
        formatted_address: 'Mock Address, City, State, Country',
        geometry: {
          location: {
            lat: 40.7128,
            lng: -74.0060
          }
        },
        address_components: [
          { long_name: 'Mock City', short_name: 'MC', types: ['locality'] },
          { long_name: 'Mock State', short_name: 'MS', types: ['administrative_area_level_1'] },
          { long_name: 'United States', short_name: 'US', types: ['country'] }
        ]
      };
      
      return res.json({ result: mockDetails });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: apiKey,
        fields: 'place_id,name,formatted_address,geometry,address_components'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch place details'
    });
  }
});

// Search places
router.get('/search', auth, async (req, res) => {
  try {
    const { query, lat, lng, radius = 50000 } = req.query;
    
    if (!query || !lat || !lng) {
      return res.status(400).json({ 
        message: 'Query, latitude, and longitude are required' 
      });
    }

    const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const places = await placesService.getNearbyPlaces(
      coordinates, 
      ['tourist_attraction', 'restaurant', 'museum'], 
      'mid_range'
    );

    res.json(places);
  } catch (error) {
    console.error('Places search error:', error);
    res.status(500).json({ message: 'Server error searching places' });
  }
});

// Get place details
router.get('/:placeId', auth, async (req, res) => {
  try {
    // In a real implementation, fetch from Google Places API
    // For now, return mock data
    const placeDetails = {
      placeId: req.params.placeId,
      name: 'Sample Place',
      address: '123 Sample Street',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      rating: 4.2,
      priceLevel: 2,
      category: 'tourist_attraction',
      photos: [],
      reviews: [],
      openingHours: {
        monday: '09:00-17:00',
        tuesday: '09:00-17:00',
        wednesday: '09:00-17:00',
        thursday: '09:00-17:00',
        friday: '09:00-17:00',
        saturday: '10:00-16:00',
        sunday: 'Closed'
      }
    };

    res.json(placeDetails);
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ message: 'Server error fetching place details' });
  }
});

module.exports = router;
