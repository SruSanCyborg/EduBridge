'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SparklesIcon, PlayIcon } from '@heroicons/react/24/outline'

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2"
              >
                <SparklesIcon className="w-5 h-5 text-purple-600" />
                <span className="text-purple-700 font-medium">AI-Powered Education Platform</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight"
              >
                Bridge the Gap in{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Education
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 leading-relaxed max-w-2xl"
              >
                Connect students, mentors, and sponsors in a revolutionary AI-powered community. 
                Get instant doubt resolution, personalized learning paths, and multilingual support 
                to unlock your educational potential.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  Start Learning Free
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
              >
                <PlayIcon className="w-5 h-5" />
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <div className="text-gray-600 text-sm">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">500+</div>
                <div className="text-gray-600 text-sm">Expert Mentors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">50+</div>
                <div className="text-gray-600 text-sm">Sponsors</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Main Card */}
              <motion.div
                animate={{ 
                  y: [-20, 20, -20],
                  rotate: [0, 2, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-lg border border-white/20"
              >
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">AI Study Assistant</div>
                      <div className="text-gray-500 text-sm">Available 24/7</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <div className="text-sm text-gray-700">
                        "Explain quantum computing in simple terms"
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4">
                      <div className="text-sm text-gray-800">
                        Quantum computing uses quantum mechanics principles to process information in ways that classical computers cannot...
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [-10, 10, -10],
                  x: [0, 5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -top-6 -right-6 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl p-4 shadow-xl"
              >
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">🎯</div>
                  <div className="text-xs">98% Success</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ 
                  y: [15, -15, 15],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                className="absolute -bottom-4 -left-4 bg-gradient-to-br from-green-400 to-blue-600 rounded-2xl p-4 shadow-xl"
              >
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">🌍</div>
                  <div className="text-xs">50+ Languages</div>
                </div>
              </motion.div>
            </div>

            {/* Background Blur Elements */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
              <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
              <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}