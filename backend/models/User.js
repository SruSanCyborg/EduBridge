const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['student', 'mentor', 'sponsor'],
    default: 'student'
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    country: String,
    state: String,
    city: String
  },
  languages: [{
    type: String,
    enum: ['en', 'hi', 'es', 'fr', 'de', 'pt', 'ar', 'zh', 'ja', 'ko']
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  
  // Student specific fields
  studentProfile: {
    grade: String,
    subjects: [String],
    goals: [String],
    achievements: [{
      title: String,
      description: String,
      date: { type: Date, default: Date.now },
      badgeId: String
    }],
    progress: {
      completedCourses: [String],
      currentCourses: [String],
      skillLevel: { type: Number, default: 0 }
    }
  },
  
  // Mentor specific fields
  mentorProfile: {
    expertise: [String],
    experience: String,
    education: String,
    certifications: [String],
    availability: {
      days: [String],
      timeSlots: [String]
    },
    rating: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false }
  },
  
  // Sponsor specific fields
  sponsorProfile: {
    organizationName: String,
    organizationType: {
      type: String,
      enum: ['ngo', 'corporation', 'foundation', 'individual']
    },
    website: String,
    focusAreas: [String],
    totalContributions: { type: Number, default: 0 },
    activeCampaigns: [String],
    isVerified: { type: Boolean, default: false }
  },
  
  // Community engagement
  communityStats: {
    postsCount: { type: Number, default: 0 },
    helpfulAnswers: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    badges: [{
      name: String,
      earned: { type: Date, default: Date.now }
    }]
  },
  
  // Account status
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
  
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);