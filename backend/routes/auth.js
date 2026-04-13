const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Demo users storage for when database is not available
let demoUsers = [
  {
    _id: '1',
    email: 'student@demo.com',
    name: 'Demo Student',
    userType: 'student',
    isActive: true,
    isEmailVerified: true,
    profileImage: '',
    bio: 'I am a demo student exploring EduBridge',
    location: { country: 'Demo Country', state: 'Demo State', city: 'Demo City' },
    languages: ['en'],
    preferences: {
      theme: 'system',
      notifications: { email: true, push: true, sms: false }
    },
    studentProfile: {
      grade: 'Undergraduate',
      subjects: ['Computer Science', 'Mathematics'],
      goals: ['Learn programming', 'Get internship'],
      progress: { skillLevel: 3 }
    },
    communityStats: {
      postsCount: 5,
      helpfulAnswers: 12,
      reputation: 150,
      badges: [{ name: 'First Post', earned: new Date() }]
    },
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    email: 'mentor@demo.com',
    name: 'Demo Mentor',
    userType: 'mentor',
    isActive: true,
    isEmailVerified: true,
    profileImage: '',
    bio: 'I am a demo mentor helping students succeed',
    location: { country: 'Demo Country', state: 'Demo State', city: 'Demo City' },
    languages: ['en'],
    preferences: {
      theme: 'system',
      notifications: { email: true, push: true, sms: false }
    },
    mentorProfile: {
      expertise: ['Programming', 'Web Development', 'Career Guidance'],
      experience: '5+ years in tech industry',
      education: 'MS Computer Science',
      certifications: ['AWS Certified', 'Google Cloud Professional'],
      availability: { days: ['Monday', 'Wednesday', 'Friday'], timeSlots: ['18:00-20:00'] },
      rating: 4.8,
      totalSessions: 47,
      isVerified: true
    },
    communityStats: {
      postsCount: 23,
      helpfulAnswers: 89,
      reputation: 750,
      badges: [{ name: 'Mentor Badge', earned: new Date() }]
    },
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    email: 'sponsor@demo.com',
    name: 'Demo Sponsor',
    userType: 'sponsor',
    isActive: true,
    isEmailVerified: true,
    profileImage: '',
    bio: 'I am a demo sponsor supporting education',
    location: { country: 'Demo Country', state: 'Demo State', city: 'Demo City' },
    languages: ['en'],
    preferences: {
      theme: 'system',
      notifications: { email: true, push: true, sms: false }
    },
    sponsorProfile: {
      organizationName: 'EduTech Foundation',
      organizationType: 'foundation',
      website: 'https://edutech-foundation.demo',
      focusAreas: ['STEM Education', 'Scholarships', 'Technology Access'],
      totalContributions: 50000,
      activeCampaigns: ['Tech Scholarship 2024'],
      isVerified: true
    },
    communityStats: {
      postsCount: 8,
      helpfulAnswers: 15,
      reputation: 300,
      badges: [{ name: 'Sponsor Badge', earned: new Date() }]
    },
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Counter for generating new demo user IDs
let demoUserIdCounter = 4;

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register route
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('userType').isIn(['student', 'mentor', 'sponsor']).withMessage('Invalid user type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }
    
    const { email, password, name, userType, bio, location, languages } = req.body;
    let user;
    
    // Try database first
    try {
      // Check if user already exists in database
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      // Create new user in database
      user = new User({
        email,
        password,
        name,
        userType,
        bio: bio || '',
        location: location || {},
        languages: languages || ['en']
      });
      
      await user.save();
      
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      user = userResponse;
      
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Falling back to demo mode for user registration');
      console.log('Registering user:', email, 'with password:', password);
      
      // Check if user already exists in demo storage
      const existingDemoUser = demoUsers.find(u => u.email === email);
      if (existingDemoUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      // Create new demo user with password stored for login validation
      const newUserId = `demo-user-${demoUserIdCounter++}`;
      
      user = {
        _id: newUserId,
        email,
        name,
        userType,
        password: password, // Store the actual password for demo mode validation
        isActive: true,
        isEmailVerified: true,
        profileImage: '',
        bio: bio || `I am a ${userType} using EduBridge`,
        location: location || { country: 'Demo Country', state: 'Demo State', city: 'Demo City' },
        languages: languages || ['en'],
        preferences: {
          theme: 'system',
          notifications: { email: true, push: true, sms: false }
        },
        communityStats: {
          postsCount: 0,
          helpfulAnswers: 0,
          reputation: 50,
          badges: []
        },
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add user type specific profile
      if (userType === 'student') {
        user.studentProfile = {
          grade: 'Not specified',
          subjects: [],
          goals: [],
          progress: { skillLevel: 1 }
        };
      } else if (userType === 'mentor') {
        user.mentorProfile = {
          expertise: [],
          experience: 'Not specified',
          education: 'Not specified',
          certifications: [],
          availability: { days: [], timeSlots: [] },
          rating: 0,
          totalSessions: 0,
          isVerified: false
        };
      } else if (userType === 'sponsor') {
        user.sponsorProfile = {
          organizationName: name,
          organizationType: 'individual',
          website: '',
          focusAreas: [],
          totalContributions: 0,
          activeCampaigns: [],
          isVerified: false
        };
      }
      
      // Add to demo storage
      demoUsers.push(user);
      
      // Remove password from response for demo users
      const userResponse = { ...user };
      delete userResponse.password;
      user = userResponse;
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }
    
    const { email, password } = req.body;
    let user;
    
    // Try database first
    try {
      // Find user in database
      user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Check if account is active
      if (!user.isActive) {
        return res.status(400).json({ message: 'Account is deactivated' });
      }
      
      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Update last login
      await user.updateLastLogin();
      
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      user = userResponse;
      
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Falling back to demo mode for user login');
      console.log('Available demo users:', demoUsers.map(u => ({ email: u.email, id: u._id })));
      
      // Find user in demo storage
      user = demoUsers.find(u => u.email === email);
      console.log('Looking for user:', email, 'Found:', user ? user.email : 'Not found');
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Check if account is active
      if (!user.isActive) {
        return res.status(400).json({ message: 'Account is deactivated' });
      }
      
      // For demo mode, validate passwords properly
      let isValidPassword = false;
      
      // For pre-existing demo users (1, 2, 3), password is 'demo123'
      if (['1', '2', '3'].includes(user._id)) {
        isValidPassword = password === 'demo123';
        console.log('Pre-existing user check:', user._id, 'password:', password, 'valid:', isValidPassword);
      } 
      // For newly registered demo users, check their stored password
      else if (user._id.startsWith('demo-user-')) {
        isValidPassword = password === user.password;
        console.log('New user check:', user._id, 'entered:', password, 'stored:', user.password, 'valid:', isValidPassword);
      }
      
      if (!isValidPassword) {
        console.log('Password validation failed for user:', user._id);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Update last login
      user.lastLogin = new Date();
      
      // Remove password from response for demo users
      const userResponse = { ...user };
      delete userResponse.password;
      user = userResponse;
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful',
      token,
      user
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    let user;
    
    // Try database first
    try {
      user = await User.findById(req.user._id).select('-password');
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Falling back to demo mode for user profile');
      user = demoUsers.find(u => u._id === req.user._id);
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('bio').optional().isLength({ max: 500 }),
  body('languages').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }
    
    const updates = req.body;
    const allowedUpdates = [
      'name', 'bio', 'profileImage', 'location', 'languages', 'preferences',
      'studentProfile', 'mentorProfile', 'sponsorProfile'
    ];
    
    // Filter allowed updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    let user;
    
    // Try database first
    try {
      user = await User.findByIdAndUpdate(
        req.user._id,
        filteredUpdates,
        { new: true, runValidators: true }
      ).select('-password');
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Falling back to demo mode for profile update');
      
      const userIndex = demoUsers.findIndex(u => u._id === req.user._id);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update demo user
      user = { ...demoUsers[userIndex], ...filteredUpdates };
      user.updatedAt = new Date();
      demoUsers[userIndex] = user;
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// Logout (client-side token removal, but we can track it server-side)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Refresh token
router.post('/refresh', auth, async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.json({ 
      message: 'Token refreshed successfully',
      token 
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error refreshing token' });
  }
});

// Forgot password - Demo mode implementation
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address', 
        errors: errors.array() 
      });
    }
    
    const { email } = req.body;
    let user;
    
    // Try database first
    try {
      user = await User.findOne({ email });
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Falling back to demo mode for forgot password');
      user = demoUsers.find(u => u.email === email);
    }
    
    if (!user) {
      // For security, don't reveal whether email exists
      return res.json({ 
        message: 'If an account with this email exists, you will receive password reset instructions.' 
      });
    }
    
    // In demo mode, provide reset instructions directly
    const resetInstructions = {
      message: 'Password reset instructions for demo mode',
      email: email,
      instructions: []
    };
    
    // For pre-existing demo users
    if (['1', '2', '3'].includes(user._id)) {
      resetInstructions.instructions = [
        'This is a demo account.',
        `Your email: ${email}`,
        'Your password: demo123',
        'You can sign in with these credentials.'
      ];
    } 
    // For newly registered demo users
    else if (user._id.startsWith('demo-user-')) {
      resetInstructions.instructions = [
        'This is a demo account you created.',
        `Your email: ${email}`,
        'Please try to remember the password you used when registering.',
        'In demo mode, you can also create a new account with the same email after clearing your browser data.'
      ];
    }
    
    // In a real implementation, you would:
    // 1. Generate a secure reset token
    // 2. Store it with expiration time
    // 3. Send email with reset link
    // 4. Implement reset password route that validates token
    
    res.json({
      message: 'If an account with this email exists, you will receive password reset instructions.',
      demoMode: true,
      resetInstructions: resetInstructions
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error processing request' });
  }
});

// Reset password with token (Demo mode implementation)
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }
    
    const { token, newPassword } = req.body;
    
    // In demo mode, we'll use email as "token" for simplicity
    let user;
    
    // Try database first
    try {
      // In real implementation, find user by valid reset token
      user = await User.findOne({ email: token }); // Using email as token in demo
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Falling back to demo mode for password reset');
      user = demoUsers.find(u => u.email === token);
    }
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Update password
    try {
      // Try database update first
      user.password = newPassword;
      await user.save();
    } catch (dbError) {
      // Fallback to demo mode
      console.log('Updating password in demo mode');
      
      const userIndex = demoUsers.findIndex(u => u.email === token);
      if (userIndex !== -1) {
        demoUsers[userIndex].password = newPassword;
        demoUsers[userIndex].updatedAt = new Date();
      }
    }
    
    res.json({ 
      message: 'Password reset successfully. You can now sign in with your new password.' 
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

module.exports = router;