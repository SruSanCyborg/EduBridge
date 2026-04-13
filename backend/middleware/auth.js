const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Demo users for testing without MongoDB
const demoUsers = [
  {
    _id: '1',
    email: 'student@demo.com',
    name: 'Demo Student',
    userType: 'student',
    isActive: true,
    profileImage: '',
    bio: 'I am a demo student exploring EduBridge'
  },
  {
    _id: '2',
    email: 'mentor@demo.com',
    name: 'Demo Mentor',
    userType: 'mentor',
    isActive: true,
    profileImage: '',
    bio: 'I am a demo mentor helping students succeed'
  },
  {
    _id: '3',
    email: 'sponsor@demo.com',
    name: 'Demo Sponsor',
    userType: 'sponsor',
    isActive: true,
    profileImage: '',
    bio: 'I am a demo sponsor supporting education',
    sponsorProfile: {
      organizationName: 'EduTech Foundation',
      organizationType: 'foundation',
      focusAreas: ['STEM Education', 'Scholarships'],
      totalContributions: 50000,
      isVerified: true
    }
  }
];

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    
    let user;
    try {
      // Try to find user in database first
      if (User.findById) {
        user = await User.findById(decoded.userId).select('-password');
      }
    } catch (dbError) {
      // If database fails, fall back to demo users
      user = null;
    }
    
    // If no database user found, try demo users
    if (!user) {
      user = demoUsers.find(u => u._id === decoded.userId);
    }
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user not found.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}, but got: ${req.user.userType}` 
      });
    }
    
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
      
      let user;
      try {
        // Try to find user in database first
        if (User.findById) {
          user = await User.findById(decoded.userId).select('-password');
        }
      } catch (dbError) {
        // If database fails, fall back to demo users
        user = null;
      }
      
      // If no database user found, try demo users
      if (!user) {
        user = demoUsers.find(u => u._id === decoded.userId);
      }
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  auth,
  authorize,
  optionalAuth
};