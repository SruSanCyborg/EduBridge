'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import axios from 'axios'
import toast from 'react-hot-toast'

interface User {
  uid?: string
  _id: string
  name: string
  email: string
  userType: 'student' | 'mentor' | 'sponsor'
  profileImage?: string
  bio?: string
  location?: {
    country?: string
    state?: string
    city?: string
  }
  languages?: string[]
  studentProfile?: any
  mentorProfile?: any
  sponsorProfile?: any
  communityStats?: {
    postsCount: number
    helpfulAnswers: number
    reputation: number
    badges: Array<{ name: string; earned: Date }>
  }
  createdAt?: any
  updatedAt?: any
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
  location?: {
    country?: string
    state?: string
    city?: string
  }
  languages?: string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize auth state
  useEffect(() => {
    if (!isClient) return

    const initAuth = async () => {
      // Check for stored token (demo auth)
      const storedToken = localStorage.getItem('token')
      
      if (storedToken) {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          })
          setUser(response.data.user)
          setToken(storedToken)
          console.log('Demo auth loaded:', response.data.user.name)
        } catch (error) {
          console.log('Demo token invalid, trying Firebase...')
          localStorage.removeItem('token')
        }
      }

      // Try Firebase auth (if configured)
      if (auth) {
        try {
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser && !user) { // Only use Firebase if no demo user
              try {
                const idToken = await firebaseUser.getIdToken()
                const userDocRef = doc(db, 'users', firebaseUser.uid)
                const userDoc = await getDoc(userDocRef)
                
                if (userDoc.exists()) {
                  const userData = userDoc.data() as User
                  setUser({
                    ...userData,
                    uid: firebaseUser.uid,
                    _id: firebaseUser.uid,
                    email: firebaseUser.email || userData.email
                  })
                  setToken(idToken)
                  console.log('Firebase auth loaded:', userData.name)
                }
              } catch (error) {
                console.error('Firebase auth error:', error)
              }
            }
          })
          
          return () => unsubscribe()
        } catch (error) {
          console.log('Firebase not configured, using demo mode only')
        }
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, [isClient, user])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // First try Firebase auth (for real users)
      if (auth && !email.includes('@demo.com')) {
        try {
          console.log('Attempting Firebase login:', email)
          const result = await signInWithEmailAndPassword(auth, email, password)
          toast.success('Login successful!')
          return
        } catch (firebaseError: any) {
          console.log('Firebase login failed, trying demo auth:', firebaseError.message)
        }
      }
      
      // Fallback to demo auth
      console.log('Attempting demo login:', email)
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password })
      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      
      toast.success('Login successful!')
      console.log('Demo login successful:', userData.name)
      
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email'
            break
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password'
            break
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address'
            break
        }
      }
      
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)
      console.log('Attempting registration:', userData.email, userData.userType)
      const { email, password, name, userType, bio, location, languages } = userData
      
      // Try Firebase first (for real users)
      if (auth && !email.includes('@demo.com')) {
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password)
          
          await updateFirebaseProfile(result.user, { displayName: name })
          
          const userDoc: User = {
            uid: result.user.uid,
            _id: result.user.uid,
            name,
            email,
            userType,
            bio: bio || '',
            location: location || {},
            languages: languages || [],
            communityStats: {
              postsCount: 0,
              helpfulAnswers: 0,
              reputation: 0,
              badges: []
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
          
          if (userType === 'mentor') {
            userDoc.mentorProfile = {
              expertise: [], experience: '', rating: 0, totalSessions: 0, isVerified: false
            }
          } else if (userType === 'sponsor') {
            userDoc.sponsorProfile = {
              organizationName: '', organizationType: '', focusAreas: [], totalContributions: 0, isVerified: false
            }
          } else {
            userDoc.studentProfile = {
              grade: '', interests: [], goals: [], skills: []
            }
          }
          
          await setDoc(doc(db, 'users', result.user.uid), userDoc)
          
          toast.success('Registration successful!')
          console.log('Firebase registration successful:', result.user.email)
          return
          
        } catch (firebaseError: any) {
          console.log('Firebase registration failed, trying demo:', firebaseError.message)
          
          if (firebaseError.code === 'auth/configuration-not-found') {
            throw new Error('Firebase Authentication not configured. Please enable Authentication in Firebase Console.')
          }
        }
      }
      
      // Fallback to demo registration  
      console.log('Attempting demo registration:', email)
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData)
      const { token: newToken, user: newUser } = response.data
      
      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
      
      toast.success('Registration successful!')
      console.log('Demo registration successful:', newUser.name)
      
    } catch (error: any) {
      console.error('Registration error:', error)
      let errorMessage = 'Registration failed'
      
      if (error.message.includes('Firebase Authentication not configured')) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists'
            break
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address'
            break
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters'
            break
        }
      }
      
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Firebase logout
      if (auth && user?.uid) {
        await signOut(auth)
      }
      
      // Demo logout
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
      
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return

    try {
      // Firebase update
      if (user.uid && db) {
        const userDocRef = doc(db, 'users', user.uid)
        const updateData = { ...data, updatedAt: serverTimestamp() }
        await updateDoc(userDocRef, updateData)
      }
      
      // Demo update (if using backend)
      if (token && !user.uid) {
        await axios.put(`${API_BASE_URL}/auth/profile`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      setUser(prev => prev ? { ...prev, ...data } : null)
      toast.success('Profile updated successfully')
      
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Error updating profile')
      throw error
    }
  }

  // Don't render until client-side hydration
  if (!isClient) {
    return <div>{children}</div>
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