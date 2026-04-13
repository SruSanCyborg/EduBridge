const mongoose = require('mongoose');

const mentorSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Session details
  sessionType: {
    type: String,
    enum: ['one-on-one', 'group', 'workshop', 'webinar'],
    required: true
  },
  format: {
    type: String,
    enum: ['video', 'audio', 'chat', 'in-person'],
    default: 'video'
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15,
    max: 180
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  timeZone: {
    type: String,
    required: true
  },
  
  // Capacity and participants
  maxParticipants: {
    type: Number,
    default: 1
  },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'no-show'],
      default: 'registered'
    }
  }],
  
  // Session content
  topics: [String],
  prerequisites: [String],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'presentation']
    }
  }],
  
  // Meeting details
  meetingLink: String,
  meetingPassword: String,
  roomId: String,
  
  // Recording and transcript
  recording: {
    url: String,
    duration: Number,
    isPublic: { type: Boolean, default: false }
  },
  transcript: {
    content: String,
    language: String,
    aiSummary: String,
    keyPoints: [String]
  },
  
  // Session status
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  
  // Feedback and ratings
  feedback: [{
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    isAnonymous: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // AI enhancements
  aiInsights: {
    engagementScore: Number,
    participationMetrics: {
      questionsAsked: Number,
      activeParticipants: Number,
      averageAttentionSpan: Number
    },
    suggestedFollowUp: [String]
  }
  
}, {
  timestamps: true
});

// Booking/reservation schema for session slots
const sessionBookingSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorSession',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['free', 'paid', 'pending', 'refunded'],
    default: 'free'
  },
  specialRequests: String,
  reminderSent: { type: Boolean, default: false },
  
}, {
  timestamps: true
});

// Mentor availability schema
const mentorAvailabilitySchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOfWeek: {
    type: Number, // 0-6 (Sunday-Saturday)
    required: true
  },
  timeSlots: [{
    startTime: String, // "09:00"
    endTime: String,   // "10:00"
    isAvailable: { type: Boolean, default: true },
    sessionType: {
      type: String,
      enum: ['one-on-one', 'group', 'both'],
      default: 'both'
    }
  }],
  timeZone: {
    type: String,
    required: true
  },
  
  // Recurring unavailability
  blockedDates: [{
    start: Date,
    end: Date,
    reason: String
  }]
  
}, {
  timestamps: true
});

// Indexes
mentorSessionSchema.index({ mentor: 1, scheduledDate: 1 });
mentorSessionSchema.index({ status: 1 });
mentorSessionSchema.index({ 'participants.user': 1 });

sessionBookingSchema.index({ student: 1, bookingStatus: 1 });
sessionBookingSchema.index({ session: 1 });

mentorAvailabilitySchema.index({ mentor: 1, dayOfWeek: 1 });

module.exports = {
  MentorSession: mongoose.model('MentorSession', mentorSessionSchema),
  SessionBooking: mongoose.model('SessionBooking', sessionBookingSchema),
  MentorAvailability: mongoose.model('MentorAvailability', mentorAvailabilitySchema)
};