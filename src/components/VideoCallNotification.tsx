'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  VideoCameraIcon, 
  XMarkIcon,
  PhoneIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface VideoCallNotificationProps {
  isVisible: boolean
  callerName: string
  callerType: 'mentor' | 'sponsor' | 'student'
  roomId: string
  onAccept: () => void
  onDecline: () => void
  autoDeclineAfter?: number // seconds
}

export default function VideoCallNotification({
  isVisible,
  callerName,
  callerType,
  roomId,
  onAccept,
  onDecline,
  autoDeclineAfter = 30
}: VideoCallNotificationProps) {
  const [timeLeft, setTimeLeft] = useState(autoDeclineAfter)

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(autoDeclineAfter)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onDecline()
          toast.error('Call declined automatically')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isVisible, autoDeclineAfter, onDecline])

  const getCallerIcon = (type: string) => {
    switch (type) {
      case 'mentor': return '👨‍🏫'
      case 'sponsor': return '🤝'
      default: return '🎓'
    }
  }

  const getCallerColor = (type: string) => {
    switch (type) {
      case 'mentor': return 'from-purple-500 to-purple-700'
      case 'sponsor': return 'from-green-500 to-green-700'
      default: return 'from-blue-500 to-blue-700'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-sm w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-900">Incoming Video Call</span>
            </div>
            <button
              onClick={onDecline}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Caller Info */}
          <div className="text-center mb-6">
            <div className={`w-16 h-16 bg-gradient-to-r ${getCallerColor(callerType)} rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3`}>
              {getCallerIcon(callerType)}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{callerName}</h3>
            <p className="text-sm text-gray-600 capitalize">{callerType}</p>
            <div className="mt-3 text-xs text-gray-500">
              Room ID: <code className="bg-gray-100 px-2 py-1 rounded">{roomId}</code>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                Auto-decline in {timeLeft}s
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDecline}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <PhoneIcon className="w-5 h-5 transform rotate-135" />
              <span>Decline</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAccept}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
            >
              <VideoCameraIcon className="w-5 h-5" />
              <span>Accept</span>
            </motion.button>
          </div>

          {/* Sound Wave Animation */}
          <div className="absolute -inset-1 rounded-2xl opacity-20">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-blue-400 animate-pulse" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}