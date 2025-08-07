const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  totalBudget: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  budgetPerPerson: {
    amount: Number,
    currency: { type: String, default: 'USD' }
  },
  categories: {
    accommodation: {
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    },
    food: {
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    },
    activities: {
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    },
    transportation: {
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    },
    shopping: {
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    },
    miscellaneous: {
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    }
  },
  expenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  }],
  splitMethod: {
    type: String,
    enum: ['equal', 'custom', 'by_person'],
    default: 'equal'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    share: {
      type: Number,
      default: 1 // for equal split
    },
    totalOwed: {
      type: Number,
      default: 0
    },
    totalPaid: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

const expenseSchema = new mongoose.Schema({
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: true
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  category: {
    type: String,
    enum: ['accommodation', 'food', 'activities', 'transportation', 'shopping', 'miscellaneous'],
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  splitBetween: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    settled: {
      type: Boolean,
      default: false
    }
  }],
  receipt: {
    url: String,
    filename: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  isShared: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Budget = mongoose.model('Budget', budgetSchema);
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = { Budget, Expense };
