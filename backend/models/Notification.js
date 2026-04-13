const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // System notifications won't have a sender
  },
  
  // Notification details
  type: {
    type: String,
    required: true,
    enum: [
      'application_status_update',
      'new_application',
      'opportunity_created',
      'message_received',
      'mention',
      'system_update',
      'payment_received',
      'deadline_reminder'
    ]
  },
  
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Related data
  relatedData: {
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'SponsorOpportunity' },
    applicationId: { type: mongoose.Schema.Types.ObjectId },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    messageId: { type: mongoose.Schema.Types.ObjectId },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Action URL for redirecting when clicked
  actionUrl: String,
  
  // Status
  read: {
    type: Boolean,
    default: false
  },
  
  readAt: Date,
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Delivery channels
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },
  
  // Delivery status
  delivered: {
    inApp: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },
  
  deliveredAt: {
    inApp: Date,
    email: Date,
    push: Date,
    sms: Date
  },
  
  // Metadata
  metadata: {
    applicationStatus: String,
    opportunityTitle: String,
    sponsorName: String,
    amount: Number,
    currency: String
  },
  
  // Auto-deletion
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
  
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static methods
notificationSchema.statics.createApplicationStatusNotification = async function(applicationData) {
  const { applicant, opportunity, status, reviewNotes } = applicationData;
  
  const statusMessages = {
    'under-review': 'Your application is now under review',
    'shortlisted': 'Congratulations! Your application has been shortlisted',
    'selected': 'Excellent news! You have been selected',
    'rejected': 'Your application was not selected this time'
  };
  
  const statusEmojis = {
    'under-review': '👀',
    'shortlisted': '⭐',
    'selected': '🎉',
    'rejected': '💙'
  };
  
  const priorities = {
    'under-review': 'medium',
    'shortlisted': 'high',
    'selected': 'high',
    'rejected': 'medium'
  };
  
  return await this.create({
    recipient: applicant,
    type: 'application_status_update',
    title: `${statusEmojis[status]} Application Update: ${opportunity.title}`,
    message: `${statusMessages[status]}${reviewNotes ? `\n\nReview Notes: ${reviewNotes}` : ''}`,
    relatedData: {
      opportunityId: opportunity._id,
      applicationId: applicationData.applicationId
    },
    actionUrl: `/sponsors/applications`,
    priority: priorities[status],
    channels: {
      inApp: true,
      email: status === 'selected' || status === 'rejected'
    },
    metadata: {
      applicationStatus: status,
      opportunityTitle: opportunity.title,
      sponsorName: opportunity.sponsor.name || opportunity.sponsor.sponsorProfile?.organizationName
    }
  });
};

notificationSchema.statics.createNewApplicationNotification = async function(applicationData) {
  const { sponsor, opportunity, applicant } = applicationData;
  
  return await this.create({
    recipient: sponsor,
    type: 'new_application',
    title: `📩 New Application Received`,
    message: `${applicant.name} has applied for "${opportunity.title}"`,
    relatedData: {
      opportunityId: opportunity._id,
      applicationId: applicationData.applicationId,
      userId: applicant._id
    },
    actionUrl: `/sponsor/dashboard/applications/${opportunity._id}`,
    priority: 'medium',
    channels: {
      inApp: true,
      email: true
    },
    metadata: {
      opportunityTitle: opportunity.title,
      applicantName: applicant.name
    }
  });
};

// Instance methods
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);