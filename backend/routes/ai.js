const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Demo auth middleware for AI routes
const demoAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    req.user = { _id: decoded.userId }; // Simple user object for AI routes
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Study Assistant - Answer student doubts
router.post('/study-assistant', demoAuth, async (req, res) => {
  try {
    const { question, context, subject } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an AI study assistant for EduBridge. Help answer this student's question:

Subject: ${subject || 'General'}
Context: ${context || 'No additional context'}
Question: ${question}

Provide a clear, educational answer that helps the student understand the concept. Include examples if helpful.`;
    
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    
    res.json({ answer });
  } catch (error) {
    console.error('AI Study Assistant error:', error);
    res.status(500).json({ message: 'Error generating response' });
  }
});

// AI Summarizer - Summarize discussions and content
router.post('/summarize', demoAuth, async (req, res) => {
  try {
    const { content, type = 'discussion' } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Summarize this ${type} into key points:

${content}

Provide a concise summary with the main points in bullet format.`;
    
    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    
    res.json({ summary });
  } catch (error) {
    console.error('AI Summarizer error:', error);
    res.status(500).json({ message: 'Error generating summary' });
  }
});

// AI Translator - Translate content to different languages
router.post('/translate', demoAuth, async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}:

${text}

Provide only the translation without additional explanation.`;
    
    const result = await model.generateContent(prompt);
    const translation = result.response.text();
    
    res.json({ translation, targetLanguage });
  } catch (error) {
    console.error('AI Translator error:', error);
    res.status(500).json({ message: 'Error translating content' });
  }
});

// AI Recommendations - Suggest mentors, sponsors, or opportunities
router.post('/recommendations', demoAuth, async (req, res) => {
  try {
    const { type, userProfile, preferences } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Based on this user profile, suggest relevant ${type}:

User Profile: ${JSON.stringify(userProfile)}
Preferences: ${JSON.stringify(preferences)}

Provide 3-5 specific recommendations with reasoning.`;
    
    const result = await model.generateContent(prompt);
    const recommendations = result.response.text();
    
    res.json({ recommendations });
  } catch (error) {
    console.error('AI Recommendations error:', error);
    res.status(500).json({ message: 'Error generating recommendations' });
  }
});

// AI Content Moderation
router.post('/moderate', demoAuth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze this content for inappropriate material, spam, or harmful content:

${content}

Respond with JSON: {"safe": true/false, "reason": "explanation", "confidence": 0.0-1.0}`;
    
    const result = await model.generateContent(prompt);
    const moderation = JSON.parse(result.response.text());
    
    res.json(moderation);
  } catch (error) {
    console.error('AI Moderation error:', error);
    res.status(500).json({ message: 'Error moderating content' });
  }
});

module.exports = router;