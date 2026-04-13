const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['Career Advice', 'Scholarship Alerts', 'Study Groups', 'Industry Insights', 'Networking', 'Project Collaboration', 'Internship Opportunities', 'Tech Trends', 'General Discussion'],
    required: true
  },
  groupImage: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator'],
      default: 'member'
    }
  }],
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    maxMembers: {
      type: Number,
      default: 500
    },
    autoModeration: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better performance
groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ category: 1 });
groupSchema.index({ 'members.userId': 1 });
groupSchema.index({ createdBy: 1 });

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to check if user can create groups (only mentors and sponsors)
groupSchema.statics.canCreateGroup = function(userType) {
  return ['mentor', 'sponsor'].includes(userType);
};

// Method to add member
groupSchema.methods.addMember = function(userId) {
  if (!this.members.find(member => member.userId.toString() === userId.toString())) {
    this.members.push({ userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove member
groupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.userId.toString() !== userId.toString());
  return this.save();
};

// Method to check if user is admin
groupSchema.methods.isAdmin = function(userId) {
  return this.admins.includes(userId) || this.createdBy.toString() === userId.toString();
};

module.exports = mongoose.model('Group', groupSchema);