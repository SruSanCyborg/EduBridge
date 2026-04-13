const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'career-advice',
      'scholarship-alerts',
      'skill-development',
      'exam-prep',
      'study-groups',
      'technical-help',
      'general-discussion',
      'announcements'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Content metadata
  language: {
    type: String,
    default: 'en'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  // Engagement metrics
  views: { type: Number, default: 0 },
  likes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // AI enhancements
  aiSummary: String,
  aiTags: [String],
  sentiment: {
    score: Number,
    label: String
  },
  
  // Status and moderation
  status: {
    type: String,
    enum: ['active', 'closed', 'archived', 'flagged'],
    default: 'active'
  },
  isPinned: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  
  // Replies
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumReply'
  }],
  
  replyCount: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now }
  
}, {
  timestamps: true
});

const forumReplySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    required: true
  },
  
  // Reply metadata
  language: {
    type: String,
    default: 'en'
  },
  
  // AI enhancements
  aiTranslations: [{
    language: String,
    content: String
  }],
  helpfulnessScore: { type: Number, default: 0 },
  
  // Engagement
  likes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'flagged', 'deleted'],
    default: 'active'
  },
  isAcceptedAnswer: { type: Boolean, default: false },
  isMentorResponse: { type: Boolean, default: false }
  
}, {
  timestamps: true
});

// Indexes for better performance
forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ author: 1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ 'likes.user': 1 });

forumReplySchema.index({ post: 1, createdAt: 1 });
forumReplySchema.index({ author: 1 });

// Update reply count when reply is added/removed
forumReplySchema.post('save', async function() {
  const ForumPost = mongoose.model('ForumPost');
  await ForumPost.findByIdAndUpdate(this.post, {
    $inc: { replyCount: 1 },
    lastActivity: new Date()
  });
});

module.exports = {
  ForumPost: mongoose.model('ForumPost', forumPostSchema),
  ForumReply: mongoose.model('ForumReply', forumReplySchema)
};