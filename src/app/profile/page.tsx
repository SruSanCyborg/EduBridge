'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  UserCircleIcon,
  PencilIcon,
  TrophyIcon,
  ChartBarIcon,
  StarIcon,
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || {}
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleSave = async () => {
    try {
      await updateProfile(editForm)
      setIsEditing(false)
    } catch (error) {
      console.error('Profile update failed:', error)
    }
  }

  const getUserTypeIcon = () => {
    switch (user.userType) {
      case 'student': return '🎓'
      case 'mentor': return '👨‍🏫'
      case 'sponsor': return '🤝'
      default: return '👤'
    }
  }

  const getUserTypeColor = () => {
    switch (user.userType) {
      case 'student': return 'from-blue-500 to-purple-600'
      case 'mentor': return 'from-purple-500 to-pink-600'
      case 'sponsor': return 'from-green-500 to-blue-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="pt-20 pb-20">
        <div className="container mx-auto px-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name}
                    className="w-32 h-32 rounded-2xl object-cover"
                  />
                ) : (
                  <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${getUserTypeColor()} flex items-center justify-center text-white text-4xl`}>
                    {getUserTypeIcon()}
                  </div>
                )}
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="text-3xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getUserTypeColor()}`}>
                        {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{user.bio || 'No bio added yet'}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{user.location?.city || 'Location not set'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <ChartBarIcon className="w-6 h-6 text-blue-500" />
                <span>Community Stats</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posts</span>
                  <span className="font-semibold">{user.communityStats?.postsCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Helpful Answers</span>
                  <span className="font-semibold">{user.communityStats?.helpfulAnswers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reputation</span>
                  <span className="font-semibold text-blue-600">{user.communityStats?.reputation || 0}</span>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <TrophyIcon className="w-6 h-6 text-yellow-500" />
                <span>Achievements</span>
              </h2>
              
              {user.communityStats?.badges && user.communityStats.badges.length > 0 ? (
                <div className="space-y-3">
                  {user.communityStats.badges.map((badge, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl">
                      <TrophyIcon className="w-6 h-6 text-yellow-500" />
                      <div>
                        <div className="font-semibold text-gray-900">{badge.name}</div>
                        <div className="text-sm text-gray-500">
                          Earned {new Date(badge.earned).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <TrophyIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No badges earned yet</p>
                  <p className="text-sm">Participate in the community to earn achievements!</p>
                </div>
              )}
            </motion.div>

            {/* Role-specific Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {user.userType === 'student' && 'Student Profile'}
                {user.userType === 'mentor' && 'Mentor Profile'}
                {user.userType === 'sponsor' && 'Sponsor Profile'}
              </h2>
              
              {user.userType === 'student' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Grade/Level</label>
                    <p className="font-semibold">{user.studentProfile?.grade || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Subjects</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.studentProfile?.subjects?.map((subject, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {subject}
                        </span>
                      )) || <span className="text-gray-400">No subjects added</span>}
                    </div>
                  </div>
                </div>
              )}

              {user.userType === 'mentor' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Rating</label>
                    <div className="flex items-center space-x-2">
                      <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold">{user.mentorProfile?.rating || 'No rating yet'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Total Sessions</label>
                    <p className="font-semibold">{user.mentorProfile?.totalSessions || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Expertise</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.mentorProfile?.expertise?.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {skill}
                        </span>
                      )) || <span className="text-gray-400">No expertise added</span>}
                    </div>
                  </div>
                </div>
              )}

              {user.userType === 'sponsor' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Organization</label>
                    <p className="font-semibold">{user.sponsorProfile?.organizationName || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Total Contributions</label>
                    <p className="font-semibold text-green-600">
                      ${user.sponsorProfile?.totalContributions?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Focus Areas</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.sponsorProfile?.focusAreas?.map((area, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {area}
                        </span>
                      )) || <span className="text-gray-400">No focus areas added</span>}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}