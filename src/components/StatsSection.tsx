'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Stat {
  number: string
  label: string
  description: string
  icon: string
}

const stats: Stat[] = [
  {
    number: "10,000+",
    label: "Active Students",
    description: "From 50+ countries worldwide",
    icon: "🎓"
  },
  {
    number: "500+",
    label: "Expert Mentors",
    description: "Industry professionals ready to guide",
    icon: "👨‍🏫"
  },
  {
    number: "100+",
    label: "Partner Organizations",
    description: "Providing opportunities and funding",
    icon: "🤝"
  },
  {
    number: "50+",
    label: "Languages Supported",
    description: "Breaking down language barriers",
    icon: "🌐"
  },
  {
    number: "98%",
    label: "Success Rate",
    description: "Students achieve their learning goals",
    icon: "🎯"
  },
  {
    number: "24/7",
    label: "AI Support",
    description: "Instant help whenever you need it",
    icon: "🤖"
  }
]

function AnimatedCounter({ targetNumber, duration = 2000 }: { targetNumber: string, duration?: number }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  // Extract numeric value from string like "10,000+" or "98%"
  const numericValue = parseInt(targetNumber.replace(/[^\d]/g, ''))

  useEffect(() => {
    if (hasAnimated) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp

      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setCount(Math.floor(easeOutQuart * numericValue))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setHasAnimated(true)
      }
    }

    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate)
    }, 100)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(animationFrame)
    }
  }, [hasAnimated, numericValue, duration])

  const formatNumber = (num: number): string => {
    if (targetNumber.includes('%')) return `${num}%`
    if (targetNumber.includes('+')) return `${num.toLocaleString()}+`
    if (targetNumber.includes('/')) return targetNumber // For "24/7"
    return num.toLocaleString()
  }

  return <span>{formatNumber(count)}</span>
}

export default function StatsSection() {
  const [isInView, setIsInView] = useState(false)

  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          onViewportEnter={() => setIsInView(true)}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block text-6xl mb-6"
          >
            📊
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            The Numbers Speak for{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Themselves
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Join a thriving global community that's already transforming education through 
            technology and human connection.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 text-center h-full">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-4xl mb-4"
                >
                  {stat.icon}
                </motion.div>

                {/* Number */}
                <motion.div
                  className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"
                >
                  {isInView ? (
                    <AnimatedCounter targetNumber={stat.number} duration={2000 + index * 200} />
                  ) : (
                    '0'
                  )}
                </motion.div>

                {/* Label */}
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-blue-100 text-sm leading-relaxed">
                  {stat.description}
                </p>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Achievement Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-16 relative z-10"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-4 text-white">
              🏆 Recognition & Impact
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-300">UNESCO Partner</div>
                <div className="text-blue-100 text-sm">Education Innovation</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">AI Excellence</div>
                <div className="text-blue-100 text-sm">EdTech Awards 2024</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-300">Global Impact</div>
                <div className="text-blue-100 text-sm">50+ Countries Served</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}