const express = require('express');
const jwt = require('jsonwebtoken');
const Group = require('../models/Group');
const Message = require('../models/Message');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { demoGroups, demoMessages } = require('./demo-groups');
const router = express.Router();

// Demo users for getting user profiles
const demoUsers = [
  {
    _id: '1',
    email: 'student@demo.com',
    name: 'Demo Student',
    userType: 'student'
  },
  {
    _id: '2',
    email: 'mentor@demo.com',
    name: 'Demo Mentor',
    userType: 'mentor'
  },
  {
    _id: '3',
    email: 'sponsor@demo.com',
    name: 'Demo Sponsor',
    userType: 'sponsor'
  }
];

// In-memory storage for demo (in production, this would be in database)
const userGroupMemberships = new Map(); // userId -> Set of groupIds

// Demo auth middleware
const demoAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    req.user = { _id: decoded.userId }; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get all groups (with user membership info)
router.get('/groups', demoAuth, async (req, res) => {
  try {
    const { category, search, joined } = req.query;
    
    // Use demo data for now (works without MongoDB)
    let groups = [...demoGroups];
    
    // Apply category filter
    if (category && category !== 'All') {
      groups = groups.filter(group => group.category === category);
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      groups = groups.filter(group => 
        group.name.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower) ||
        group.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Get user's joined groups
    const userJoinedGroups = userGroupMemberships.get(req.user._id) || new Set();
    
    // Add user membership status (demo logic)
    groups = groups.map(group => {
      const isMember = userJoinedGroups.has(group._id);
      return {
        ...group,
        isMember,
        isAdmin: false, // Demo users are not admins initially
        canJoin: !isMember && group.memberCount < 500
      };
    });
    
    // Filter by joined status if requested
    if (joined === 'true') {
      groups = groups.filter(group => group.isMember);
    }
    
    res.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Error fetching groups' });
  }
});

// Create a new group (mentors and sponsors only)
router.post('/groups', demoAuth, async (req, res) => {
  try {
    const { name, description, category, tags, settings } = req.body;
    
    // Demo check - in real app, get user type from database
    const userType = 'mentor'; // Demo default - in real app get from user profile
    
    if (!['mentor', 'sponsor'].includes(userType)) {
      return res.status(403).json({ 
        message: 'Only mentors and sponsors can create groups' 
      });
    }
    
    // Create demo group object
    const newGroup = {
      _id: `demo-group-new-${Date.now()}`,
      name,
      description,
      category,
      tags: tags || [],
      memberCount: 1,
      isMember: true,
      canJoin: false,
      isAdmin: true,
      createdBy: {
        name: 'Demo User',
        userType: userType
      },
      stats: {
        lastActivity: new Date().toISOString(),
        totalMessages: 0
      },
      settings: settings || {}
    };
    
    // Add to demo groups (in memory)
    demoGroups.push(newGroup);
    
    // Add creator to group membership
    const userId = req.user._id;
    if (!userGroupMemberships.has(userId)) {
      userGroupMemberships.set(userId, new Set());
    }
    userGroupMemberships.get(userId).add(newGroup._id);
    
    console.log(`New group created: ${newGroup.name} by user ${userId}`);
    
    res.status(201).json({ group: newGroup });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Error creating group' });
  }
});

// Join a group
router.post('/groups/:groupId/join', demoAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    // Find group in demo data
    const group = demoGroups.find(g => g._id === groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Add user to group membership tracking
    if (!userGroupMemberships.has(userId)) {
      userGroupMemberships.set(userId, new Set());
    }
    userGroupMemberships.get(userId).add(groupId);
    
    console.log(`User ${userId} joined group ${groupId}`);
    
    res.json({ message: 'Successfully joined group' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Error joining group' });
  }
});

// Leave a group
router.post('/groups/:groupId/leave', demoAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    // Find group in demo data
    const group = demoGroups.find(g => g._id === groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Don't allow creator to leave (demo check)
    if (group.createdBy && group.createdBy._id === userId) {
      return res.status(400).json({ message: 'Group creator cannot leave the group' });
    }
    
    // Remove user from group membership tracking
    const userJoinedGroups = userGroupMemberships.get(userId);
    if (userJoinedGroups) {
      userJoinedGroups.delete(groupId);
    }
    
    console.log(`User ${userId} left group ${groupId}`);
    
    res.json({ message: 'Successfully left group' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Error leaving group' });
  }
});

// Get messages for a group
router.get('/groups/:groupId/messages', demoAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    // Check if user is member of the group
    const userJoinedGroups = userGroupMemberships.get(userId) || new Set();
    if (!userJoinedGroups.has(groupId)) {
      return res.status(403).json({ message: 'You must be a member to view messages' });
    }
    
    // Use demo messages
    const messages = demoMessages[groupId] || [];
    
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a message
router.post('/groups/:groupId/messages', demoAuth, async (req, res) => {
  try {
    const { content, messageType = 'text', replyTo, mentions } = req.body;
    const { groupId } = req.params;
    const userId = req.user._id;
    
    // Check if user is member of the group
    const userJoinedGroups = userGroupMemberships.get(userId) || new Set();
    if (!userJoinedGroups.has(groupId)) {
      return res.status(403).json({ message: 'You must be a member to send messages' });
    }
    
    // Get user profile
    const user = demoUsers.find(u => u._id === userId);
    const senderInfo = user ? {
      _id: user._id,
      name: user.name,
      userType: user.userType
    } : {
      _id: userId,
      name: 'Demo User',
      userType: 'student'
    };

    // Create demo message object
    const message = {
      _id: `msg-${Date.now()}`,
      content,
      sender: senderInfo,
      createdAt: new Date().toISOString(),
      messageType,
      aiGenerated: false,
      reactions: [],
      replyTo: replyTo || null,
      group: groupId
    };
    
    // Add to demo messages (in memory for demo)
    if (!demoMessages[groupId]) {
      demoMessages[groupId] = [];
    }
    demoMessages[groupId].push(message);
    
    // Auto-moderation check if enabled
    let shouldBlock = false;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analyze this message for inappropriate content, spam, or toxicity. Respond with only "SAFE" or "UNSAFE":

"${content}"`;
      
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text().trim().toLowerCase();
      
      if (aiResponse.includes('unsafe')) {
        shouldBlock = true;
        console.log('Message blocked by AI moderation:', content);
        return res.status(400).json({ message: 'Message blocked by moderation' });
      }
    } catch (aiError) {
      console.log('AI moderation failed, approving message');
    }
    
    // Check for hashtag AI assistance (#) - and check if mentor has AI assist enabled
    const hasHashtag = content.includes('#');
    const hasQuestion = content.toLowerCase().includes('?');
    
    // Find group to check if AI assist is enabled (in real app, this would be from database)
    const group = demoGroups.find(g => g._id === groupId);
    const aiAssistEnabled = group ? (group.settings?.aiAssistEnabled !== false) : true; // Default enabled
    
    // AI assistance logic - only if AI assist is enabled for this group
    if ((hasHashtag || hasQuestion) && !replyTo && !shouldBlock && aiAssistEnabled) {
      setTimeout(async () => {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          let prompt;
          
          if (hasHashtag) {
            // Hashtag AI assistance - more comprehensive help
            prompt = `A user used "#" in their message, requesting AI assistance. Provide helpful, educational guidance on their query:

Message: "${content}"

Provide a comprehensive, helpful response as an AI educational assistant. Focus on being educational and supportive.`;
          } else {
            // Regular FAQ for questions
            prompt = `This is a question from a student. If this is a common FAQ, provide a helpful answer. If it's too specific, respond with "SKIP".

Question: "${content}"

Provide a helpful educational response if it's a FAQ, otherwise respond with "SKIP".`;
          }
          
          const result = await model.generateContent(prompt);
          const aiAnswer = result.response.text().trim();
          
          const shouldRespond = hasHashtag || (!aiAnswer.startsWith('SKIP') && aiAnswer.length > 20);
          
          if (shouldRespond) {
            const aiMessage = {
              _id: `ai-msg-${Date.now()}`,
              content: `🤖 **AI Assistant**: ${aiAnswer}`,
              sender: null,
              createdAt: new Date().toISOString(),
              messageType: 'text',
              aiGenerated: true,
              reactions: [],
              replyTo: {
                content: content,
                sender: senderInfo
              },
              group: groupId
            };
            
            demoMessages[groupId].push(aiMessage);
            console.log(`AI responded to ${hasHashtag ? 'hashtag' : 'question'} in group ${groupId}`);
          }
        } catch (aiError) {
          console.log('AI response failed:', aiError);
        }
      }, 2000);
    }
    
    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Add reaction to message
router.post('/messages/:messageId/react', demoAuth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const { messageId } = req.params;
    const userId = req.user._id;
    
    // Find message in demo data across all groups
    let foundMessage = null;
    let foundGroupId = null;
    
    for (const [groupId, messages] of Object.entries(demoMessages)) {
      const message = messages.find(m => m._id === messageId);
      if (message) {
        foundMessage = message;
        foundGroupId = groupId;
        break;
      }
    }
    
    if (!foundMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is member of the group
    const userJoinedGroups = userGroupMemberships.get(userId) || new Set();
    if (!userJoinedGroups.has(foundGroupId)) {
      return res.status(403).json({ message: 'You must be a member to react to messages' });
    }
    
    // Add or remove reaction
    if (!foundMessage.reactions) {
      foundMessage.reactions = [];
    }
    
    const existingReaction = foundMessage.reactions.find(r => r.userId === userId && r.emoji === emoji);
    if (existingReaction) {
      // Remove reaction
      foundMessage.reactions = foundMessage.reactions.filter(r => !(r.userId === userId && r.emoji === emoji));
    } else {
      // Add reaction
      foundMessage.reactions.push({ userId, emoji });
    }
    
    res.json({ message: 'Reaction updated' });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Error adding reaction' });
  }
});

// Get group summary (AI-powered)
router.get('/groups/:groupId/summary', demoAuth, async (req, res) => {
  try {
    const { days = 1 } = req.query;
    const { groupId } = req.params;
    const userId = req.user._id;
    
    // Find group in demo data
    const group = demoGroups.find(g => g._id === groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is member of the group
    const userJoinedGroups = userGroupMemberships.get(userId) || new Set();
    if (!userJoinedGroups.has(groupId)) {
      return res.status(403).json({ message: 'You must be a member to view summaries' });
    }
    
    // Get messages from demo data
    const messages = demoMessages[groupId] || [];
    
    // Filter messages by date
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentMessages = messages.filter(m => {
      const messageDate = new Date(m.createdAt);
      return messageDate >= since && !m.aiGenerated;
    }).slice(-100); // Get last 100 messages
    
    if (recentMessages.length === 0) {
      return res.json({ summary: 'No recent activity in this group.' });
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const conversationText = recentMessages.map(m => 
        `${m.sender?.name || 'Anonymous'}: ${m.content}`
      ).join('\n');
      
      const prompt = `Summarize the key discussion points from this group chat about "${group.name}" (${group.category}):

${conversationText}

Provide a concise summary with:
• Main topics discussed
• Key questions asked
• Important decisions or announcements
• Action items (if any)

Keep it brief and educational.`;
      
      const result = await model.generateContent(prompt);
      const summary = result.response.text();
      
      res.json({ summary, messageCount: recentMessages.length });
    } catch (aiError) {
      console.log('AI summary generation failed:', aiError);
      res.json({ 
        summary: 'Summary temporarily unavailable. The group has been active with discussions and questions.', 
        messageCount: recentMessages.length 
      });
    }
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Error generating summary' });
  }
});

// AI Translate messages
router.post('/groups/:groupId/translate', demoAuth, async (req, res) => {
  try {
    const { messageIds, targetLanguage = 'en' } = req.body;
    const { groupId } = req.params;
    const userId = req.user._id;
    
    // Check if user is member of the group
    const userJoinedGroups = userGroupMemberships.get(userId) || new Set();
    if (!userJoinedGroups.has(groupId)) {
      return res.status(403).json({ message: 'You must be a member to translate messages' });
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const messages = demoMessages[groupId] || [];
      const messagesToTranslate = messages.filter(m => messageIds.includes(m._id));
      
      const translations = [];
      
      for (const message of messagesToTranslate) {
        const prompt = `Translate this message to ${targetLanguage}. Only return the translation:

"${message.content}"`;
        
        const result = await model.generateContent(prompt);
        const translation = result.response.text().trim();
        
        translations.push({
          messageId: message._id,
          originalContent: message.content,
          translatedContent: translation,
          targetLanguage
        });
      }
      
      res.json({ translations });
    } catch (aiError) {
      console.log('Translation failed:', aiError);
      res.status(500).json({ message: 'Translation service temporarily unavailable' });
    }
  } catch (error) {
    console.error('Translate error:', error);
    res.status(500).json({ message: 'Error translating messages' });
  }
});

// AI FAQ Assistant
router.post('/groups/:groupId/faq', demoAuth, async (req, res) => {
  try {
    const { question } = req.body;
    const { groupId } = req.params;
    const userId = req.user._id;
    
    // Check if user is member of the group
    const userJoinedGroups = userGroupMemberships.get(userId) || new Set();
    if (!userJoinedGroups.has(groupId)) {
      return res.status(403).json({ message: 'You must be a member to use FAQ assistant' });
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const group = demoGroups.find(g => g._id === groupId);
      
      const prompt = `You are an AI assistant for "${group?.name || 'this group'}" (${group?.category || 'General'}). 
Answer this frequently asked question with helpful, educational information:

Question: "${question}"

Provide a comprehensive, helpful answer. Focus on being educational and actionable.`;
      
      const result = await model.generateContent(prompt);
      const answer = result.response.text().trim();
      
      res.json({ 
        question,
        answer,
        category: group?.category || 'General'
      });
    } catch (aiError) {
      console.log('FAQ failed:', aiError);
      res.status(500).json({ message: 'FAQ service temporarily unavailable' });
    }
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({ message: 'Error processing FAQ' });
  }
});

module.exports = router;