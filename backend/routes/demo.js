const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Demo users for testing without MongoDB
const demoUsers = [
  {
    _id: '1',
    email: 'student@demo.com',
    password: '$2a$12$demo.hash.for.demo123', // demo123
    name: 'Demo Student',
    userType: 'student',
    profileImage: '',
    bio: 'I am a demo student exploring EduBridge',
    communityStats: {
      postsCount: 5,
      helpfulAnswers: 3,
      reputation: 120,
      badges: []
    }
  },
  {
    _id: '2',
    email: 'mentor@demo.com',
    password: '$2a$12$demo.hash.for.demo123', // demo123
    name: 'Demo Mentor',
    userType: 'mentor',
    profileImage: '',
    bio: 'I am a demo mentor helping students succeed',
    mentorProfile: {
      expertise: ['Computer Science', 'Web Development'],
      experience: '5+ years',
      rating: 4.8,
      totalSessions: 150,
      isVerified: true
    }
  },
  {
    _id: '3',
    email: 'sponsor@demo.com',
    password: '$2a$12$demo.hash.for.demo123', // demo123
    name: 'Demo Sponsor',
    userType: 'sponsor',
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

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'demo-secret', { expiresIn: '7d' });
};

// Demo login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find demo user
    const user = demoUsers.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Simple password check for demo (in real app, use bcrypt)
    if (password !== 'demo123') {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Demo register
router.post('/register', (req, res) => {
  try {
    const { email, name, userType } = req.body;
    
    // Check if demo user already exists
    const existingUser = demoUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new demo user
    const newUser = {
      _id: (demoUsers.length + 1).toString(),
      email,
      name,
      userType,
      password: '$2a$12$demo.hash.for.demo123',
      profileImage: '',
      bio: `I am a new ${userType} on EduBridge`,
      communityStats: {
        postsCount: 0,
        helpfulAnswers: 0,
        reputation: 0,
        badges: []
      }
    };
    
    // Add to demo users
    demoUsers.push(newUser);
    
    // Generate token
    const token = generateToken(newUser._id);
    
    // Remove password from response
    const userResponse = { ...newUser };
    delete userResponse.password;
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Demo registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Demo profile
router.get('/profile', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    const user = demoUsers.find(u => u._id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token or user not found.' });
    }
    
    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json({ user: userResponse });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
});

module.exports = router;