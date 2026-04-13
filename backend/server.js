const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const demoRoutes = require('./routes/demo');
const forumRoutes = require('./routes/forum');
const mentorRoutes = require('./routes/mentor');
const sponsorRoutes = require('./routes/sponsor');
const aiRoutes = require('./routes/ai');
const userRoutes = require('./routes/user');
const communityRoutes = require('./routes/community');
const notificationRoutes = require('./routes/notifications');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
let mongoConnected = false;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edubridge')
.then(() => {
  console.log('✅ Connected to MongoDB');
  mongoConnected = true;
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('🔄 Running in DEMO MODE without database');
  console.log('💡 Use demo credentials: student@demo.com / demo123');
  mongoConnected = false;
});

// Routes - Use demo routes for easy testing
app.use('/api/auth', demoRoutes);
app.use('/api/ai', aiRoutes);  // AI routes work without database
app.use('/api/forum', forumRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/sponsor', sponsorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join group rooms for real-time messaging
  socket.on('join-group', (groupId) => {
    socket.join(`group-${groupId}`);
    console.log(`User ${socket.id} joined group: ${groupId}`);
  });

  // Leave group room
  socket.on('leave-group', (groupId) => {
    socket.leave(`group-${groupId}`);
    console.log(`User ${socket.id} left group: ${groupId}`);
  });

  // Handle real-time group messages
  socket.on('group-message', (data) => {
    // Broadcast to all users in the group
    socket.to(`group-${data.groupId}`).emit('new-message', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Handle message reactions
  socket.on('message-reaction', (data) => {
    socket.to(`group-${data.groupId}`).emit('message-reaction', data);
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    socket.to(`group-${data.groupId}`).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      groupId: data.groupId
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(`group-${data.groupId}`).emit('user-stop-typing', {
      userId: data.userId,
      groupId: data.groupId
    });
  });

  // Handle user online status
  socket.on('user-online', (userId) => {
    socket.broadcast.emit('user-status', { userId, status: 'online' });
  });

  // Join room based on user type and interests (legacy support)
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Handle real-time chat messages (legacy support)
  socket.on('chat-message', (data) => {
    io.to(data.room).emit('message', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Handle mentor session events
  socket.on('mentor-session', (data) => {
    io.to(data.room).emit('session-update', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Broadcast user offline status
    socket.broadcast.emit('user-status', { 
      userId: socket.userId, 
      status: 'offline' 
    });
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`✅ EduBridge server running on port ${PORT}`);
});

module.exports = { app, io };