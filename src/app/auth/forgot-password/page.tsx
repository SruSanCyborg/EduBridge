'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import axios from 'axios'

interface ForgotPasswordForm {
  email: string
}

interface ResetInstructions {
  message: string
  email: string
  instructions: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [resetInstructions, setResetInstructions] = useState<ResetInstructions | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordForm>()

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, data)
      
      if (response.data.demoMode && response.data.resetInstructions) {
        setResetInstructions(response.data.resetInstructions)
        toast.success('Password reset instructions retrieved!')
      } else {
        toast.success(response.data.message)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error processing request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduBridge
            </span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Forgot Password? 🔐
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your email and we'll help you reset your password
          </p>
        </div>

        {/* Form or Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {!resetInstructions ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email address"
                  />
                  <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Reset Instructions'
                )}
              </motion.button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Password Reset Instructions
                </h3>
                <p className="text-gray-600 mb-6">
                  {resetInstructions.message}
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">📋 Instructions:</h4>
                <ul className="space-y-2">
                  {resetInstructions.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-blue-700">
                      <span className="text-blue-500 font-bold">{index + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setResetInstructions(null)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Try Another Email
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = `/auth/reset-password?email=${resetInstructions.email}`}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Reset Password
                </motion.button>
              </div>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-500 font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>

          {/* Demo Mode Info */}
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="text-center">
              <p className="text-sm text-yellow-800 font-medium mb-2">🚀 Demo Mode</p>
              <p className="text-xs text-yellow-600">
                In demo mode, password reset instructions are shown directly. <br/>
                In production, they would be sent via email.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}