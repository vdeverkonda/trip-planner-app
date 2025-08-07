const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user contacts
router.get('/contacts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('contacts');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.contacts);
  } catch (error) {
    console.error('Contacts fetch error:', error);
    res.status(500).json({ message: 'Server error fetching contacts' });
  }
});

// Add contact
router.post('/contacts', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if contact already exists
    const existingContact = user.contacts.find(contact => contact.email === email);
    if (existingContact) {
      return res.status(400).json({ message: 'Contact already exists' });
    }

    user.contacts.push({ name, email, phone });
    await user.save();

    res.status(201).json({
      message: 'Contact added successfully',
      contact: { name, email, phone }
    });
  } catch (error) {
    console.error('Contact creation error:', error);
    res.status(500).json({ message: 'Server error adding contact' });
  }
});

// Search users by email
router.get('/search', auth, async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }

    const user = await User.findOne({ email }).select('name email avatar');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error searching user' });
  }
});

module.exports = router;
