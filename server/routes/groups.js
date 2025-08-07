const express = require('express');
const Message = require('../models/Message');
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');

const router = express.Router();

// Get messages for a trip
router.get('/:tripId/messages', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is a member
    const isMember = trip.members.some(member => 
      member.user.toString() === req.userId
    ) || trip.organizer.toString() === req.userId;

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ trip: req.params.tripId })
      .populate('sender', 'name email avatar')
      .populate('replyTo')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// Send message
router.post('/:tripId/messages', auth, async (req, res) => {
  try {
    const { content, messageType, attachments, poll, suggestion, replyTo } = req.body;
    
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is a member
    const isMember = trip.members.some(member => 
      member.user.toString() === req.userId
    ) || trip.organizer.toString() === req.userId;

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = new Message({
      trip: req.params.tripId,
      sender: req.userId,
      content,
      messageType: messageType || 'text',
      attachments: attachments || [],
      poll,
      suggestion,
      replyTo
    });

    await message.save();
    await message.populate('sender', 'name email avatar');

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Message creation error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

// Vote on poll
router.post('/messages/:messageId/poll/vote', auth, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    
    const message = await Message.findById(req.params.messageId);
    if (!message || message.messageType !== 'poll') {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is a member of the trip
    const trip = await Trip.findById(message.trip);
    const isMember = trip.members.some(member => 
      member.user.toString() === req.userId
    ) || trip.organizer.toString() === req.userId;

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove existing vote from user
    message.poll.options.forEach(option => {
      option.votes = option.votes.filter(vote => 
        vote.user.toString() !== req.userId
      );
    });

    // Add new vote
    if (message.poll.options[optionIndex]) {
      message.poll.options[optionIndex].votes.push({
        user: req.userId
      });
    }

    await message.save();

    res.json({
      message: 'Vote recorded successfully',
      poll: message.poll
    });
  } catch (error) {
    console.error('Poll vote error:', error);
    res.status(500).json({ message: 'Server error recording vote' });
  }
});

// Vote on suggestion
router.post('/messages/:messageId/suggestion/vote', auth, async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    
    const message = await Message.findById(req.params.messageId);
    if (!message || message.messageType !== 'suggestion') {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    // Check if user is a member of the trip
    const trip = await Trip.findById(message.trip);
    const isMember = trip.members.some(member => 
      member.user.toString() === req.userId
    ) || trip.organizer.toString() === req.userId;

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove existing vote from user
    message.suggestion.votes = message.suggestion.votes.filter(v => 
      v.user.toString() !== req.userId
    );

    // Add new vote
    message.suggestion.votes.push({
      user: req.userId,
      vote
    });

    await message.save();

    res.json({
      message: 'Vote recorded successfully',
      suggestion: message.suggestion
    });
  } catch (error) {
    console.error('Suggestion vote error:', error);
    res.status(500).json({ message: 'Server error recording vote' });
  }
});

// Add reaction to message
router.post('/messages/:messageId/reactions', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is a member of the trip
    const trip = await Trip.findById(message.trip);
    const isMember = trip.members.some(member => 
      member.user.toString() === req.userId
    ) || trip.organizer.toString() === req.userId;

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove existing reaction from user with same emoji
    message.reactions = message.reactions.filter(reaction => 
      !(reaction.user.toString() === req.userId && reaction.emoji === emoji)
    );

    // Add new reaction
    message.reactions.push({
      user: req.userId,
      emoji
    });

    await message.save();

    res.json({
      message: 'Reaction added successfully',
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Reaction error:', error);
    res.status(500).json({ message: 'Server error adding reaction' });
  }
});

module.exports = router;
