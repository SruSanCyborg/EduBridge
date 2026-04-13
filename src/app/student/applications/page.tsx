'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import { 
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  BellIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Application {
  _id: string
  opportunity: {
    _id: string
    title: string
    type: string
    sponsor: {
      name: string
      organizationName?: string
    }
  }
  status: string
  appliedAt: string
  reviewNotes?: string
}

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: {
    applicationStatus?: string
    opportunityTitle?: string
    sponsorName?: string
  }
}

export default function StudentApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'applications' | 'notifications'>('applications')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  useEffect(() => {
    if (user?.userType === 'student') {
      fetchApplications()
      fetchNotifications()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor/my-applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under-review': return 'bg-yellow-100 text-yellow-800'
      case 'shortlisted': return 'bg-purple-100 text-purple-800'
      case 'selected': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <ClockIcon className="w-5 h-5" />
      case 'under-review': return <EyeIcon className="w-5 h-5" />
      case 'shortlisted': return <StarIcon className="w-5 h-5" />
      case 'selected': return <CheckCircleIcon className="w-5 h-5" />
      case 'rejected': return <XCircleIcon className="w-5 h-5" />
      default: return <DocumentTextIcon className="w-5 h-5" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'submitted': return 'Your application has been submitted successfully'
      case 'under-review': return 'Your application is currently being reviewed'
      case 'shortlisted': return 'Congratulations! Your application has been shortlisted'
      case 'selected': return 'Excellent news! You have been selected for this opportunity'
      case 'rejected': return 'Your application was not selected this time'
      default: return 'Application status unknown'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const unreadNotificationCount = notifications.filter(n => !n.read).length

  if (user?.userType !== 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-6 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-8">
              This page is only available to students
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                <p className="text-gray-600 mt-2">Track your opportunity applications and notifications</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="text-2xl font-bold">{applications.length}</div>
                  <div className="text-sm text-blue-100">Total Applications</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="text-2xl font-bold">
                    {applications.filter(app => app.status === 'selected').length}
                  </div>
                  <div className="text-sm text-green-100">Selected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('applications')}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4" />
                <span>Applications</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BellIcon className="w-4 h-4" />
                <span>Notifications</span>
                {unreadNotificationCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Applications List */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Your Applications</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {isLoading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading applications...</p>
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="p-12 text-center">
                      <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                      <p className="text-gray-600 mb-6">Start applying to opportunities to see them here</p>
                      <a
                        href="/sponsors"
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        Browse Opportunities
                      </a>
                    </div>
                  ) : (
                    applications.map((application) => (
                      <motion.div
                        key={application._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                {application.opportunity.title.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {application.opportunity.title}
                                </h3>
                                <p className="text-gray-600">
                                  {application.opportunity.sponsor.organizationName || application.opportunity.sponsor.name}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="capitalize">{application.opportunity.type}</span>
                              <span>Applied {formatRelativeTime(application.appliedAt)}</span>
                            </div>
                            
                            <div className="mt-3">
                              <p className="text-sm text-gray-600">
                                {getStatusMessage(application.status)}
                              </p>
                              {application.reviewNotes && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <strong>Review Notes:</strong> {application.reviewNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span>{application.status.replace('-', ' ').toUpperCase()}</span>
                            </span>
                            
                            <span className="text-xs text-gray-500">
                              {formatDate(application.appliedAt)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Notifications List */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={async () => {
                          try {
                            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all-read`, {
                              method: 'PATCH',
                              headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                              }
                            })
                            setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
                          } catch (error) {
                            console.error('Error marking all as read:', error)
                          }
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <BellIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                      <p className="text-gray-600">You'll receive updates about your applications here</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            markNotificationAsRead(notification._id)
                          }
                        }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                            <BellIcon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className={`font-semibold ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            
                            <p className={`text-sm ${!notification.read ? 'text-blue-800' : 'text-gray-600'} mb-2 whitespace-pre-wrap`}>
                              {notification.message}
                            </p>
                            
                            <p className="text-xs text-gray-500">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Application Details Modal */}
        <AnimatePresence>
          {selectedApplication && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedApplication(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <h2 className="text-2xl font-bold">{selectedApplication.opportunity.title}</h2>
                  <p className="text-blue-100">
                    {selectedApplication.opportunity.sponsor.organizationName || selectedApplication.opportunity.sponsor.name}
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <span className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(selectedApplication.status)}`}>
                        {getStatusIcon(selectedApplication.status)}
                        <span>{selectedApplication.status.replace('-', ' ').toUpperCase()}</span>
                      </span>
                      <span className="text-gray-500">Applied {formatDate(selectedApplication.appliedAt)}</span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Status Update</h3>
                      <p className="text-gray-600">{getStatusMessage(selectedApplication.status)}</p>
                    </div>
                    
                    {selectedApplication.reviewNotes && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Review Notes</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700">{selectedApplication.reviewNotes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}