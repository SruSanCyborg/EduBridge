'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ChatBubbleBottomCenterTextIcon,
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon,
  UserGroupIcon,
  GlobeAltIcon,
  TrophyIcon,
  ShieldCheckIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const features = [
  {
    category: "Community",
    items: [
      {
        icon: ChatBubbleBottomCenterTextIcon,
        title: "Discussion Forums",
        description: "Engage in categorized discussions about career advice, scholarships, skill development, and exam preparation.",
        features: ["Career Advice", "Scholarship Alerts", "Study Groups", "Technical Help"]
      },
      {
        icon: UserGroupIcon,
        title: "Peer-to-Peer Learning",
        description: "Form study groups, share resources, and collaborate with students from around the world.",
        features: ["Study Groups", "Resource Sharing", "Collaborative Projects", "Peer Support"]
      }
    ]
  },
  {
    category: "Mentorship",
    items: [
      {
        icon: AcademicCapIcon,
        title: "Expert Mentorship",
        description: "Connect with verified mentors for personalized guidance and live interactive sessions.",
        features: ["1-on-1 Sessions", "Group Workshops", "Career Guidance", "Skill Development"]
      },
      {
        icon: PlayIcon,
        title: "Live Sessions",
        description: "Participate in real-time video/audio sessions with mentors and industry experts.",
        features: ["Video Calls", "Screen Sharing", "Session Recording", "Interactive Whiteboard"]
      }
    ]
  },
  {
    category: "AI-Powered",
    items: [
      {
        icon: SparklesIcon,
        title: "AI Study Assistant",
        description: "Get instant answers to academic questions with our advanced AI that understands context.",
        features: ["24/7 Availability", "Context Awareness", "Multi-Subject Support", "Personalized Help"]
      },
      {
        icon: GlobeAltIcon,
        title: "Multilingual Support",
        description: "Learn and communicate in your preferred language with real-time translation.",
        features: ["50+ Languages", "Real-time Translation", "Cultural Context", "Local Support"]
      }
    ]
  },
  {
    category: "Opportunities",
    items: [
      {
        icon: HeartIcon,
        title: "Sponsor Network",
        description: "Discover funding opportunities, scholarships, and sponsorship programs from trusted organizations.",
        features: ["Scholarships", "Grants", "Internships", "Equipment Donations"]
      },
      {
        icon: TrophyIcon,
        title: "Achievement System",
        description: "Track progress and earn badges as you engage with the community and reach milestones.",
        features: ["Progress Tracking", "Skill Badges", "Leaderboards", "Recognition System"]
      }
    ]
  }
]

export default function FeaturesPage() {
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
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Powerful{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Features
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Everything you need for a comprehensive educational experience, powered by AI and driven by community.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Sections */}
        {features.map((category, categoryIndex) => (
          <section key={category.category} className={categoryIndex % 2 === 1 ? "py-20 bg-white" : "py-20"}>
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{category.category}</h2>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-12">
                {category.items.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: featureIndex * 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{feature.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {feature.features.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Security & Trust */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <ShieldCheckIcon className="w-16 h-16 mx-auto mb-6 text-blue-400" />
              <h2 className="text-4xl font-bold mb-6">Security & Trust</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Your safety and privacy are our top priorities. EduBridge implements industry-leading security measures.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "AI Content Moderation",
                  description: "Advanced AI filters inappropriate content and maintains community standards"
                },
                {
                  title: "Verified Mentors",
                  description: "All mentors undergo verification processes to ensure expertise and credibility"
                },
                {
                  title: "Secure Transactions",
                  description: "End-to-end encryption protects all financial transactions and sensitive data"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center"
                >
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ready to Experience All Features?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of learners already using EduBridge
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
                  >
                    Start Free Trial
                  </motion.button>
                </Link>
                <Link href="/community">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all"
                  >
                    Explore Community
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}