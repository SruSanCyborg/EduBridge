const mongoose = require('mongoose');

const sponsorOpportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Opportunity details
  type: {
    type: String,
    required: true,
    enum: [
      'scholarship',
      'internship',
      'mentorship',
      'equipment-donation',
      'book-donation',
      'course-sponsorship',
      'event-sponsorship',
      'research-grant'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'technology',
      'healthcare',
      'education',
      'business',
      'arts',
      'sciences',
      'social-work',
      'environment',
      'general'
    ]
  },
  
  // Financial details
  budget: {
    amount: Number,
    currency: { type: String, default: 'USD' },
    type: {
      type: String,
      enum: ['fixed', 'per-student', 'range'],
      default: 'fixed'
    }
  },
  
  // Eligibility criteria
  eligibility: {
    minAge: Number,
    maxAge: Number,
    educationLevel: [String],
    location: {
      countries: [String],
      states: [String],
      cities: [String]
    },
    subjects: [String],
    gpaRequirement: Number,
    otherCriteria: [String]
  },
  
  // Application details
  applicationDeadline: Date,
  selectionDate: Date,
  maxApplicants: Number,
  selectedCount: { type: Number, default: 0 },
  
  // Requirements
  requiredDocuments: [String],
  applicationQuestions: [{
    question: String,
    type: {
      type: String,
      enum: ['text', 'essay', 'multiple-choice', 'file-upload'],
      default: 'text'
    },
    required: { type: Boolean, default: true },
    options: [String] // for multiple-choice
  }],
  
  // Applications
  applications: [{
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['submitted', 'under-review', 'shortlisted', 'selected', 'rejected'],
      default: 'submitted'
    },
    responses: [{
      questionId: String,
      answer: String,
      fileUrl: String
    }],
    documents: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    score: Number,
    reviewNotes: String
  }],
  
  // Status and visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'completed', 'cancelled'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  
  // Engagement metrics
  views: { type: Number, default: 0 },
  likes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  shares: { type: Number, default: 0 },
  
  // AI enhancements
  aiRecommendations: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matchScore: Number,
    reasons: [String]
  }],
  
  // Communication
  updates: [{
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    recipients: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      read: { type: Boolean, default: false }
    }]
  }]
  
}, {
  timestamps: true
});

// Donation tracking schema
const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Donation details
  type: {
    type: String,
    required: true,
    enum: ['monetary', 'equipment', 'books', 'courses', 'mentorship-hours']
  },
  
  // For monetary donations
  amount: {
    value: Number,
    currency: { type: String, default: 'USD' }
  },
  
  // For non-monetary donations
  items: [{
    name: String,
    quantity: Number,
    estimatedValue: Number,
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair'],
      default: 'good'
    }
  }],
  
  // Recipients
  recipients: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receivedAt: Date,
    confirmed: { type: Boolean, default: false }
  }],
  
  // Distribution details
  distributionMethod: {
    type: String,
    enum: ['direct', 'through-mentor', 'school-pickup', 'shipping'],
    default: 'direct'
  },
  status: {
    type: String,
    enum: ['pledged', 'confirmed', 'in-transit', 'delivered', 'cancelled'],
    default: 'pledged'
  },
  
  // Tracking
  trackingInfo: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date
  },
  
  // Impact tracking
  impactMetrics: {
    studentsHelped: Number,
    coursesEnabled: Number,
    sessionsSponsored: Number
  }
  
}, {
  timestamps: true
});

// Campaign schema for coordinated sponsorship drives
const sponsorCampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 3000
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Campaign details
  goal: {
    type: {
      type: String,
      enum: ['monetary', 'student-count', 'item-count'],
      required: true
    },
    target: Number,
    current: { type: Number, default: 0 },
    unit: String // e.g., 'students', 'laptops', 'USD'
  },
  
  // Timeline
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // Participating sponsors
  sponsors: [{
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contribution: {
      type: String,
      enum: ['monetary', 'items', 'mentorship', 'platform']
    },
    pledgedAmount: Number,
    actualAmount: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now }
  }],
  
  // Beneficiaries
  beneficiaries: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    needCategory: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    allocated: { type: Boolean, default: false }
  }],
  
  // Campaign status
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled', 'on-hold'],
    default: 'planning'
  },
  
  // Progress updates
  updates: [{
    title: String,
    content: String,
    images: [String],
    createdAt: { type: Date, default: Date.now }
  }]
  
}, {
  timestamps: true
});

// Indexes
sponsorOpportunitySchema.index({ sponsor: 1, status: 1 });
sponsorOpportunitySchema.index({ type: 1, category: 1 });
sponsorOpportunitySchema.index({ applicationDeadline: 1 });
sponsorOpportunitySchema.index({ 'applications.applicant': 1 });

donationSchema.index({ donor: 1 });
donationSchema.index({ 'recipients.student': 1 });
donationSchema.index({ status: 1 });

sponsorCampaignSchema.index({ organizer: 1 });
sponsorCampaignSchema.index({ status: 1, endDate: 1 });

module.exports = {
  SponsorOpportunity: mongoose.model('SponsorOpportunity', sponsorOpportunitySchema),
  Donation: mongoose.model('Donation', donationSchema),
  SponsorCampaign: mongoose.model('SponsorCampaign', sponsorCampaignSchema)
};