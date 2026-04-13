'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CreateGroupModal from '@/components/CreateGroupModal'
import VideoCallModal from '@/components/VideoCallModal'
import { io, Socket } from 'socket.io-client'
import { 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  SparklesIcon,
  UserGroupIcon,
  BoltIcon,
  TrophyIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'

interface Group {
  _id: string
  name: string
  description: string
  category: string
  memberCount: number
  isMember: boolean
  canJoin: boolean
  isAdmin: boolean
  createdBy: {
    name: string
    userType: string
  }
  stats: {
    lastActivity: string
    totalMessages: number
  }
}

interface Message {
  _id: string
  content: string
  sender: {
    _id: string
    name: string
    userType: string
    profileImage?: string
  } | null
  createdAt: string
  messageType: string
  aiGenerated: boolean
  reactions: Array<{
    userId: string
    emoji: string
  }>
  replyTo?: {
    content: string
    sender: {
      name: string
    }
  }
}

const categories = [
  'All',
  'Career Advice',
  'Scholarship Alerts', 
  'Study Groups',
  'Industry Insights',
  'Networking',
  'Project Collaboration',
  'Internship Opportunities',
  'Tech Trends',
  'General Discussion'
]

const quickReactions = ['👍', '❤️', '😊', '🤔', '👏', '🔥']

export default function CommunityPage() {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showJoinedOnly, setShowJoinedOnly] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showGroupOptions, setShowGroupOptions] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [showSummary, setShowSummary] = useState(false)
  const [summaryData, setSummaryData] = useState<string>('')
  const [showTranslate, setShowTranslate] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [faqQuestion, setFaqQuestion] = useState('')
  const [faqAnswer, setFaqAnswer] = useState('')
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [showPinnedMessages, setShowPinnedMessages] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showSharedFiles, setShowSharedFiles] = useState(false)
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([])
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  const [sharedFiles, setSharedFiles] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [videoCallParticipant, setVideoCallParticipant] = useState<any>(null)

  // Connect to Socket.IO
  useEffect(() => {
    if (user) {
      const socketConnection = io('http://localhost:5001')
      setSocket(socketConnection)

      socketConnection.on('new-message', (message: Message) => {
        if (selectedGroup && message.group === selectedGroup._id) {
          setMessages(prev => [...prev, message])
        }
      })

      socketConnection.on('user-typing', (data: { userId: string, userName: string, groupId: string }) => {
        if (selectedGroup && data.groupId === selectedGroup._id && data.userId !== user._id) {
          setTypingUsers(prev => [...prev.filter(u => u !== data.userName), data.userName])
        }
      })

      socketConnection.on('user-stop-typing', (data: { userId: string, groupId: string }) => {
        if (selectedGroup && data.groupId === selectedGroup._id) {
          setTypingUsers(prev => prev.filter(u => u !== data.userId))
        }
      })

      socketConnection.on('user-status', (data: { userId: string, status: string }) => {
        if (data.status === 'online') {
          setOnlineUsers(prev => new Set([...prev, data.userId]))
        } else {
          setOnlineUsers(prev => {
            const newSet = new Set(prev)
            newSet.delete(data.userId)
            return newSet
          })
        }
      })

      return () => {
        socketConnection.disconnect()
      }
    }
  }, [user, selectedGroup])

  // Fetch groups
  useEffect(() => {
    fetchGroups()
  }, [selectedCategory, searchQuery, showJoinedOnly])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchGroups = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'All') params.append('category', selectedCategory)
      if (searchQuery) params.append('search', searchQuery)
      if (showJoinedOnly) params.append('joined', 'true')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/groups?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (groupId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/groups/${groupId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const selectGroup = (group: Group) => {
    if (selectedGroup) {
      socket?.emit('leave-group', selectedGroup._id)
    }
    
    setSelectedGroup(group)
    setMessages([])
    
    if (group.isMember) {
      socket?.emit('join-group', group._id)
      fetchMessages(group._id)
    }
  }

  const joinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        await fetchGroups()
        const group = groups.find(g => g._id === groupId)
        if (group) {
          setSelectedGroup({ ...group, isMember: true })
          socket?.emit('join-group', groupId)
          fetchMessages(groupId)
        }
      }
    } catch (error) {
      console.error('Error joining group:', error)
    }
  }

  const createGroup = async (groupData: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(groupData)
      })

      if (response.ok) {
        const data = await response.json()
        await fetchGroups()
        
        // Auto-select the new group
        const newGroup = { ...data.group, isMember: true, canJoin: false, isAdmin: true }
        setSelectedGroup(newGroup)
        socket?.emit('join-group', newGroup._id)
        fetchMessages(newGroup._id)
      }
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/groups/${selectedGroup._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newMessage,
          messageType: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        
        // Emit to other users
        socket?.emit('group-message', {
          ...data.message,
          groupId: selectedGroup._id
        })
        
        // Stop typing
        socket?.emit('typing-stop', { 
          userId: user?._id, 
          groupId: selectedGroup._id 
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleTyping = () => {
    if (!selectedGroup || !user) return
    
    socket?.emit('typing-start', {
      userId: user._id,
      userName: user.name,
      groupId: selectedGroup._id
    })
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set new timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing-stop', {
        userId: user._id,
        groupId: selectedGroup._id
      })
    }, 2000)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'mentor': return 'text-purple-600'
      case 'sponsor': return 'text-green-600'
      default: return 'text-blue-600'
    }
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'mentor': return '👨‍🏫'
      case 'sponsor': return '🤝'
      default: return '🎓'
    }
  }

  const startVideoCall = (member: any) => {
    setVideoCallParticipant(member)
    setShowVideoCall(true)
  }

  // Quick Actions Functions
  const fetchPinnedMessages = async () => {
    if (!selectedGroup) return
    // Mock data for demo - in real app this would be an API call
    const mockPinned = messages.filter((_, index) => index < 2) // First 2 messages as pinned
    setPinnedMessages(mockPinned)
    setShowPinnedMessages(true)
  }

  const fetchGroupMembers = async () => {
    if (!selectedGroup) return
    // Mock data for demo - in real app this would be an API call
    const mockMembers = [
      { _id: '1', name: 'Alex Johnson', userType: 'mentor', status: 'online', joinedAt: new Date().toISOString() },
      { _id: '2', name: 'Sarah Williams', userType: 'mentor', status: 'offline', joinedAt: new Date().toISOString() },
      { _id: '3', name: 'Jane Smith', userType: 'student', status: 'online', joinedAt: new Date().toISOString() },
      { _id: '4', name: 'David Park', userType: 'student', status: 'away', joinedAt: new Date().toISOString() }
    ]
    setGroupMembers(mockMembers)
    setShowMembers(true)
  }

  const fetchSharedFiles = async () => {
    if (!selectedGroup) return
    // Mock data for demo - in real app this would be an API call
    const mockFiles = [
      { _id: '1', name: 'React_Guide.pdf', size: '2.5MB', uploadedBy: 'Alex Johnson', uploadedAt: new Date().toISOString(), type: 'pdf' },
      { _id: '2', name: 'Project_Requirements.docx', size: '1.2MB', uploadedBy: 'Sarah Williams', uploadedAt: new Date().toISOString(), type: 'document' },
      { _id: '3', name: 'demo_screenshot.png', size: '800KB', uploadedBy: 'Jane Smith', uploadedAt: new Date().toISOString(), type: 'image' }
    ]
    setSharedFiles(mockFiles)
    setShowSharedFiles(true)
  }

  // AI Functions
  const getSummary = async () => {
    if (!selectedGroup) return
    setIsLoadingAI(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/groups/${selectedGroup._id}/summary`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSummaryData(data.summary)
        setShowSummary(true)
      }
    } catch (error) {
      console.error('Error getting summary:', error)
    } finally {
      setIsLoadingAI(false)
    }
  }

  const translateMessages = async () => {
    if (!selectedGroup || messages.length === 0) return
    setIsLoadingAI(true)
    try {
      const messageIds = messages.slice(-5).map(m => m._id) // Translate last 5 messages
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/groups/${selectedGroup._id}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          messageIds,
          targetLanguage: 'Spanish'
        })
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Translations:', data.translations)
        setShowTranslate(true)
        // You can display translations in a modal or overlay
      }
    } catch (error) {
      console.error('Error translating messages:', error)
    } finally {
      setIsLoadingAI(false)
    }
  }

  const askFAQ = async () => {
    if (!selectedGroup || !faqQuestion.trim()) return
    setIsLoadingAI(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/community/groups/${selectedGroup._id}/faq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          question: faqQuestion
        })
      })
      if (response.ok) {
        const data = await response.json()
        setFaqAnswer(data.answer)
        setShowFAQ(true)
      }
    } catch (error) {
      console.error('Error getting FAQ answer:', error)
    } finally {
      setIsLoadingAI(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <UserGroupIcon className="w-16 h-16 mx-auto mb-6 text-blue-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join the Community
            </h2>
            <p className="text-gray-600 mb-8">
              Connect with mentors, sponsors, and fellow students
            </p>
            <a
              href="/auth/login"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Sign In
            </a>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16 h-screen flex overflow-hidden">
        {/* Left Sidebar - Groups List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
                <span>Community</span>
              </h1>
              {(['mentor', 'sponsor'].includes(user?.userType || '')) && (
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Search */}
            <div className="relative mb-3">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            {/* Filters */}
            <div className="flex space-x-2 mb-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={() => setShowJoinedOnly(!showJoinedOnly)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  showJoinedOnly 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Joined
              </button>
            </div>
          </div>

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading groups...</div>
            ) : groups.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No groups found</div>
            ) : (
              <div className="space-y-1 p-2">
                {groups.map((group) => (
                  <motion.div
                    key={group._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => selectGroup(group)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedGroup?._id === group._id 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {group.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {group.memberCount} members
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {group.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {group.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">
                          {getUserTypeIcon(group.createdBy.userType)}
                        </span>
                        {group.isMember ? (
                          <span className="text-xs text-green-600">Joined</span>
                        ) : group.canJoin ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              joinGroup(group._id)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Join
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Full</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedGroup.name}</h2>
                      <p className="text-sm text-gray-500">
                        {selectedGroup.memberCount} members • {selectedGroup.category}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGroupOptions(!showGroupOptions)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {selectedGroup.isMember ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.sender?._id === user._id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.aiGenerated
                              ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900'
                              : message.sender?._id === user._id
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}>
                            {/* Sender name for other users */}
                            {message.sender && message.sender._id !== user._id && (
                              <div className="flex items-center space-x-1 mb-1">
                                <span className={`text-xs font-medium ${getUserTypeColor(message.sender.userType)}`}>
                                  {getUserTypeIcon(message.sender.userType)} {message.sender.name}
                                </span>
                              </div>
                            )}
                            
                            {/* Reply indicator */}
                            {message.replyTo && (
                              <div className="text-xs opacity-70 border-l-2 border-gray-300 pl-2 mb-2">
                                Replying to {message.replyTo.sender.name}: {message.replyTo.content.substring(0, 50)}...
                              </div>
                            )}
                            
                            {/* Message content */}
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            
                            {/* Timestamp */}
                            <div className={`text-xs mt-1 ${
                              message.sender?._id === user._id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                            </div>
                            
                            {/* Reactions */}
                            {message.reactions.length > 0 && (
                              <div className="flex space-x-1 mt-2">
                                {message.reactions.map((reaction, index) => (
                                  <span key={index} className="text-sm">
                                    {reaction.emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-2 text-gray-500"
                      >
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                        <span className="text-sm">
                          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                        </span>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <PaperClipIcon className="w-5 h-5" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value)
                            handleTyping()
                          }}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type your message..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <FaceSmileIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Join this group to participate
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Connect with {selectedGroup.memberCount} members in {selectedGroup.category}
                    </p>
                    {selectedGroup.canJoin ? (
                      <button
                        onClick={() => joinGroup(selectedGroup._id)}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Join Group
                      </button>
                    ) : (
                      <p className="text-gray-500">This group is full</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a group to start chatting
                </h3>
                <p className="text-gray-600">
                  Choose from {groups.length} available communities
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - AI Features & Stats */}
        {selectedGroup && selectedGroup.isMember && (
          <div className="w-72 bg-white border-l border-gray-200 p-4">
            <div className="space-y-6">
              {/* AI Quick Actions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5 text-purple-500" />
                  <span>AI Assistant</span>
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={getSummary}
                    disabled={isLoadingAI}
                    className="w-full p-3 text-left bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                  >
                    <div className="font-medium text-purple-900">
                      💡 Get Summary {isLoadingAI && '⏳'}
                    </div>
                    <div className="text-sm text-purple-600">Summarize recent chat</div>
                  </button>
                  <button 
                    onClick={translateMessages}
                    disabled={isLoadingAI || messages.length === 0}
                    className="w-full p-3 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    <div className="font-medium text-blue-900">
                      🌐 Translate {isLoadingAI && '⏳'}
                    </div>
                    <div className="text-sm text-blue-600">Translate messages</div>
                  </button>
                  <button 
                    onClick={() => {
                      setFaqQuestion('')
                      setFaqAnswer('')
                      setShowFAQ(true)
                    }}
                    disabled={isLoadingAI}
                    className="w-full p-3 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    <div className="font-medium text-green-900">❓ Ask FAQ</div>
                    <div className="text-sm text-green-600">Common questions</div>
                  </button>
                </div>
              </div>

              {/* Group Stats */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-500" />
                  <span>Group Stats</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Messages</span>
                    <span className="font-semibold">{selectedGroup.stats?.totalMessages || messages.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Members</span>
                    <span className="font-semibold">{selectedGroup.memberCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Online Now</span>
                    <span className="font-semibold text-green-600">{Math.max(onlineUsers.size, 1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Messages Today</span>
                    <span className="font-semibold text-blue-600">
                      {messages.filter(m => {
                        const today = new Date().toDateString()
                        return new Date(m.createdAt).toDateString() === today
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Activity</span>
                    <span className="font-semibold text-purple-600">
                      {messages.length > 0 ? formatTime(messages[messages.length - 1].createdAt) : 'No activity'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={fetchPinnedMessages}
                    className="w-full p-2 text-left text-sm bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    📌 Pinned Messages
                  </button>
                  <button 
                    onClick={fetchGroupMembers}
                    className="w-full p-2 text-left text-sm bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    👥 View Members
                  </button>
                  <button 
                    onClick={fetchSharedFiles}
                    className="w-full p-2 text-left text-sm bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    📁 Shared Files
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSubmit={createGroup}
        userType={user?.userType || 'student'}
      />

      {/* AI Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">💡 Chat Summary</h2>
                  <button
                    onClick={() => setShowSummary(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {summaryData}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ Modal */}
      <AnimatePresence>
        {showFAQ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFAQ(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">❓ Ask FAQ</h2>
                  <button
                    onClick={() => setShowFAQ(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {!faqAnswer ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What would you like to know?
                      </label>
                      <textarea
                        value={faqQuestion}
                        onChange={(e) => setFaqQuestion(e.target.value)}
                        placeholder="Ask any question about this group or topic..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowFAQ(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={askFAQ}
                        disabled={!faqQuestion.trim() || isLoadingAI}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                      >
                        {isLoadingAI ? 'Getting Answer...' : 'Ask AI'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Your Question:</h4>
                      <p className="text-gray-700">{faqQuestion}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">AI Answer:</h4>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {faqAnswer}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned Messages Modal */}
      <AnimatePresence>
        {showPinnedMessages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPinnedMessages(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">📌 Pinned Messages</h2>
                  <button
                    onClick={() => setShowPinnedMessages(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {pinnedMessages.length > 0 ? (
                  <div className="space-y-4">
                    {pinnedMessages.map((message) => (
                      <div key={message._id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`font-medium ${getUserTypeColor(message.sender?.userType || 'student')}`}>
                            {getUserTypeIcon(message.sender?.userType || 'student')} {message.sender?.name || 'Anonymous'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No pinned messages yet
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Members Modal */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMembers(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">👥 Group Members</h2>
                  <button
                    onClick={() => setShowMembers(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                  {groupMembers.map((member) => (
                    <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                          member.userType === 'mentor' ? 'bg-purple-500' : 
                          member.userType === 'sponsor' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{member.name}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getUserTypeColor(member.userType)} bg-opacity-10`}>
                              {getUserTypeIcon(member.userType)} {member.userType}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center space-x-1 text-sm ${
                          member.status === 'online' ? 'text-green-600' :
                          member.status === 'away' ? 'text-yellow-600' : 'text-gray-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            member.status === 'online' ? 'bg-green-500' :
                            member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                          <span>{member.status}</span>
                        </div>
                        {member.status === 'online' && member._id !== user?._id && (
                          <button
                            onClick={() => startVideoCall(member)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Start video call"
                          >
                            <VideoCameraIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared Files Modal */}
      <AnimatePresence>
        {showSharedFiles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSharedFiles(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">📁 Shared Files</h2>
                  <button
                    onClick={() => setShowSharedFiles(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {sharedFiles.length > 0 ? (
                  <div className="space-y-3">
                    {sharedFiles.map((file) => (
                      <div key={file._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            {file.type === 'pdf' ? '📄' : 
                             file.type === 'image' ? '🖼️' : 
                             file.type === 'document' ? '📝' : '📎'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-500">
                              {file.size} • Uploaded by {file.uploadedBy}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No shared files yet
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Call Modal */}
      {videoCallParticipant && (
        <VideoCallModal
          isOpen={showVideoCall}
          onClose={() => {
            setShowVideoCall(false)
            setVideoCallParticipant(null)
          }}
          participantName={videoCallParticipant.name}
          participantType={videoCallParticipant.userType}
          initiator={true}
        />
      )}
    </div>
  )
}