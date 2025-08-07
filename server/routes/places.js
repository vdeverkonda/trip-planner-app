const express = require('express');
const placesService = require('../services/placesService');
const auth = require('../middleware/auth');

const router = express.Router();

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
