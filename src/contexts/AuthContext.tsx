'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface User {
  _id: string
  name: string
  email: string
  userType: 'student' | 'mentor' | 'sponsor'
  profileImage?: string
  bio?: string
  communityStats?: {
    postsCount: number
    helpfulAnswers: number
    reputation: number
    badges: Array<{ name: string; earned: Date }>
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  userType: 'student' | 'mentor' | 'sponsor'
  bio?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token')
        
        if (storedToken) {
          const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          })
          setUser(response.data.user)
          setToken(storedToken)
        }
      } catch (error) {
        localStorage.removeItem('token')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [mounted])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password })
      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      
      toast.success('Login successful!')
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData)
      const { token: newToken, user: newUser } = response.data
      
      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
      
      toast.success('Registration successful!')
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return

    try {
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data.user)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error('Error updating profile')
      throw error
    }
  }

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}