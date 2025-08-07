const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'location', 'poll', 'suggestion', 'system'],
    default: 'text'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'location']
    },
    url: String,
    filename: String,
    size: Number
  }],
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: Date
  },
  suggestion: {
    type: {
      type: String,
      enum: ['place', 'activity', 'restaurant', 'accommodation']
    },
    place: {
      name: String,
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      },
      placeId: String,
      rating: Number,
      priceLevel: Number
    },
    votes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      vote: {
        type: String,
        enum: ['up', 'down']
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    reactedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ trip: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', messageSchema);
