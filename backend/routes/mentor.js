const express = require('express');
const { MentorSession, SessionBooking, MentorAvailability } = require('../models/MentorSession');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get mentor sessions
router.get('/sessions', auth, authorize('mentor'), async (req, res) => {
  try {
    const sessions = await MentorSession.find({ mentor: req.user._id })
      .populate('participants.user', 'name email profileImage')
      .sort({ scheduledDate: 1 });
    
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
});

// Create new session
router.post('/sessions', auth, authorize('mentor'), async (req, res) => {
  try {
    const sessionData = { ...req.body, mentor: req.user._id };
    const session = new MentorSession(sessionData);
    await session.save();
    
    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Error creating session' });
  }
});

// Book session (for students)
router.post('/sessions/:sessionId/book', auth, authorize('student'), async (req, res) => {
  try {
    const session = await MentorSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({ message: 'Session is full' });
    }
    
    session.participants.push({
      user: req.user._id,
      status: 'registered'
    });
    
    await session.save();
    res.json({ message: 'Session booked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error booking session' });
  }
});

module.exports = router;