const express = require('express');
const Trip = require('../models/Trip');
const { Budget } = require('../models/Budget');
const auth = require('../middleware/auth');
const placesService = require('../services/placesService');
const aiItineraryService = require('../services/aiItineraryService');

const router = express.Router();

// Create new trip
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      startLocation,
      destination,
      dates,
      transportation,
      groupSize
    } = req.body;

    // Calculate duration
    const startDate = new Date(dates.startDate);
    const endDate = new Date(dates.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const trip = new Trip({
      title,
      description,
      startLocation,
      destination,
      dates: {
        startDate,
        endDate
      },
      duration,
      transportation,
      groupSize,
      organizer: req.userId,
      members: [{
        user: req.userId,
        role: 'admin'
      }]
    });

    await trip.save();

    // Create initial budget
    const budget = new Budget({
      trip: trip._id,
      totalBudget: { amount: 0, currency: 'USD' },
      participants: [{
        user: req.userId,
        share: 1
      }]
    });

    await budget.save();
    trip.budget = budget._id;
    await trip.save();

    await trip.populate('organizer', 'name email');
    await trip.populate('members.user', 'name email');

    res.status(201).json({
      message: 'Trip created successfully',
      trip
    });
  } catch (error) {
    console.error('Trip creation error:', error);
    res.status(500).json({ message: 'Server error creating trip' });
  }
});

// Get user's trips
router.get('/', auth, async (req, res) => {
  try {
    const trips = await Trip.find({
      $or: [
        { organizer: req.userId },
        { 'members.user': req.userId }
      ]
    })
    .populate('organizer', 'name email')
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    console.error('Trips fetch error:', error);
    res.status(500).json({ message: 'Server error fetching trips' });
  }
});

// Get trip by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('members.user', 'name email')
      .populate('budget');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is a member
    const isMember = trip.members.some(member => 
      member.user._id.toString() === req.userId
    );

    if (!isMember && trip.organizer._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Trip fetch error:', error);
    res.status(500).json({ message: 'Server error fetching trip' });
  }
});

// Update trip
router.put('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user has admin rights
    const userMember = trip.members.find(member => 
      member.user.toString() === req.userId
    );

    if (!userMember || (userMember.role !== 'admin' && trip.organizer.toString() !== req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('organizer', 'name email')
    .populate('members.user', 'name email');

    res.json({
      message: 'Trip updated successfully',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Trip update error:', error);
    res.status(500).json({ message: 'Server error updating trip' });
  }
});

// Add member to trip
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user has admin rights
    const userMember = trip.members.find(member => 
      member.user.toString() === req.userId
    );

    if (!userMember || (userMember.role !== 'admin' && trip.organizer.toString() !== req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find user by email
    const User = require('../models/User');
    const newUser = await User.findOne({ email });
    
    if (!newUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    const isAlreadyMember = trip.members.some(member => 
      member.user.toString() === newUser._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    trip.members.push({
      user: newUser._id,
      role
    });

    await trip.save();
    await trip.populate('members.user', 'name email');

    res.json({
      message: 'Member added successfully',
      trip
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error adding member' });
  }
});

// Generate recommendations
router.post('/:id/recommendations', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('members.user', 'preferences');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is a member
    const isMember = trip.members.some(member => 
      member.user._id.toString() === req.userId
    );

    if (!isMember && trip.organizer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Aggregate preferences from all members
    const allPreferences = trip.members.map(member => member.user.preferences);
    const aggregatedPreferences = placesService.aggregatePreferences(allPreferences);

    // Get recommendations based on route and preferences
    const recommendations = await placesService.getRecommendations({
      startLocation: trip.startLocation,
      destination: trip.destination,
      preferences: aggregatedPreferences,
      duration: trip.duration,
      transportation: trip.transportation
    });

    res.json({
      recommendations,
      aggregatedPreferences
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error generating recommendations' });
  }
});

// Delete trip
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Only organizer can delete trip
    if (trip.organizer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only organizer can delete trip' });
    }

    await Trip.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Trip deletion error:', error);
    res.status(500).json({ message: 'Server error deleting trip' });
  }
});

// Update trip itinerary
router.put('/:id/itinerary', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is a member
    const isMember = trip.members.some(member => 
      member.user.toString() === req.userId
    );

    if (!isMember && trip.organizer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { itinerary } = req.body;
    
    // Validate itinerary structure
    if (!Array.isArray(itinerary)) {
      return res.status(400).json({ message: 'Invalid itinerary format' });
    }

    // Update the trip with new itinerary
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      { itinerary },
      { new: true, runValidators: true }
    )
    .populate('organizer', 'name email')
    .populate('members.user', 'name email');

    res.json({
      message: 'Itinerary updated successfully',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Itinerary update error:', error);
    res.status(500).json({ message: 'Server error updating itinerary' });
  }
});

// Get AI model information
router.get('/ai-model-info', auth, async (req, res) => {
  try {
    const modelInfo = aiItineraryService.getModelInfo();
    const availableModels = aiItineraryService.getAvailableModels();
    
    res.json({
      currentModel: modelInfo,
      availableModels: availableModels
    });
  } catch (error) {
    console.error('Error getting AI model info:', error);
    res.status(500).json({ message: 'Failed to get AI model information' });
  }
});

// Generate AI itinerary
router.post('/:id/ai-itinerary', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('members.user', 'name email');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is trip member or organizer
    const isMember = trip.members.some(member => 
      member.user._id.toString() === req.userId
    );
    const isOrganizer = trip.organizer._id.toString() === req.userId;

    if (!isMember && !isOrganizer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user details for more personalized AI recommendations
    const User = require('../models/User');
    const user = await User.findById(req.userId).select('preferences name');
    
    // Check if AI service is available
    const isAIAvailable = aiItineraryService.isAIAvailable();
    
    // Generate itinerary (AI or fallback) with user context
    const itinerary = await aiItineraryService.generateItinerary({
      trip,
      userId: req.userId,
      user: user
    });

    // Update trip with generated itinerary
    trip.itinerary = itinerary;
    await trip.save();

    const message = isAIAvailable 
      ? 'AI itinerary generated successfully' 
      : 'Basic itinerary generated (AI not available)';

    res.json({
      message,
      itinerary,
      aiAvailable: isAIAvailable
    });

  } catch (error) {
    console.error('Itinerary generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate itinerary',
      error: error.message 
    });
  }
});

module.exports = router;
