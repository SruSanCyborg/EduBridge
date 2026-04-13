'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import Link from 'next/link'
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  HeartIcon,
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import StatsSection from '@/components/StatsSection'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function Home() {
  const { user } = useAuth()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Simple GSAP animations without ScrollTrigger
    const ctx = gsap.context(() => {
      // Continuous floating animation
      gsap.to('.float-continuous', {
        y: -20,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: 'power2.inOut'
      })

    }, mainRef)

    return () => ctx.revert()
  }, [])

  if (user) {
    return (
      <main ref={mainRef} className="min-h-screen">
        <Navbar />
        <div className="pt-20">
          <DashboardPreview />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main ref={mainRef} className="min-h-screen overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Community Showcase */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-float">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Join Our Global Learning Community
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Connect with students, mentors, and sponsors from around the world. 
              Experience the power of AI-enhanced learning in multiple languages.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 features-grid">
            {[
              {
                icon: UserGroupIcon,
                title: "Global Network",
                description: "Connect with 10,000+ students, mentors, and sponsors worldwide",
                color: "from-blue-500 to-purple-600"
              },
              {
                icon: SparklesIcon,
                title: "AI-Powered Learning",
                description: "Get personalized recommendations and instant doubt resolution",
                color: "from-purple-500 to-pink-600"
              },
              {
                icon: GlobeAltIcon,
                title: "Multilingual Support",
                description: "Learn and communicate in your preferred language",
                color: "from-green-500 to-blue-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 float-continuous`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </main>
  )
}

// Dashboard Preview for logged-in users
function DashboardPreview() {
  const { user } = useAuth()
  
  return (
    <div className="container mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-xl text-gray-600">
          Ready to continue your learning journey?
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/community">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white hover:scale-105 transition-transform duration-300 cursor-pointer">
              <ChatBubbleBottomCenterTextIcon className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Community Forum</h3>
              <p>Join discussions and get help from peers</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/mentors">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white hover:scale-105 transition-transform duration-300 cursor-pointer">
              <AcademicCapIcon className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Find Mentors</h3>
              <p>Connect with experienced professionals</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/sponsors">
            <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-8 text-white hover:scale-105 transition-transform duration-300 cursor-pointer">
              <HeartIcon className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Sponsorship Hub</h3>
              <p>Explore funding opportunities</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
