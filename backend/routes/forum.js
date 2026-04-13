const express = require('express');
const { body, validationResult } = require('express-validator');
const { ForumPost, ForumReply } = require('../models/Forum');
const { auth, optionalAuth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all forum posts with pagination and filtering
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      tags, 
      page = 1, 
      limit = 10, 
      sortBy = 'lastActivity',
      sortOrder = 'desc',
      search 
    } = req.query;
    
    const filters = { status: 'active' };
    
    if (category) filters.category = category;
    if (tags) filters.tags = { $in: tags.split(',') };
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const posts = await ForumPost.find(filters)
      .populate('author', 'name profileImage userType communityStats.reputation')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await ForumPost.countDocuments(filters);
    
    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// Create new forum post
router.post('/posts', auth, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('content').trim().isLength({ min: 10, max: 5000 }).withMessage('Content must be 10-5000 characters'),
  body('category').isIn([
    'career-advice', 'scholarship-alerts', 'skill-development', 
    'exam-prep', 'study-groups', 'technical-help', 'general-discussion'
  ]).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }
    
    const { title, content, category, tags, language = 'en', difficulty = 'beginner' } = req.body;
    
    const post = new ForumPost({
      title,
      content,
      author: req.user._id,
      category,
      tags: tags || [],
      language,
      difficulty
    });
    
    await post.save();
    await post.populate('author', 'name profileImage userType communityStats.reputation');
    
    // Update user's post count
    await req.user.updateOne({ $inc: { 'communityStats.postsCount': 1 } });
    
    res.status(201).json({
      message: 'Post created successfully',
      post
    });
    
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// Get specific post with replies
router.get('/posts/:postId', optionalAuth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId)
      .populate('author', 'name profileImage userType communityStats.reputation')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name profileImage userType communityStats.reputation'
        },
        options: { sort: { createdAt: 1 } }
      });
    
    if (!post || post.status !== 'active') {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Increment view count
    await post.updateOne({ $inc: { views: 1 } });
    
    res.json({ post });
    
  } catch (error) {
    console.error('Error fetching forum post:', error);
    res.status(500).json({ message: 'Server error fetching post' });
  }
});

// Add reply to post
router.post('/posts/:postId/replies', auth, [
  body('content').trim().isLength({ min: 5, max: 2000 }).withMessage('Reply must be 5-2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }
    
    const post = await ForumPost.findById(req.params.postId);
    if (!post || post.status !== 'active') {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const { content, language = 'en' } = req.body;
    
    const reply = new ForumReply({
      content,
      author: req.user._id,
      post: post._id,
      language,
      isMentorResponse: req.user.userType === 'mentor'
    });
    
    await reply.save();
    await reply.populate('author', 'name profileImage userType communityStats.reputation');
    
    // Add reply to post
    await post.updateOne({ 
      $push: { replies: reply._id },
      lastActivity: new Date()
    });
    
    res.status(201).json({
      message: 'Reply added successfully',
      reply
    });
    
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Server error adding reply' });
  }
});

// Like/unlike post
router.post('/posts/:postId/like', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const existingLike = post.likes.find(like => 
      like.user.toString() === req.user._id.toString()
    );
    
    if (existingLike) {
      // Unlike
      await post.updateOne({
        $pull: { likes: { user: req.user._id } }
      });
      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      await post.updateOne({
        $push: { likes: { user: req.user._id } }
      });
      res.json({ message: 'Post liked', liked: true });
    }
    
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error processing like' });
  }
});

// Get forum categories with post counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await ForumPost.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const categoryInfo = {
      'career-advice': { name: 'Career Advice', description: 'Get guidance on career paths and decisions' },
      'scholarship-alerts': { name: 'Scholarship Alerts', description: 'Latest scholarship opportunities' },
      'skill-development': { name: 'Skill Development', description: 'Learn and improve your skills' },
      'exam-prep': { name: 'Exam Preparation', description: 'Study tips and exam strategies' },
      'study-groups': { name: 'Study Groups', description: 'Find study partners and groups' },
      'technical-help': { name: 'Technical Help', description: 'Get help with coding and technical issues' },
      'general-discussion': { name: 'General Discussion', description: 'Open discussions on various topics' }
    };
    
    const enrichedCategories = categories.map(cat => ({
      category: cat._id,
      count: cat.count,
      ...categoryInfo[cat._id]
    }));
    
    res.json({ categories: enrichedCategories });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

module.exports = router;