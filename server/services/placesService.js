const axios = require('axios');

class PlacesService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  // Aggregate preferences from multiple users
  aggregatePreferences(preferencesArray) {
    const aggregated = {
      travelStyle: [],
      interests: [],
      timePreferences: [],
      specialInterests: [],
      budgetRange: 'mid_range',
      mobilityPreferences: []
    };

    const counts = {};

    preferencesArray.forEach(prefs => {
      if (!prefs) return;

      // Count occurrences of each preference
      ['travelStyle', 'interests', 'timePreferences', 'specialInterests', 'mobilityPreferences'].forEach(key => {
        if (prefs[key] && Array.isArray(prefs[key])) {
          prefs[key].forEach(item => {
            if (!counts[key]) counts[key] = {};
            counts[key][item] = (counts[key][item] || 0) + 1;
          });
        }
      });

      // Handle budget range (take most common or default to mid_range)
      const budget = prefs.budgetRange || 'mid_range';
      if (!counts.budgetRange) counts.budgetRange = {};
      counts.budgetRange[budget] = (counts.budgetRange[budget] || 0) + 1;
    });

    // Select preferences that appear in at least 50% of users
    const threshold = Math.ceil(preferencesArray.length / 2);

    Object.keys(counts).forEach(key => {
      if (key === 'budgetRange') {
        // Select most common budget range
        let maxCount = 0;
        let mostCommon = 'mid_range';
        Object.entries(counts[key]).forEach(([budget, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostCommon = budget;
          }
        });
        aggregated[key] = mostCommon;
      } else {
        // Select preferences that meet threshold
        Object.entries(counts[key] || {}).forEach(([item, count]) => {
          if (count >= threshold) {
            aggregated[key].push(item);
          }
        });
      }
    });

    return aggregated;
  }

  // Get place type mappings based on interests
  getPlaceTypes(interests) {
    const typeMapping = {
      beaches: ['natural_feature'],
      mountains: ['natural_feature', 'park'],
      museums: ['museum'],
      restaurants: ['restaurant', 'meal_takeaway'],
      shopping: ['shopping_mall', 'store'],
      nightlife: ['night_club', 'bar'],
      outdoor: ['park', 'campground', 'rv_park'],
      historical: ['museum', 'tourist_attraction'],
      events: ['amusement_park', 'tourist_attraction'],
      festivals: ['tourist_attraction']
    };

    const types = new Set();
    interests.forEach(interest => {
      if (typeMapping[interest]) {
        typeMapping[interest].forEach(type => types.add(type));
      }
    });

    return Array.from(types);
  }

  // Get recommendations along a route
  async getRecommendations({ startLocation, destination, preferences, duration, transportation }) {
    try {
      const recommendations = [];
      const placeTypes = this.getPlaceTypes(preferences.interests || []);

      // Get places near start location
      const startPlaces = await this.getNearbyPlaces(
        startLocation.coordinates,
        placeTypes,
        preferences.budgetRange
      );

      // Get places near destination
      const destPlaces = await this.getNearbyPlaces(
        destination.coordinates,
        placeTypes,
        preferences.budgetRange
      );

      // Get places along the route (simplified - in production, use Directions API)
      const routePlaces = await this.getPlacesAlongRoute(
        startLocation.coordinates,
        destination.coordinates,
        placeTypes,
        preferences.budgetRange
      );

      // Combine and score recommendations
      const allPlaces = [...startPlaces, ...destPlaces, ...routePlaces];
      const uniquePlaces = this.removeDuplicates(allPlaces);
      const scoredPlaces = this.scoreRecommendations(uniquePlaces, preferences);

      // Generate itinerary suggestions
      const itinerary = this.generateItinerary(scoredPlaces, duration, preferences);

      return {
        places: scoredPlaces.slice(0, 20), // Top 20 recommendations
        itinerary
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return { places: [], itinerary: [] };
    }
  }

  // Get nearby places using Google Places API
  async getNearbyPlaces(coordinates, types, budgetRange) {
    if (!this.googleApiKey) {
      return this.getMockPlaces(coordinates, types);
    }

    try {
      const places = [];
      const radius = 50000; // 50km radius

      for (const type of types) {
        const response = await axios.get(`${this.baseUrl}/nearbysearch/json`, {
          params: {
            location: `${coordinates.lat},${coordinates.lng}`,
            radius,
            type,
            key: this.googleApiKey
          }
        });

        if (response.data.results) {
          places.push(...response.data.results.map(place => ({
            placeId: place.place_id,
            name: place.name,
            address: place.vicinity,
            coordinates: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            rating: place.rating || 0,
            priceLevel: place.price_level || 2,
            category: type,
            photos: place.photos || []
          })));
        }
      }

      return places;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return this.getMockPlaces(coordinates, types);
    }
  }

  // Get places along route (simplified implementation)
  async getPlacesAlongRoute(start, end, types, budgetRange) {
    // In a real implementation, use Google Directions API to get route points
    // For now, get places at midpoint
    const midpoint = {
      lat: (start.lat + end.lat) / 2,
      lng: (start.lng + end.lng) / 2
    };

    return this.getNearbyPlaces(midpoint, types, budgetRange);
  }

  // Score recommendations based on preferences
  scoreRecommendations(places, preferences) {
    return places.map(place => {
      let score = place.rating || 0;

      // Adjust score based on budget preference
      const budgetScores = { free: 0, budget: 1, mid_range: 2, luxury: 4 };
      const preferredBudget = budgetScores[preferences.budgetRange] || 2;
      const placeBudget = place.priceLevel || 2;
      
      // Penalize if price level doesn't match preference
      if (Math.abs(placeBudget - preferredBudget) > 1) {
        score -= 0.5;
      }

      // Boost score for special interests
      if (preferences.specialInterests) {
        if (preferences.specialInterests.includes('photography') && place.photos?.length > 0) {
          score += 0.5;
        }
        if (preferences.specialInterests.includes('nature') && 
            ['park', 'natural_feature'].includes(place.category)) {
          score += 0.5;
        }
      }

      return { ...place, score: Math.max(0, score) };
    }).sort((a, b) => b.score - a.score);
  }

  // Generate daily itinerary
  generateItinerary(places, duration, preferences) {
    const itinerary = [];
    const placesPerDay = Math.ceil(places.length / duration);

    for (let day = 1; day <= duration; day++) {
      const dayPlaces = places.slice((day - 1) * placesPerDay, day * placesPerDay);
      const activities = dayPlaces.map((place, index) => ({
        place,
        timeSlot: {
          startTime: this.getTimeSlot(index, preferences.timePreferences),
          duration: this.getActivityDuration(place.category)
        },
        estimatedCost: this.estimateCost(place, preferences.budgetRange)
      }));

      itinerary.push({
        day,
        date: new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000),
        activities
      });
    }

    return itinerary;
  }

  // Helper methods
  getTimeSlot(index, timePreferences) {
    const slots = ['09:00', '11:00', '14:00', '16:00', '18:00'];
    return slots[index % slots.length] || '10:00';
  }

  getActivityDuration(category) {
    const durations = {
      museum: 120,
      restaurant: 90,
      park: 180,
      shopping_mall: 120,
      tourist_attraction: 90
    };
    return durations[category] || 60;
  }

  estimateCost(place, budgetRange) {
    const baseCosts = { free: 0, budget: 15, mid_range: 35, luxury: 75 };
    const multipliers = { 0: 0, 1: 0.5, 2: 1, 3: 1.5, 4: 2.5 };
    
    const baseCost = baseCosts[budgetRange] || 35;
    const multiplier = multipliers[place.priceLevel] || 1;
    
    return {
      amount: Math.round(baseCost * multiplier),
      currency: 'USD'
    };
  }

  removeDuplicates(places) {
    const seen = new Set();
    return places.filter(place => {
      const key = `${place.name}-${place.coordinates.lat}-${place.coordinates.lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Mock data for development/testing
  getMockPlaces(coordinates, types) {
    const mockPlaces = [
      {
        placeId: 'mock1',
        name: 'Beautiful Beach',
        address: 'Coastal Road',
        coordinates: { lat: coordinates.lat + 0.01, lng: coordinates.lng + 0.01 },
        rating: 4.5,
        priceLevel: 1,
        category: 'natural_feature'
      },
      {
        placeId: 'mock2',
        name: 'Historic Museum',
        address: 'Main Street',
        coordinates: { lat: coordinates.lat - 0.01, lng: coordinates.lng - 0.01 },
        rating: 4.2,
        priceLevel: 2,
        category: 'museum'
      },
      {
        placeId: 'mock3',
        name: 'Local Restaurant',
        address: 'Food District',
        coordinates: { lat: coordinates.lat + 0.005, lng: coordinates.lng - 0.005 },
        rating: 4.0,
        priceLevel: 2,
        category: 'restaurant'
      }
    ];

    return mockPlaces.filter(place => types.includes(place.category));
  }
}

module.exports = new PlacesService();
