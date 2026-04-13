const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -email')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Search users
router.get('/', async (req, res) => {
  try {
    const { userType, skills, location, search, page = 1, limit = 10 } = req.query;
    
    const filters = { isActive: true };
    if (userType) filters.userType = userType;
    if (location) filters['location.country'] = location;
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filters)
      .select('-password -email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'communityStats.reputation': -1 });
    
    const total = await User.countDocuments(filters);
    
    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching users' });
  }
});

module.exports = router;