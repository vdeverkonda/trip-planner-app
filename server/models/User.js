const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    travelStyle: {
      type: [String],
      enum: ['adventure', 'relaxation', 'cultural', 'nightlife'],
      default: []
    },
    interests: {
      type: [String],
      enum: ['beaches', 'mountains', 'museums', 'restaurants', 'shopping', 'nightlife', 'outdoor', 'historical', 'events', 'festivals'],
      default: []
    },
    timePreferences: {
      type: [String],
      enum: ['early_morning', 'morning', 'afternoon', 'evening', 'night'],
      default: []
    },
    specialInterests: {
      type: [String],
      enum: ['sunsets', 'photography', 'cuisine', 'art', 'nature', 'architecture'],
      default: []
    },
    budgetRange: {
      type: String,
      enum: ['free', 'budget', 'mid_range', 'luxury'],
      default: 'mid_range'
    },
    mobilityPreferences: {
      type: [String],
      enum: ['walking', 'driving', 'public_transport', 'cycling'],
      default: ['walking', 'driving']
    }
  },
  contacts: [{
    name: String,
    email: String,
    phone: String
  }],
  trips: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
