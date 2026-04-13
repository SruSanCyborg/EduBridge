'use client'

import { motion } from 'framer-motion'
import { 
  ChatBubbleBottomCenterTextIcon,
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon,
  UserGroupIcon,
  GlobeAltIcon,
  TrophyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: ChatBubbleBottomCenterTextIcon,
    title: "Discussion Forums",
    description: "Engage with peers in categorized discussions about career advice, scholarships, and skill development.",
    color: "from-blue-500 to-cyan-600"
  },
  {
    icon: AcademicCapIcon,
    title: "Expert Mentorship",
    description: "Connect with verified mentors for personalized guidance and live sessions tailored to your goals.",
    color: "from-purple-500 to-pink-600"
  },
  {
    icon: HeartIcon,
    title: "Sponsor Network",
    description: "Discover funding opportunities, scholarships, and sponsorship programs from trusted organizations.",
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: SparklesIcon,
    title: "AI Study Assistant",
    description: "Get instant answers to your academic questions with our advanced AI that understands context.",
    color: "from-orange-500 to-red-600"
  },
  {
    icon: GlobeAltIcon,
    title: "Multilingual Support",
    description: "Learn and communicate in your preferred language with real-time translation capabilities.",
    color: "from-indigo-500 to-purple-600"
  },
  {
    icon: UserGroupIcon,
    title: "Peer-to-Peer Learning",
    description: "Form study groups, share resources, and learn collaboratively with students worldwide.",
    color: "from-teal-500 to-blue-600"
  },
  {
    icon: TrophyIcon,
    title: "Achievement System",
    description: "Earn badges and track your progress as you engage with the community and complete milestones.",
    color: "from-yellow-500 to-orange-600"
  },
  {
    icon: ShieldCheckIcon,
    title: "Safe Environment",
    description: "Learn in a moderated, secure platform with AI-powered content filtering and community guidelines.",
    color: "from-gray-500 to-slate-600"
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform combines the power of community learning with cutting-edge AI 
            to create the ultimate educational experience.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.2 }
              }}
              className="group"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:shadow-lg transition-all duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Learning Experience?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of students, mentors, and sponsors who are already 
              part of the EduBridge community.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Explore All Features
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}