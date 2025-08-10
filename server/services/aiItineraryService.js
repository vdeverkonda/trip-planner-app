const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIItineraryService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || "gemini-1.5-pro";
    
    if (this.apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: this.modelName });
        this.isAvailable = true;
        console.log(`✅ Gemini AI initialized with model: ${this.modelName}`);
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
        this.isAvailable = false;
      }
    } else {
      console.warn('GEMINI_API_KEY not found. AI features will be disabled.');
      this.isAvailable = false;
    }
  }

  async generateItinerary(tripData) {
    try {
      const trip = tripData.trip || tripData;
      const userId = tripData.userId;
      const user = tripData.user;
      const guidance = tripData.guidance || '';
      
      // Check if AI is available
      if (!this.isAvailable) {
        console.log('AI not available, generating fallback itinerary');
        return this.generateFallbackItinerary(trip, userId, user);
      }
      
      const prompt = this.buildPrompt(trip, user, guidance);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseItineraryResponse(text, trip, userId);
    } catch (error) {
      console.error('AI Itinerary Generation Error:', error);
      
      // If AI fails, fall back to basic itinerary
      console.log('AI generation failed, using fallback itinerary');
      const trip = tripData.trip || tripData;
      const userId = tripData.userId;
      const user = tripData.user;
      return this.generateFallbackItinerary(trip, userId, user);
    }
  }

  generateFallbackItinerary(trip, userId, user = null) {
    const startDate = new Date(trip.dates.startDate);
    const endDate = new Date(trip.dates.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const preferences = trip.preferences?.aggregated || {};
    const interests = preferences.interests || [];
    const travelStyle = preferences.travelStyle || [];
    const budget = preferences.budgetRange || 'mid_range';
    const memberCount = trip.members?.length || 1;
    
    // Use user's personal preferences if available and no group preferences
    const userInterests = user?.preferences?.interests || [];
    const userBudget = user?.preferences?.budgetRange;
    const finalInterests = interests.length > 0 ? interests : userInterests;
    const finalBudget = budget !== 'mid_range' ? budget : (userBudget || 'mid_range');
    
    // Create destination-specific activities based on common interests
    const getDestinationActivities = (destination, day) => {
      const destinationName = destination.name.toLowerCase();
      const activities = [];
      
      // Morning activities based on interests
      if (finalInterests.includes('museums') || finalInterests.includes('historical')) {
        activities.push({
          place: {
            name: `Local Museum or Historical Site - Day ${day}`,
            address: `${destination.name}`,
            coordinates: { lat: 0, lng: 0 },
            placeId: ''
          },
          timeSlot: { startTime: '09:00', endTime: '11:00', duration: 120 },
          estimatedCost: { amount: finalBudget === 'luxury' ? 40 : finalBudget === 'budget' ? 10 : 25, currency: 'USD' },
          notes: `Explore the cultural heritage of ${destination.name}`,
          addedBy: userId,
          status: 'approved'
        });
      } else if (finalInterests.includes('outdoor') || finalInterests.includes('nature')) {
        activities.push({
          place: {
            name: `Nature Walk or Park Visit - Day ${day}`,
            address: `${destination.name}`,
            coordinates: { lat: 0, lng: 0 },
            placeId: ''
          },
          timeSlot: { startTime: '09:00', endTime: '11:00', duration: 120 },
          estimatedCost: { amount: 0, currency: 'USD' },
          notes: `Enjoy the natural beauty of ${destination.name}`,
          addedBy: userId,
          status: 'approved'
        });
      } else {
        activities.push({
          place: {
            name: `City Exploration - Day ${day}`,
            address: `${destination.name}`,
            coordinates: { lat: 0, lng: 0 },
            placeId: ''
          },
          timeSlot: { startTime: '09:00', endTime: '11:00', duration: 120 },
          estimatedCost: { amount: 0, currency: 'USD' },
          notes: `Discover the highlights of ${destination.name}`,
          addedBy: userId,
          status: 'approved'
        });
      }
      
      // Lunch activity
      activities.push({
        place: {
          name: `Local Restaurant - Day ${day}`,
          address: `${destination.name}`,
          coordinates: { lat: 0, lng: 0 },
          placeId: ''
        },
        timeSlot: { startTime: '12:00', endTime: '13:30', duration: 90 },
        estimatedCost: { 
          amount: finalBudget === 'luxury' ? 50 : finalBudget === 'budget' ? 15 : 25, 
          currency: 'USD' 
        },
        notes: `Savor local cuisine in ${destination.name}`,
        addedBy: userId,
        status: 'approved'
      });
      
      // Afternoon activities based on interests
      if (finalInterests.includes('shopping')) {
        activities.push({
          place: {
            name: `Shopping District - Day ${day}`,
            address: `${destination.name}`,
            coordinates: { lat: 0, lng: 0 },
            placeId: ''
          },
          timeSlot: { startTime: '14:00', endTime: '16:00', duration: 120 },
          estimatedCost: { amount: finalBudget === 'luxury' ? 100 : finalBudget === 'budget' ? 20 : 50, currency: 'USD' },
          notes: `Browse local shops and markets in ${destination.name}`,
          addedBy: userId,
          status: 'approved'
        });
      } else if (finalInterests.includes('restaurants') || finalInterests.includes('cuisine')) {
        activities.push({
          place: {
            name: `Food Tour or Cooking Class - Day ${day}`,
            address: `${destination.name}`,
            coordinates: { lat: 0, lng: 0 },
            placeId: ''
          },
          timeSlot: { startTime: '14:00', endTime: '16:00', duration: 120 },
          estimatedCost: { amount: finalBudget === 'luxury' ? 80 : finalBudget === 'budget' ? 30 : 60, currency: 'USD' },
          notes: `Experience the culinary scene of ${destination.name}`,
          addedBy: userId,
          status: 'approved'
        });
      } else {
        activities.push({
          place: {
            name: `Local Attraction - Day ${day}`,
            address: `${destination.name}`,
            coordinates: { lat: 0, lng: 0 },
            placeId: ''
          },
          timeSlot: { startTime: '14:00', endTime: '16:00', duration: 120 },
          estimatedCost: { amount: finalBudget === 'luxury' ? 60 : finalBudget === 'budget' ? 15 : 35, currency: 'USD' },
          notes: `Visit a popular attraction in ${destination.name}`,
          addedBy: userId,
          status: 'approved'
        });
      }
      
      // Evening activity for group trips
      if (memberCount > 1 && finalInterests.includes('nightlife')) {
        activities.push({
          place: {
            name: `Evening Entertainment - Day ${day}`,
            address: `${destination.name}`,
            coordinates: { lat: 0, lng: 0 },
            placeId: ''
          },
          timeSlot: { startTime: '19:00', endTime: '21:00', duration: 120 },
          estimatedCost: { amount: finalBudget === 'luxury' ? 70 : finalBudget === 'budget' ? 20 : 40, currency: 'USD' },
          notes: `Enjoy evening activities in ${destination.name}`,
          addedBy: userId,
          status: 'approved'
        });
      }
      
      return activities;
    };
    
    const fallbackItinerary = [];
    
    for (let day = 1; day <= duration; day++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + day - 1);
      
      const activities = getDestinationActivities(trip.destination, day);
      
      fallbackItinerary.push({
        day,
        date: dayDate,
        activities
      });
    }
    
    return fallbackItinerary;
  }

   buildPrompt(trip, user = null, guidance = '') {
    const startDate = new Date(trip.dates.startDate);
    const endDate = new Date(trip.dates.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const preferences = trip.preferences?.aggregated || {};
    const interests = preferences.interests || [];
    const travelStyle = preferences.travelStyle || [];
    const budget = preferences.budgetRange || 'mid_range';
    const timePreferences = preferences.timePreferences || [];
    const specialInterests = preferences.specialInterests || [];
    const mobilityPreferences = preferences.mobilityPreferences || [];
    
    // Get member information for more personalized recommendations
    const memberCount = trip.members?.length || 1;
    const isGroupTrip = memberCount > 1;
    
    // Create detailed context about the trip
    const tripContext = `
TRIP CONTEXT:
- Destination: ${trip.destination.name} (${trip.destination.address || 'Location'})
- Starting Point: ${trip.startLocation.name} (${trip.startLocation.address || 'Location'})
- Trip Duration: ${duration} days (${startDate.toDateString()} to ${endDate.toDateString()})
- Group Size: ${memberCount} ${memberCount === 1 ? 'person' : 'people'}
- Transportation Method: ${trip.transportation}
- Budget Level: ${budget}
- Is Group Trip: ${isGroupTrip ? 'Yes' : 'No'}

USER PREFERENCES:
- Travel Interests: ${interests.length > 0 ? interests.join(', ') : 'General sightseeing and exploration'}
- Travel Style: ${travelStyle.length > 0 ? travelStyle.join(', ') : 'Balanced mix of activities'}
- Time Preferences: ${timePreferences.length > 0 ? timePreferences.join(', ') : 'Flexible timing'}
- Special Interests: ${specialInterests.length > 0 ? specialInterests.join(', ') : 'None specified'}
- Mobility Preferences: ${mobilityPreferences.length > 0 ? mobilityPreferences.join(', ') : 'Walking and standard transport'}
${user ? `- User Name: ${user.name}` : ''}
${user?.preferences ? `- Personal Budget Range: ${user.preferences.budgetRange || 'Not specified'}` : ''}
${user?.preferences?.interests ? `- Personal Interests: ${user.preferences.interests.join(', ')}` : ''}

SPECIFIC REQUIREMENTS:
- Create activities that match the group's interests and travel style
- Consider the budget level (${budget}) for all recommendations
- Account for ${trip.transportation} transportation between locations
- Include realistic travel times between activities
- Provide specific, real locations with addresses when possible
- Consider group dynamics for ${memberCount} people
- Match activities to the specified interests: ${interests.join(', ')}
- Include a mix of popular attractions and local hidden gems
- Consider seasonal factors for ${startDate.toDateString()}
- Provide practical tips and local insights
`;

    return `
You are an expert travel planner and local guide with deep knowledge of ${trip.destination.name}. Create a highly personalized, detailed ${duration}-day itinerary that feels like it was crafted by a local expert who knows the destination intimately.

${tripContext}

USER GUIDANCE (optional):
${guidance || 'No additional guidance provided.'}

EXPERT INSTRUCTIONS:
1. **Research Deeply**: Use your knowledge of ${trip.destination.name} to create authentic, local experiences
2. **Personalize Completely**: Every activity should reflect the group's specific interests and preferences
3. **Consider Logistics**: Account for realistic travel times, opening hours, and seasonal factors
4. **Provide Local Insights**: Include insider tips, best times to visit, and local secrets
5. **Match Budget Precisely**: Ensure all costs align with the ${budget} budget level
6. **Optimize for Group**: Consider group dynamics for ${memberCount} people
7. **Include Hidden Gems**: Mix popular attractions with lesser-known local favorites
8. **Consider Accessibility**: Account for mobility preferences: ${mobilityPreferences.join(', ')}
9. **Time Optimization**: Create logical flow with minimal backtracking
10. **Local Culture**: Include activities that immerse travelers in local culture

DETAILED REQUIREMENTS:
- Research specific locations with real addresses and coordinates
- Provide detailed descriptions with local context and history
- Include practical tips (best times, dress codes, reservations needed)
- Suggest local transportation options between activities
- Consider weather and seasonal factors for ${startDate.toDateString()}
- Include dining recommendations that match the group's cuisine preferences
- Provide alternative options for each activity in case of weather or closures
- Include cost breakdowns and money-saving tips
- Suggest photo opportunities and memorable moments
- Include local customs and etiquette tips

FORMAT REQUIREMENTS:
Return ONLY a valid JSON object with this exact structure:
{
  "itinerary": [
    {
      "day": 1,
      "date": "2024-01-01",
      "activities": [
        {
          "name": "Specific Activity Name",
          "place": {
            "name": "Real Location Name",
            "address": "Complete Street Address, City, State, Country",
            "coordinates": {"lat": 40.7128, "lng": -74.0060}
          },
          "timeSlot": {
            "startTime": "09:00",
            "endTime": "11:00",
            "duration": 120
          },
          "estimatedCost": {
            "amount": 25,
            "currency": "USD"
          },
          "notes": "Detailed description with local insights, tips, and cultural context"
        }
      ]
    }
  ]
}

IMPORTANT: Only return the JSON object. No additional text, explanations, or formatting.
`;
  }

  parseItineraryResponse(responseText, trip, userId) {
    try {
      // Clean the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate and format the itinerary
      if (!parsedResponse.itinerary || !Array.isArray(parsedResponse.itinerary)) {
        throw new Error('Invalid itinerary structure');
      }

      // Add required fields and format dates
      const formattedItinerary = parsedResponse.itinerary.map((day, index) => ({
        day: index + 1,
        date: this.calculateDayDate(trip.dates.startDate, index),
        activities: day.activities.map(activity => ({
          ...activity,
          addedBy: userId,
          status: 'approved',
          place: {
            name: activity.place?.name || activity.name,
            address: activity.place?.address || '',
            coordinates: activity.place?.coordinates || { lat: 0, lng: 0 },
            placeId: activity.place?.placeId || ''
          },
          timeSlot: {
            startTime: activity.timeSlot?.startTime || '09:00',
            endTime: activity.timeSlot?.endTime || '10:00',
            duration: activity.timeSlot?.duration || 60
          },
          estimatedCost: {
            amount: activity.estimatedCost?.amount || 0,
            currency: activity.estimatedCost?.currency || 'USD'
          },
          notes: activity.notes || ''
        }))
      }));

      return formattedItinerary;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI itinerary response');
    }
  }

  calculateDayDate(startDate, dayIndex) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayIndex);
    return date;
  }

  // Check if AI service is available
  isAIAvailable() {
    return this.isAvailable;
  }

  // Get current model information
  getModelInfo() {
    return {
      name: this.modelName,
      available: this.isAvailable,
      apiKey: !!this.apiKey
    };
  }

  // Get available Gemini models
  getAvailableModels() {
    return [
      {
        name: "gemini-1.5-pro",
        description: "Most capable model - Best for complex reasoning and detailed responses",
        capabilities: ["Complex reasoning", "Detailed analysis", "Creative content", "Code generation"],
        useCase: "Best for detailed itinerary planning with specific recommendations"
      },
      {
        name: "gemini-1.5-flash",
        description: "Fast and efficient - Good balance of speed and capability",
        capabilities: ["Fast responses", "Good reasoning", "Creative content"],
        useCase: "Good for quick itinerary generation with decent quality"
      },
      {
        name: "gemini-1.5-flash-lite",
        description: "Fastest model - Lightweight and efficient",
        capabilities: ["Very fast responses", "Basic reasoning", "Simple content"],
        useCase: "Best for basic itinerary generation when speed is priority"
      }
    ];
  }
}

module.exports = new AIItineraryService();