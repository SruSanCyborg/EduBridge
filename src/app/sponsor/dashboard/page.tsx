'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import CreateOpportunityModal from '@/components/CreateOpportunityModal'
import InterviewModal from '@/components/InterviewModal'
import { 
  PlusIcon,
  EyeIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'

interface Opportunity {
  _id: string
  title: string
  type: string
  category: string
  status: string
  budget: {
    amount: number
    currency: string
  }
  applicationDeadline: string
  applications: Application[]
  views: number
  createdAt: string
}

interface Application {
  _id: string
  applicant: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  status: string
  appliedAt: string
  personalInfo: {
    name: string
    email: string
    phone: string
    education: string
    experience: string
  }
  responses: any[]
  documents: any[]
  reviewNotes?: string
}

export default function SponsorDashboard() {
  const { user, login } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'analytics'>('overview')
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewApplicant, setInterviewApplicant] = useState<any>(null)

  // Demo login function
  const handleDemoLogin = async () => {
    try {
      await login('sponsor@demo.com', 'demo123')
    } catch (error) {
      console.error('Demo login failed:', error)
      alert('Demo login failed. Please try again.')
    }
  }

  useEffect(() => {
    if (user?.userType === 'sponsor') {
      fetchOpportunities()
    }
  }, [user])

  const fetchOpportunities = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor/my-opportunities`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOpportunities(data.opportunities)
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchApplications = async (opportunityId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor/opportunities/${opportunityId}/applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const createOpportunity = async (opportunityData: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(opportunityData)
      })

      if (response.ok) {
        await fetchOpportunities()
        alert('Opportunity created successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Error creating opportunity')
      }
    } catch (error) {
      console.error('Error creating opportunity:', error)
      alert('Error creating opportunity. Please try again.')
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    if (!selectedOpportunity) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor/opportunities/${selectedOpportunity._id}/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status,
          reviewNotes
        })
      })

      if (response.ok) {
        await fetchApplications(selectedOpportunity._id)
        setSelectedApplication(null)
        setReviewNotes('')
        alert(`Application ${status} successfully!`)
      }
    } catch (error) {
      console.error('Error updating application status:', error)
      alert('Error updating application status')
    }
  }

  const startInterview = (application: Application) => {
    setInterviewApplicant({
      _id: application._id,
      name: application.applicant.name,
      email: application.applicant.email,
      grade: application.personalInfo?.education,
      experience: application.personalInfo?.experience,
      essay: application.responses?.[0]?.answer,
      appliedAt: application.appliedAt,
      status: application.status
    })
    setShowInterviewModal(true)
  }

  const updateInterviewStatus = async (applicantId: string, status: string) => {
    if (!selectedOpportunity) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor/opportunities/${selectedOpportunity._id}/applications/${applicantId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchApplications(selectedOpportunity._id)
      }
    } catch (error) {
      console.error('Error updating application status:', error)
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
      case 'shortlisted': return <StarIcon className="w-4 h-4" />
      case 'selected': return <CheckCircleIcon className="w-4 h-4" />
      case 'rejected': return <XCircleIcon className="w-4 h-4" />
      default: return <ClockIcon className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const timeDiff = deadlineDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return daysDiff
  }

  if (user?.userType !== 'sponsor') {
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
              This dashboard is only available to sponsors
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDemoLogin}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              Login as Demo Sponsor
            </motion.button>
            <p className="text-sm text-gray-500 mt-4">
              Use credentials: sponsor@demo.com / demo123
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
                <h1 className="text-3xl font-bold text-gray-900">Sponsor Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage your opportunities and review applications</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Opportunity</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6">
            <div className="flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: ChartBarIcon },
                { key: 'applications', label: 'Applications', icon: DocumentTextIcon },
                { key: 'analytics', label: 'Analytics', icon: ChartBarIcon }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{opportunities.length}</div>
                      <div className="text-gray-600">Total Opportunities</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {opportunities.reduce((total, opp) => total + opp.applications.length, 0)}
                      </div>
                      <div className="text-gray-600">Total Applications</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <StarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {opportunities.reduce((total, opp) => 
                          total + opp.applications.filter(app => app.status === 'selected').length, 0
                        )}
                      </div>
                      <div className="text-gray-600">Selected</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <EyeIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {opportunities.reduce((total, opp) => total + (opp.views || 0), 0)}
                      </div>
                      <div className="text-gray-600">Total Views</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opportunities List */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Your Opportunities</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {isLoading ? (
                    <div className="p-6 text-center text-gray-500">Loading opportunities...</div>
                  ) : opportunities.length === 0 ? (
                    <div className="p-12 text-center">
                      <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities yet</h3>
                      <p className="text-gray-600 mb-6">Create your first opportunity to start receiving applications</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        Create Opportunity
                      </button>
                    </div>
                  ) : (
                    opportunities.map((opportunity) => {
                      const daysLeft = getDaysUntilDeadline(opportunity.applicationDeadline)
                      const applicationCount = opportunity.applications.length
                      
                      return (
                        <motion.div
                          key={opportunity._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedOpportunity(opportunity)
                            setActiveTab('applications')
                            fetchApplications(opportunity._id)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  opportunity.status === 'active' ? 'bg-green-100 text-green-800' :
                                  opportunity.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {opportunity.status.toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <CurrencyDollarIcon className="w-4 h-4" />
                                  <span>${opportunity.budget.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <UserGroupIcon className="w-4 h-4" />
                                  <span>{applicationCount} applications</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span className={daysLeft <= 7 ? 'text-red-600 font-medium' : ''}>
                                    {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <EyeIcon className="w-4 h-4" />
                                  <span>{opportunity.views || 0} views</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              Created {formatDate(opportunity.createdAt)}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Overview */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Overview</h2>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total Opportunities</p>
                        <p className="text-3xl font-bold">{opportunities.length}</p>
                      </div>
                      <DocumentTextIcon className="w-8 h-8 text-blue-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Total Applications</p>
                        <p className="text-3xl font-bold">
                          {opportunities.reduce((sum, opp) => sum + (opp.applications?.length || 0), 0)}
                        </p>
                      </div>
                      <UserGroupIcon className="w-8 h-8 text-green-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Active Opportunities</p>
                        <p className="text-3xl font-bold">
                          {opportunities.filter(opp => opp.status === 'active').length}
                        </p>
                      </div>
                      <CheckCircleIcon className="w-8 h-8 text-purple-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Total Views</p>
                        <p className="text-3xl font-bold">
                          {opportunities.reduce((sum, opp) => sum + (opp.views || 0), 0)}
                        </p>
                      </div>
                      <EyeIcon className="w-8 h-8 text-orange-200" />
                    </div>
                  </div>
                </div>
                
                {/* Opportunity Performance Table */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Opportunity Performance</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opportunity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {opportunities.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                              <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities created yet</h3>
                              <p className="text-gray-600">Create your first opportunity to see analytics data</p>
                            </td>
                          </tr>
                        ) : (
                          opportunities.map((opportunity) => {
                            const applicationCount = opportunity.applications?.length || 0
                            const daysLeft = getDaysUntilDeadline(opportunity.applicationDeadline)
                            
                            return (
                              <tr key={opportunity._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{opportunity.title}</div>
                                    <div className="text-sm text-gray-500">{opportunity.type}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{applicationCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{opportunity.views || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(opportunity.status)}`}>
                                    {opportunity.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${opportunity.budget.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className={daysLeft <= 7 && daysLeft > 0 ? 'text-red-600 font-medium' : daysLeft <= 0 ? 'text-gray-400' : ''}>
                                    {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                                  </span>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && selectedOpportunity && (
            <div className="space-y-6">
              {/* Opportunity Header */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedOpportunity.title}</h2>
                    <p className="text-gray-600">
                      {applications.length} applications • Deadline: {formatDate(selectedOpportunity.applicationDeadline)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOpportunity.status)}`}>
                      {selectedOpportunity.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Application Status Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { status: 'submitted', label: 'Submitted', color: 'blue' },
                    { status: 'under-review', label: 'Under Review', color: 'yellow' },
                    { status: 'shortlisted', label: 'Shortlisted', color: 'purple' },
                    { status: 'selected', label: 'Selected', color: 'green' },
                    { status: 'rejected', label: 'Rejected', color: 'red' }
                  ].map((item) => {
                    const count = applications.filter(app => app.status === item.status).length
                    return (
                      <div key={item.status} className="text-center">
                        <div className={`text-2xl font-bold text-${item.color}-600`}>{count}</div>
                        <div className="text-sm text-gray-600">{item.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Applications List */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {applications.length === 0 ? (
                    <div className="p-12 text-center">
                      <UserGroupIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                      <p className="text-gray-600">Applications will appear here once students start applying</p>
                    </div>
                  ) : (
                    applications.map((application) => (
                      <div key={application._id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {application.applicant.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{application.applicant.name}</h4>
                              <p className="text-gray-600">{application.applicant.email}</p>
                              <p className="text-sm text-gray-500">Applied {formatDate(application.appliedAt)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span>{application.status.replace('-', ' ').toUpperCase()}</span>
                            </span>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => startInterview(application)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
                              title="Start video interview"
                            >
                              <VideoCameraIcon className="w-4 h-4" />
                              <span>Interview</span>
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedApplication(application)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                            >
                              Review
                            </motion.button>
                          </div>
                        </div>
                        
                        {application.personalInfo && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-900">Phone:</span>
                                <span className="ml-2 text-gray-600">{application.personalInfo.phone}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">Education:</span>
                                <span className="ml-2 text-gray-600">{application.personalInfo.education}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Application Review Modal */}
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
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <h2 className="text-2xl font-bold">Review Application</h2>
                  <p className="text-blue-100">{selectedApplication.applicant.name}</p>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div><strong>Name:</strong> {selectedApplication.applicant.name}</div>
                        <div><strong>Email:</strong> {selectedApplication.applicant.email}</div>
                        {selectedApplication.personalInfo && (
                          <>
                            <div><strong>Phone:</strong> {selectedApplication.personalInfo.phone}</div>
                            <div><strong>Education:</strong> {selectedApplication.personalInfo.education}</div>
                            <div><strong>Experience:</strong> {selectedApplication.personalInfo.experience}</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Review Notes */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Notes</h3>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add your review notes here..."
                        className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected')}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication._id, 'shortlisted')}
                      className="px-6 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication._id, 'selected')}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interview Modal */}
        {interviewApplicant && (
          <InterviewModal
            isOpen={showInterviewModal}
            onClose={() => {
              setShowInterviewModal(false)
              setInterviewApplicant(null)
            }}
            applicant={interviewApplicant}
            opportunityTitle={selectedOpportunity?.title || 'Opportunity'}
            onUpdateStatus={updateInterviewStatus}
          />
        )}

        {/* Create Opportunity Modal */}
        <CreateOpportunityModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createOpportunity}
          userType={user?.userType || 'sponsor'}
        />
      </div>
    </div>
  )
}