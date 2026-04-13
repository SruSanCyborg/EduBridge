# 🌉 EduBridge - AI-Powered Educational Community Platform

**Connecting students, mentors, and sponsors worldwide through intelligent technology**

## ✨ Features

### 🎓 For Students
- **Community Forums** - Discuss career advice, scholarships, skill development, and exam prep
- **Expert Mentorship** - Connect with verified mentors for personalized guidance
- **AI Study Assistant** - Get instant answers to academic questions 24/7  
- **Peer Learning** - Form study groups and collaborate with students globally
- **Multilingual Support** - Learn in your preferred language with real-time translation

### 👨‍🏫 For Mentors
- **Mentor Rooms** - Host live video/audio sessions and workshops
- **Student Matching** - Get matched with students based on expertise and interests
- **Session Management** - Schedule, manage, and track mentorship sessions
- **Impact Tracking** - Monitor your contribution to student success

### 🤝 For Sponsors
- **Sponsor Hub** - Create and manage scholarship/funding opportunities
- **Student Discovery** - Find and connect with talented students to support
- **Impact Analytics** - Track the effectiveness of sponsorship programs
- **Campaign Management** - Organize coordinated sponsorship drives

### 🤖 AI-Powered Features
- **Smart Recommendations** - Personalized mentor and sponsor suggestions
- **Content Moderation** - AI-powered safety and spam filtering  
- **Auto-Translation** - Break language barriers with instant translation
- **Discussion Summarization** - Get key points from long forum discussions
- **Doubt Resolution** - Intelligent academic question answering

## 🏗️ Technical Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js with TypeScript and Tailwind CSS
- **Animations**: Framer Motion + GSAP for smooth, professional animations
- **State Management**: React Context API with custom hooks
- **UI Components**: Custom components with Headless UI
- **Real-time**: Socket.IO client for live chat and updates

### Backend (Node.js/Express)
- **API**: RESTful API with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth with role-based access control
- **Real-time**: Socket.IO server for instant messaging and notifications
- **AI Integration**: Google Gemini API for intelligent features

### Key Technologies
- **Languages**: TypeScript, JavaScript
- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Animation**: Framer Motion, GSAP, React Spring
- **Backend**: Node.js, Express.js, MongoDB
- **Real-time**: Socket.IO
- **AI**: Google Gemini API
- **Authentication**: JWT, bcrypt
- **Validation**: Yup, React Hook Form

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB (local or cloud)
- Google Gemini API key (for AI features)

### Installation

1. **Clone and install dependencies**
   ```bash
   cd edubridge
   npm install
   cd backend && npm install
   ```

2. **Set up environment variables**
   
   **Frontend** (`.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
   
   **Backend** (`.env`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/edubridge
   JWT_SECRET=your-super-secret-jwt-key
   GEMINI_API_KEY=your-gemini-api-key
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend  
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 📁 Project Structure

```
edubridge/
├── src/                          # Next.js frontend
│   ├── app/                      # App Router pages
│   ├── components/               # React components
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utilities
│   └── types/                    # TypeScript types
├── backend/                      # Express.js backend
│   ├── models/                   # MongoDB models
│   ├── routes/                   # API routes
│   ├── middleware/               # Custom middleware
│   └── config/                   # Configuration files
├── public/                       # Static assets
└── docs/                         # Documentation
```

## 🎨 Design Philosophy

- **Gen Z Aesthetic**: Modern, colorful gradients with smooth animations
- **Mobile-First**: Responsive design optimized for all devices
- **Accessibility**: WCAG compliant with proper focus management
- **Performance**: Optimized animations and lazy loading
- **User Experience**: Intuitive navigation with clear visual feedback

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

**Community:**
- `GET /api/forum/posts` - Get forum posts
- `POST /api/forum/posts` - Create new post
- `POST /api/forum/posts/:id/replies` - Add reply

**Mentorship:**
- `GET /api/mentor/sessions` - Get mentor sessions
- `POST /api/mentor/sessions` - Create session
- `POST /api/mentor/sessions/:id/book` - Book session

**AI Features:**
- `POST /api/ai/study-assistant` - Get AI help
- `POST /api/ai/translate` - Translate content
- `POST /api/ai/summarize` - Summarize content

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Create new application on Railway/Heroku
2. Connect GitHub repository
3. Set environment variables
4. Deploy with automatic builds

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas  
2. Get connection string
3. Update MONGODB_URI in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- The open-source community for amazing tools
- All the students, mentors, and sponsors who inspire this platform

---

**Ready to bridge the gap in education? The development environment is ready!** 🚀

## Next Steps

1. Set up your environment variables (copy from .env.example files)
2. Start MongoDB locally or get MongoDB Atlas connection string
3. Get a Google Gemini API key for AI features
4. Run the development servers as described above
5. The platform is ready for further development!

The core infrastructure is complete with:
- ✅ Backend API with authentication, forums, mentors, sponsors, and AI routes
- ✅ Frontend with modern UI, animations, and responsive design  
- ✅ Database models for all major features
- ✅ Real-time communication setup
- ✅ AI integration framework
- ✅ Comprehensive component library