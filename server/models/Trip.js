const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startLocation: {
    name: { type: String, required: true },
    address: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  destination: {
    name: { type: String, required: true },
    address: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  dates: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  duration: {
    type: Number, // in days
    required: true
  },
  transportation: {
    type: String,
    enum: ['car', 'public_transport', 'walking', 'mixed'],
    default: 'car'
  },
  groupSize: {
    type: Number,
    default: 1
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  itinerary: [{
    day: Number,
    date: Date,
    activities: [{
      place: {
        name: String,
        address: String,
        coordinates: {
          lat: Number,
          lng: Number
        },
        placeId: String, // Google Places ID
        category: String,
        rating: Number,
        priceLevel: Number
      },
      timeSlot: {
        startTime: String, // "09:00"
        endTime: String,   // "11:00"
        duration: Number   // in minutes
      },
      estimatedCost: {
        amount: Number,
        currency: { type: String, default: 'USD' }
      },
      notes: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        vote: {
          type: String,
          enum: ['up', 'down']
        }
      }],
      status: {
        type: String,
        enum: ['suggested', 'approved', 'rejected'],
        default: 'suggested'
      }
    }]
  }],
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  },
  preferences: {
    aggregated: {
      travelStyle: [String],
      interests: [String],
      timePreferences: [String],
      specialInterests: [String],
      budgetRange: String,
      mobilityPreferences: [String]
    }
  },
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'planning'
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for geospatial queries
tripSchema.index({ 'startLocation.coordinates': '2dsphere' });
tripSchema.index({ 'destination.coordinates': '2dsphere' });

module.exports = mongoose.model('Trip', tripSchema);
