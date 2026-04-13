// Demo community groups for testing (works without database)
const demoGroups = [
  {
    _id: 'demo-group-1',
    name: 'React Developers Hub',
    description: 'Connect with React developers worldwide. Share tips, ask questions, and collaborate on projects. Perfect for beginners and experts alike.',
    category: 'Tech Trends',
    memberCount: 247,
    isMember: false,
    canJoin: true,
    isAdmin: false,
    createdBy: {
      name: 'Alex Johnson',
      userType: 'mentor'
    },
    stats: {
      lastActivity: new Date().toISOString(),
      totalMessages: 1543
    },
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development']
  },
  {
    _id: 'demo-group-2',
    name: 'Career Guidance Central',
    description: 'Get personalized career advice from industry professionals. Discuss career paths, interview tips, and professional development strategies.',
    category: 'Career Advice',
    memberCount: 189,
    isMember: false,
    canJoin: true,
    isAdmin: false,
    createdBy: {
      name: 'Sarah Williams',
      userType: 'mentor'
    },
    stats: {
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      totalMessages: 892
    },
    tags: ['Career', 'Jobs', 'Interview', 'Professional Development']
  },
  {
    _id: 'demo-group-3',
    name: 'Scholarship Opportunities',
    description: 'Latest scholarship announcements, application tips, and success stories. Get funded for your education dreams!',
    category: 'Scholarship Alerts',
    memberCount: 456,
    isMember: false,
    canJoin: true,
    isAdmin: false,
    createdBy: {
      name: 'Tech Corp Foundation',
      userType: 'sponsor'
    },
    stats: {
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      totalMessages: 234
    },
    tags: ['Scholarships', 'Funding', 'Education', 'Financial Aid']
  },
  {
    _id: 'demo-group-4',
    name: 'AI & Machine Learning',
    description: 'Dive deep into artificial intelligence and machine learning. Discuss algorithms, share projects, and stay updated with the latest research.',
    category: 'Tech Trends',
    memberCount: 312,
    isMember: false,
    canJoin: true,
    isAdmin: false,
    createdBy: {
      name: 'Dr. Michael Chen',
      userType: 'mentor'
    },
    stats: {
      lastActivity: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      totalMessages: 2134
    },
    tags: ['AI', 'Machine Learning', 'Python', 'Data Science']
  },
  {
    _id: 'demo-group-5',
    name: 'Startup Founders Circle',
    description: 'For aspiring entrepreneurs and startup founders. Network, find co-founders, and get mentorship from successful entrepreneurs.',
    category: 'Networking',
    memberCount: 89,
    isMember: false,
    canJoin: true,
    isAdmin: false,
    createdBy: {
      name: 'Innovation Labs',
      userType: 'sponsor'
    },
    stats: {
      lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      totalMessages: 445
    },
    tags: ['Startup', 'Entrepreneurship', 'Funding', 'Business']
  },
  {
    _id: 'demo-group-6',
    name: 'Data Science Study Group',
    description: 'Collaborative learning space for data science enthusiasts. Work on projects together, share datasets, and learn from each other.',
    category: 'Study Groups',
    memberCount: 167,
    isMember: false,
    canJoin: true,
    isAdmin: false,
    createdBy: {
      name: 'Emma Rodriguez',
      userType: 'mentor'
    },
    stats: {
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      totalMessages: 678
    },
    tags: ['Data Science', 'Python', 'Statistics', 'Analytics']
  }
]

const demoMessages = {
  'demo-group-1': [
    {
      _id: 'msg-1',
      content: 'Welcome to React Developers Hub! 🚀 Feel free to introduce yourself and share what you\'re working on.',
      sender: {
        _id: 'user-mentor-1',
        name: 'Alex Johnson',
        userType: 'mentor'
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      messageType: 'text',
      aiGenerated: false,
      reactions: [
        { userId: 'user-1', emoji: '👍' },
        { userId: 'user-2', emoji: '🎉' }
      ]
    },
    {
      _id: 'msg-2',
      content: 'Hi everyone! I\'m new to React and looking for some guidance on hooks. Any good resources?',
      sender: {
        _id: 'user-student-1',
        name: 'Jane Smith',
        userType: 'student'
      },
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      messageType: 'text',
      aiGenerated: false,
      reactions: []
    },
    {
      _id: 'msg-3',
      content: '🤖 **AI Assistant**: Great question! Here are some excellent resources for learning React Hooks:\n\n• **Official React Docs** - The hooks section is very comprehensive\n• **Kent C. Dodds\' Blog** - Has amazing practical examples\n• **React Hook Form** - Perfect for form handling\n• **Custom Hooks recipes** - Check out usehooks.com\n\nStart with useState and useEffect, then move to more advanced hooks like useContext and useReducer. Practice by building small projects!',
      sender: null,
      createdAt: new Date(Date.now() - 89 * 60 * 1000).toISOString(),
      messageType: 'text',
      aiGenerated: true,
      reactions: [
        { userId: 'user-student-1', emoji: '🙏' },
        { userId: 'user-mentor-1', emoji: '👍' }
      ],
      replyTo: {
        content: 'Hi everyone! I\'m new to React and looking for some guidance on hooks. Any good resources?',
        sender: { name: 'Jane Smith' }
      }
    }
  ],
  'demo-group-2': [
    {
      _id: 'msg-career-1',
      content: 'Looking for advice on transitioning from academic research to industry. Any tips for making my resume more industry-friendly?',
      sender: {
        _id: 'user-student-2',
        name: 'David Park',
        userType: 'student'
      },
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      messageType: 'text',
      aiGenerated: false,
      reactions: []
    },
    {
      _id: 'msg-career-2',
      content: 'Focus on translating your research skills into business value! Highlight problem-solving, data analysis, and project management. Happy to review your resume if you\'d like. 👍',
      sender: {
        _id: 'user-mentor-2',
        name: 'Sarah Williams',
        userType: 'mentor'
      },
      createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      messageType: 'text',
      aiGenerated: false,
      reactions: [
        { userId: 'user-student-2', emoji: '🙏' }
      ]
    }
  ]
}

module.exports = { demoGroups, demoMessages }