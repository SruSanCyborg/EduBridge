'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  UserGroupIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (groupData: any) => void
  userType: string
}

const categories = [
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

const categoryIcons = {
  'Career Advice': '💼',
  'Scholarship Alerts': '🎓',
  'Study Groups': '📚',
  'Industry Insights': '🏢',
  'Networking': '🤝',
  'Project Collaboration': '👥',
  'Internship Opportunities': '🚀',
  'Tech Trends': '💻',
  'General Discussion': '💬'
}

export default function CreateGroupModal({ isOpen, onClose, onSubmit, userType }: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General Discussion',
    tags: '',
    settings: {
      isPrivate: false,
      allowFileSharing: true,
      maxMembers: 500,
      autoModeration: true
    }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const groupData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }
      
      await onSubmit(groupData)
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'General Discussion',
        tags: '',
        settings: {
          isPrivate: false,
          allowFileSharing: true,
          maxMembers: 500,
          autoModeration: true
        }
      })
      
      onClose()
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('settings.')) {
      const settingKey = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingKey]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const getUserTypeIcon = () => {
    return userType === 'mentor' ? '👨‍🏫' : '🤝'
  }

  const getUserTypeColor = () => {
    return userType === 'mentor' ? 'from-purple-500 to-pink-600' : 'from-green-500 to-blue-600'
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${getUserTypeColor()} p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Create New Group</h2>
                  <p className="text-white text-opacity-90">
                    {getUserTypeIcon()} {userType === 'mentor' ? 'Mentor' : 'Sponsor'} Community Space
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter a catchy group name..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.name.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  maxLength={500}
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this group is about and what members can expect..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.category === category
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={formData.category === category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl">
                        {categoryIcons[category as keyof typeof categoryIcons]}
                      </span>
                      <span className="font-medium text-gray-900 text-sm">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="React, JavaScript, Career, Remote (comma-separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add relevant tags to help students find your group
                </p>
              </div>

              {/* Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5 text-blue-500" />
                  <span>Group Settings</span>
                </h3>
                
                <div className="space-y-4">
                  {/* Privacy */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Private Group</div>
                      <div className="text-sm text-gray-600">
                        Only invited students can join
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.isPrivate}
                        onChange={(e) => handleInputChange('settings.isPrivate', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* File Sharing */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">File Sharing</div>
                      <div className="text-sm text-gray-600">
                        Allow members to share files and images
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowFileSharing}
                        onChange={(e) => handleInputChange('settings.allowFileSharing', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* AI Moderation */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">AI Moderation</div>
                      <div className="text-sm text-gray-600">
                        Automatically filter inappropriate content
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.autoModeration}
                        onChange={(e) => handleInputChange('settings.autoModeration', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Max Members */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">Maximum Members</div>
                      <div className="font-semibold text-blue-600">
                        {formData.settings.maxMembers}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={formData.settings.maxMembers}
                      onChange={(e) => handleInputChange('settings.maxMembers', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10</span>
                      <span>1000</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              🤖 AI features will help manage your community automatically
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
                className={`px-6 py-2 bg-gradient-to-r ${getUserTypeColor()} text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}