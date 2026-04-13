'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduBridge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              // Logged in navigation
              <>
                <Link href="/community" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Community
                </Link>
                <Link href="/mentors" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Mentors
                </Link>
                <Link href="/sponsors" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Sponsors
                </Link>
                <Link href="/ai-assistant" className="text-gray-700 hover:text-blue-600 transition-colors">
                  AI Assistant
                </Link>
                
                {/* Role-specific navigation */}
                {user.userType === 'sponsor' && (
                  <Link href="/sponsor/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                )}
                {user.userType === 'student' && (
                  <Link href="/student/applications" className="text-gray-700 hover:text-blue-600 transition-colors">
                    My Applications
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  <Link href="/profile">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 hover:bg-gray-200 transition-colors cursor-pointer">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-6 h-6 rounded-full" />
                      ) : (
                        <UserCircleIcon className="w-6 h-6 text-gray-600" />
                      )}
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              // Not logged in navigation
              <>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                  About
                </Link>
                <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Features
                </Link>
                <Link href="/community" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Community
                </Link>
                
                <div className="flex items-center space-x-4">
                  <Link href="/auth/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                  <Link href="/auth/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all"
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-gray-200"
          >
            {user ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3 px-2 py-2 bg-gray-50 rounded-lg">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-600" />
                  )}
                  <span className="font-medium text-gray-900">{user.name}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {user.userType}
                  </span>
                </div>
                <Link href="/community" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                  Community
                </Link>
                <Link href="/mentors" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                  Mentors
                </Link>
                <Link href="/sponsors" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                  Sponsors
                </Link>
                <Link href="/ai-assistant" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                  AI Assistant
                </Link>
                <Link href="/profile" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left py-2 text-red-600 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Link href="/about" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                  About
                </Link>
                <Link href="/features" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                  Features
                </Link>
                <Link href="/community" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                  Community
                </Link>
                <hr className="my-4" />
                <Link href="/auth/login" className="block py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
                <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  )
}