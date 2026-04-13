'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VideoCallModal from '@/components/VideoCallModal'
import { 
  AcademicCapIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

const demoMentors = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    title: 'Senior Software Engineer at Google',
    expertise: ['Computer Science', 'Machine Learning', 'Web Development'],
    rating: 4.9,
    totalSessions: 245,
    location: 'San Francisco, CA',
    profileImage: '',
    bio: 'PhD in Computer Science with 8+ years experience in tech. Passionate about helping students break into tech careers.',
    languages: ['English', 'Mandarin'],
    pricePerHour: 75,
    availability: 'Available weekends',
    badges: ['Top Mentor', 'AI Expert']
  },
  {
    id: 2,
    name: 'Prof. Michael Rodriguez',
    title: 'Mathematics Professor at MIT',
    expertise: ['Mathematics', 'Physics', 'Engineering'],
    rating: 4.8,
    totalSessions: 189,
    location: 'Boston, MA',
    profileImage: '',
    bio: 'Professor of Mathematics specializing in applied mathematics and engineering applications.',
    languages: ['English', 'Spanish'],
    pricePerHour: 90,
    availability: 'Flexible schedule',
    badges: ['University Professor', 'Math Expert']
  },
  {
    id: 3,
    name: 'Emily Johnson',
    title: 'UX Designer at Meta',
    expertise: ['Design', 'UI/UX', 'Product Management'],
    rating: 4.7,
    totalSessions: 156,
    location: 'New York, NY',
    profileImage: '',
    bio: 'Creative professional with expertise in user experience design and product strategy.',
    languages: ['English', 'French'],
    pricePerHour: 65,
    availability: 'Evenings and weekends',
    badges: ['Design Expert', 'Industry Leader']
  }
]

export default function MentorsPage() {
  const { user } = useAuth()
  const [selectedExpertise, setSelectedExpertise] = useState<string>('')
  const [bookingMentor, setBookingMentor] = useState<number | null>(null)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<any>(null)

  const expertiseOptions = [
    'All', 'Computer Science', 'Mathematics', 'Physics', 'Design', 
    'Business', 'Engineering', 'Data Science', 'Marketing'
  ]

  const filteredMentors = selectedExpertise && selectedExpertise !== 'All'
    ? demoMentors.filter(mentor => 
        mentor.expertise.some(exp => exp.toLowerCase().includes(selectedExpertise.toLowerCase()))
      )
    : demoMentors

  const handleBookSession = (mentorId: number) => {
    if (!user) {
      alert('Please sign in to book a mentoring session')
      return
    }
    setBookingMentor(mentorId)
    // In real app, this would open a booking modal/page
    setTimeout(() => {
      alert('Demo: Session booking request sent! The mentor will contact you soon.')
      setBookingMentor(null)
    }, 2000)
  }

  const handleVideoCall = (mentor: any) => {
    if (!user) {
      alert('Please sign in to start a video call')
      return
    }
    setSelectedMentor(mentor)
    setShowVideoCall(true)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolid
            key={star}
            className={`w-4 h-4 ${
              star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">{rating}</span>
      </div>
    )
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
                <AcademicCapIcon className="w-12 h-12 text-blue-500" />
                <h1 className="text-5xl font-bold text-gray-900">Find Your Mentor</h1>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Connect with expert mentors who can guide your learning journey 
                and help you achieve your goals.
              </p>
              
              {/* Filter */}
              <div className="max-w-2xl mx-auto">
                <div className="flex flex-wrap gap-2 justify-center">
                  {expertiseOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedExpertise(option === 'All' ? '' : option)}
                      className={`px-4 py-2 rounded-full transition-all ${
                        (selectedExpertise === option) || (option === 'All' && !selectedExpertise)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mentors Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredMentors.map((mentor, index) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
                      <p className="text-blue-600 font-medium">{mentor.title}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        {renderStars(mentor.rating)}
                        <span className="text-sm text-gray-500">
                          {mentor.totalSessions} sessions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 mb-4 line-clamp-3">{mentor.bio}</p>

                  {/* Expertise */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {mentor.badges.map((badge, badgeIndex) => (
                        <span
                          key={badgeIndex}
                          className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"
                        >
                          ⭐ {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{mentor.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>{mentor.availability}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-green-600">
                        ${mentor.pricePerHour}/hour
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBookSession(mentor.id)}
                      disabled={bookingMentor === mentor.id}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {bookingMentor === mentor.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Booking...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Book Session</span>
                        </div>
                      )}
                    </motion.button>
                    
                    <button 
                      onClick={() => handleVideoCall(mentor)}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2"
                      title="Start video call"
                    >
                      <VideoCameraIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Call</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No mentors found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your expertise filter to see more mentors.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl p-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Want to Become a Mentor?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Share your expertise and help students around the world achieve their dreams.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                Apply to Mentor
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />

      {/* Video Call Modal */}
      {selectedMentor && (
        <VideoCallModal
          isOpen={showVideoCall}
          onClose={() => {
            setShowVideoCall(false)
            setSelectedMentor(null)
          }}
          participantName={selectedMentor.name}
          participantType="mentor"
          initiator={true}
        />
      )}
    </div>
  )
}