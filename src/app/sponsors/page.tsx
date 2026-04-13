'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ApplicationModal from '@/components/ApplicationModal'
import VideoCallModal from '@/components/VideoCallModal'
import { 
  HeartIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  ComputerDesktopIcon,
  CalendarIcon,
  UserGroupIcon,
  TrophyIcon,
  BuildingOfficeIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'

const sponsorOpportunities = [
  {
    id: 1,
    title: 'Tech Scholarship for Women',
    organization: 'TechForward Foundation',
    type: 'scholarship',
    amount: 5000,
    currency: 'USD',
    deadline: '2024-12-31',
    applicants: 156,
    maxApplicants: 200,
    description: 'Supporting women pursuing careers in technology and computer science.',
    requirements: ['Female student', 'Computer Science major', 'GPA 3.5+'],
    category: 'technology',
    icon: ComputerDesktopIcon,
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 2,
    title: 'STEM Education Grant',
    organization: 'Science Excellence Corp',
    type: 'grant',
    amount: 2500,
    currency: 'USD',
    deadline: '2024-11-15',
    applicants: 89,
    maxApplicants: 150,
    description: 'Financial support for students in Science, Technology, Engineering, and Mathematics.',
    requirements: ['STEM field student', 'Undergraduate level', 'Research proposal'],
    category: 'sciences',
    icon: AcademicCapIcon,
    color: 'from-green-500 to-blue-600'
  },
  {
    id: 3,
    title: 'Creative Arts Sponsorship',
    organization: 'Arts & Culture Foundation',
    type: 'sponsorship',
    amount: 1500,
    currency: 'USD',
    deadline: '2024-10-30',
    applicants: 67,
    maxApplicants: 100,
    description: 'Supporting creative students in visual arts, music, and performing arts.',
    requirements: ['Arts major', 'Portfolio submission', 'Performance video'],
    category: 'arts',
    icon: TrophyIcon,
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 4,
    title: 'Laptop Donation Program',
    organization: 'Digital Equity Initiative',
    type: 'equipment',
    amount: 800,
    currency: 'USD',
    deadline: '2024-09-20',
    applicants: 234,
    maxApplicants: 300,
    description: 'Providing laptops to students who need technology for their studies.',
    requirements: ['Financial need demonstration', 'Student enrollment proof', 'Essay'],
    category: 'equipment',
    icon: ComputerDesktopIcon,
    color: 'from-orange-500 to-red-600'
  }
]

export default function SponsorsPage() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch opportunities from backend
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor/opportunities`)
        if (response.ok) {
          const data = await response.json()
          // Transform API data to match expected format
          const getIconAndColor = (type: string) => {
            const typeMap: any = {
              scholarship: { icon: AcademicCapIcon, color: 'from-blue-500 to-purple-600' },
              internship: { icon: ComputerDesktopIcon, color: 'from-green-500 to-blue-600' },
              mentorship: { icon: UserGroupIcon, color: 'from-purple-500 to-pink-600' },
              grant: { icon: CurrencyDollarIcon, color: 'from-yellow-500 to-orange-600' },
              competition: { icon: TrophyIcon, color: 'from-orange-500 to-red-600' }
            }
            return typeMap[type] || typeMap.scholarship
          }

          const transformedOpportunities = data.opportunities.map((opp: any, index: number) => {
            const { icon, color } = getIconAndColor(opp.type)
            return {
              id: index + 1,
              title: opp.title,
              organization: opp.sponsor?.sponsorProfile?.organizationName || opp.sponsor?.name || 'Demo Sponsor',
              type: opp.type,
              amount: opp.budget?.amount || 0,
              currency: opp.budget?.currency || 'USD',
              deadline: opp.applicationDeadline?.split('T')[0] || '2024-12-31',
              applicants: opp.applications?.length || 0,
              maxApplicants: opp.maxApplicants || 100,
              description: opp.description || 'No description available',
              requirements: opp.eligibility?.subjects || ['No specific requirements'],
              icon: icon,
              color: color,
              apiData: opp // Store original API data for application submission
            }
          })
          setOpportunities(transformedOpportunities)
        }
      } catch (error) {
        console.error('Error fetching opportunities:', error)
        // Fallback to static data if API fails
        setOpportunities(sponsorOpportunities)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOpportunities()
  }, [])

  const getProgressPercentage = (applicants: number, maxApplicants: number) => {
    return (applicants / maxApplicants) * 100
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const timeDiff = deadlineDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return daysDiff > 0 ? daysDiff : 0
  }

  const handleApply = (opportunityId: number) => {
    if (!user) {
      alert('Please sign in to apply for sponsorship opportunities')
      return
    }
    
    const opportunity = opportunities.find(opp => opp.id === opportunityId)
    if (opportunity && opportunity.apiData) {
      // Use the stored API data directly
      setSelectedOpportunity(opportunity.apiData)
      setShowApplicationModal(true)
    }
  }

  const handleApplicationSubmit = async (applicationData: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sponsor/opportunities/${selectedOpportunity._id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(applicationData)
      })

      if (response.ok) {
        alert('Application submitted successfully! You will be notified about the status.')
        setShowApplicationModal(false)
        setSelectedOpportunity(null)
      } else {
        const error = await response.json()
        alert(error.message || 'Error submitting application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Error submitting application. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center space-x-3 mb-6">
                <HeartIcon className="w-12 h-12 text-red-500" />
                <h1 className="text-5xl font-bold text-gray-900">Sponsor Hub</h1>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Discover funding opportunities, scholarships, and sponsorship programs 
                from organizations dedicated to supporting education.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto mt-12">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <CurrencyDollarIcon className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">$2.5M+</div>
                  <div className="text-gray-600">Total Funding</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <UserGroupIcon className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">5,000+</div>
                  <div className="text-gray-600">Students Helped</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <BuildingOfficeIcon className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">200+</div>
                  <div className="text-gray-600">Partner Organizations</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Opportunities Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Available Opportunities
              </h2>
              <p className="text-xl text-gray-600">
                Apply for scholarships, grants, and sponsorships that match your goals
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {isLoading ? (
                <div className="col-span-2 text-center py-12">
                  <div className="text-xl text-gray-600">Loading opportunities...</div>
                </div>
              ) : opportunities.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <div className="text-xl text-gray-600">No opportunities available at the moment.</div>
                </div>
              ) : (
                opportunities.map((opportunity, index) => {
                const Icon = opportunity.icon
                const daysLeft = getDaysUntilDeadline(opportunity.deadline)
                const progress = getProgressPercentage(opportunity.applicants, opportunity.maxApplicants)
                
                return (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${opportunity.color} p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-10 h-10" />
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          {opportunity.type.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{opportunity.title}</h3>
                      <p className="text-white/90 font-medium">{opportunity.organization}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl font-bold text-green-600">
                          ${opportunity.amount.toLocaleString()}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          daysLeft > 30 ? 'bg-green-100 text-green-700' :
                          daysLeft > 7 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-6">{opportunity.description}</p>

                      {/* Requirements */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Requirements:</h4>
                        <ul className="space-y-2">
                          {opportunity.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="flex items-center space-x-2 text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Applications</span>
                          <span className="text-sm text-gray-600">
                            {opportunity.applicants}/{opportunity.maxApplicants}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Action */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApply(opportunity.id)}
                        disabled={daysLeft <= 0}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {daysLeft > 0 ? (
                          <div className="flex items-center justify-center space-x-2">
                            <CalendarIcon className="w-5 h-5" />
                            <span>Apply Now</span>
                          </div>
                        ) : (
                          'Application Closed'
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })
              )}
            </div>
          </div>
        </section>

        {/* For Organizations */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold mb-6">
                Are You an Organization?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Partner with EduBridge to create meaningful sponsorship opportunities 
                and make a lasting impact on students' lives worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all"
                >
                  Partner with Us
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white text-white rounded-2xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />

      {/* Application Modal */}
      {selectedOpportunity && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false)
            setSelectedOpportunity(null)
          }}
          opportunity={selectedOpportunity}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  )
}