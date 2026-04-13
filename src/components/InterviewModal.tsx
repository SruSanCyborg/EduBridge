'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VideoCallModal from './VideoCallModal'
import { 
  XMarkIcon,
  VideoCameraIcon,
  ClipboardDocumentIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Applicant {
  _id: string
  name: string
  email: string
  grade?: string
  experience?: string
  portfolio?: string
  essay?: string
  appliedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'interviewing'
}

interface InterviewModalProps {
  isOpen: boolean
  onClose: () => void
  applicant: Applicant
  opportunityTitle: string
  onUpdateStatus: (applicantId: string, status: string) => void
}

export default function InterviewModal({ 
  isOpen, 
  onClose, 
  applicant, 
  opportunityTitle,
  onUpdateStatus 
}: InterviewModalProps) {
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [interviewNotes, setInterviewNotes] = useState('')
  const [roomId, setRoomId] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Generate unique room ID for this interview
      const newRoomId = `interview_${applicant._id}_${Date.now()}`
      setRoomId(newRoomId)
    }
  }, [isOpen, applicant._id])

  const startInterview = () => {
    if (!roomId) return
    
    // Update applicant status to interviewing
    onUpdateStatus(applicant._id, 'interviewing')
    setShowVideoCall(true)
    
    // In a real app, you would also send a notification to the applicant
    // with the room ID or interview link
    toast.success('Interview room created! Share the room ID with the applicant.')
  }

  const endInterview = (decision: 'approved' | 'rejected' | 'pending') => {
    setShowVideoCall(false)
    onUpdateStatus(applicant._id, decision)
    
    // In a real app, you would save interview notes and decision
    if (interviewNotes.trim()) {
      console.log('Interview notes:', interviewNotes)
      // Save notes to backend
    }
    
    toast.success(`Applicant ${decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'marked for follow-up'}`)
    onClose()
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    toast.success('Room ID copied! Send this to the applicant.')
  }

  const copyInterviewLink = () => {
    const link = `${window.location.origin}/interview/join?room=${roomId}`
    navigator.clipboard.writeText(link)
    toast.success('Interview link copied!')
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Interview Applicant</h2>
                    <p className="text-blue-100">{opportunityTitle}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Applicant Details */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-900">{applicant.name}</h3>
                          <p className="text-gray-600">{applicant.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Applied: {new Date(applicant.appliedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <AcademicCapIcon className="w-4 h-4" />
                          <span>Status: <span className={`capitalize font-medium ${
                            applicant.status === 'pending' ? 'text-yellow-600' :
                            applicant.status === 'approved' ? 'text-green-600' :
                            applicant.status === 'rejected' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>{applicant.status}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="space-y-4">
                      {applicant.grade && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Academic Level</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{applicant.grade}</p>
                        </div>
                      )}
                      
                      {applicant.experience && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{applicant.experience}</p>
                        </div>
                      )}
                      
                      {applicant.portfolio && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Portfolio/Links</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <a 
                              href={applicant.portfolio} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {applicant.portfolio}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {applicant.essay && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Personal Statement</h4>
                          <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                            <p className="text-gray-700 whitespace-pre-wrap">{applicant.essay}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interview Panel */}
                  <div className="space-y-6">
                    {/* Video Call Section */}
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center space-x-2">
                        <VideoCameraIcon className="w-5 h-5 text-blue-600" />
                        <span>Video Interview</span>
                      </h3>
                      
                      {roomId && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Interview Room ID
                            </label>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                                {roomId}
                              </code>
                              <button
                                onClick={copyRoomId}
                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                title="Copy Room ID"
                              >
                                <ClipboardDocumentIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={startInterview}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <VideoCameraIcon className="w-4 h-4" />
                              <span>Start Interview</span>
                            </button>
                            <button
                              onClick={copyInterviewLink}
                              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Copy Link
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Interview Notes */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Interview Notes</h4>
                      <textarea
                        value={interviewNotes}
                        onChange={(e) => setInterviewNotes(e.target.value)}
                        placeholder="Take notes during the interview..."
                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Decision Buttons */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Interview Decision</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => endInterview('approved')}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => endInterview('rejected')}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          ❌ Reject
                        </button>
                        <button
                          onClick={() => endInterview('pending')}
                          className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          ⏳ Pending
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                      <div className="space-y-2 text-sm">
                        <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
                          📧 Send email to applicant
                        </button>
                        <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
                          📅 Schedule follow-up
                        </button>
                        <button className="w-full text-left p-2 hover:bg-gray-100 rounded">
                          📝 Request additional documents
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Call Modal */}
      {showVideoCall && (
        <VideoCallModal
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          participantName={applicant.name}
          participantType="student"
          roomId={roomId}
          initiator={true}
        />
      )}
    </>
  )
}