const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIItineraryService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async generateItinerary(trip) {
    try {
      const prompt = this.buildPrompt(trip);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseItineraryResponse(text, trip);
    } catch (error) {
      console.error('AI Itinerary Generation Error:', error);
      throw new Error('Failed to generate AI itinerary');
    }
  }

  buildPrompt(trip) {
    const startDate = new Date(trip.dates.startDate);
    const endDate = new Date(trip.dates.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const preferences = trip.preferences?.aggregated || {};
    const interests = preferences.interests || [];
    const travelStyle = preferences.travelStyle || [];
    const budget = preferences.budget || 'moderate';
    
    return `
Create a detailed ${duration}-day itinerary for a trip to ${trip.destination.name} from ${trip.startLocation.name}.

Trip Details:
- Destination: ${trip.destination.name}
- Start Location: ${trip.startLocation.name}
- Duration: ${duration} days
- Start Date: ${startDate.toDateString()}
- End Date: ${endDate.toDateString()}
- Budget Level: ${budget}
- Transportation: ${trip.transportation}
- Group Size: ${trip.groupSize} people

User Preferences:
- Interests: ${interests.join(', ') || 'General sightseeing'}
- Travel Style: ${travelStyle.join(', ') || 'Balanced'}

Please generate a day-by-day itinerary with the following structure for each day:
- 3-5 activities per day
- Include specific locations, addresses when possible
- Suggest realistic time slots (start and end times)
- Estimate costs in USD
- Consider travel time between locations
- Match activities to user interests and budget level
- Include a mix of must-see attractions and local experiences

Format your response as a JSON object with this exact structure:
{
  "itinerary": [
    {
      "day": 1,
      "date": "2024-01-01",
      "activities": [
        {
          "name": "Activity Name",
          "place": {
            "name": "Location Name",
            "address": "Full Address",
            "coordinates": {"lat": 0.0, "lng": 0.0}
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
          "notes": "Brief description or tips"
        }
      ]
    }
  ]
}

Only return the JSON object, no additional text or formatting.
`;
  }

  parseItineraryResponse(responseText, trip) {
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
          addedBy: trip.organizer._id || trip.organizer,
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
}

module.exports = new AIItineraryService();
