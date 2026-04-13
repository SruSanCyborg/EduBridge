const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'link', 'poll', 'announcement'],
    default: 'text'
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedAt: Date,
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiContext: {
    type: String,
    enum: ['faq', 'summary', 'translation', 'moderation'],
    default: null
  },
  moderation: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'flagged', 'rejected'],
      default: 'approved'
    },
    flagReason: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ group: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ content: 'text' });
messageSchema.index({ replyTo: 1 });

// Virtual for reply count (if this message is replied to)
messageSchema.virtual('replyCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'replyTo',
  count: true
});

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  // Add new reaction
  this.reactions.push({ userId, emoji });
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  return this.save();
};

// Method to mark as read by user
messageSchema.methods.markAsRead = function(userId) {
  if (!this.readBy.find(r => r.userId.toString() === userId.toString())) {
    this.readBy.push({ userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method for AI-generated messages
messageSchema.statics.createAIMessage = function(groupId, content, aiContext) {
  return this.create({
    content,
    group: groupId,
    sender: null, // AI messages don't have a sender
    aiGenerated: true,
    aiContext,
    messageType: 'text'
  });
};

module.exports = mongoose.model('Message', messageSchema);