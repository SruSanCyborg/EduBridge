'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface User {
  uid: string
  _id: string // For compatibility
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
  firebaseUser: FirebaseUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
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

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser)
        
        // Get the user's ID token
        const idToken = await firebaseUser.getIdToken()
        setToken(idToken)
        
        // Get user data from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User
            setUser({
              ...userData,
              uid: firebaseUser.uid,
              _id: firebaseUser.uid, // For compatibility
              email: firebaseUser.email || userData.email
            })
          } else {
            // User document doesn't exist, create a basic one
            const basicUser: User = {
              uid: firebaseUser.uid,
              _id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              userType: 'student',
              communityStats: {
                postsCount: 0,
                helpfulAnswers: 0,
                reputation: 0,
                badges: []
              },
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }
            
            await setDoc(userDocRef, basicUser)
            setUser(basicUser)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          toast.error('Error loading user profile')
        }
      } else {
        setFirebaseUser(null)
        setUser(null)
        setToken(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const result = await signInWithEmailAndPassword(auth, email, password)
      
      // User data will be set by the auth state listener
      toast.success('Login successful!')
      console.log('Login successful:', result.user.email)
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email'
          break
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address'
          break
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled'
          break
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password'
          break
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
      const { email, password, name, userType, bio, location, languages } = userData
      
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update Firebase Auth profile
      await updateProfile(result.user, {
        displayName: name
      })
      
      // Create user document in Firestore
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
      
      // Add user type specific profiles
      if (userType === 'mentor') {
        userDoc.mentorProfile = {
          expertise: [],
          experience: '',
          rating: 0,
          totalSessions: 0,
          isVerified: false
        }
      } else if (userType === 'sponsor') {
        userDoc.sponsorProfile = {
          organizationName: '',
          organizationType: '',
          focusAreas: [],
          totalContributions: 0,
          isVerified: false
        }
      } else {
        userDoc.studentProfile = {
          grade: '',
          interests: [],
          goals: [],
          skills: []
        }
      }
      
      await setDoc(doc(db, 'users', result.user.uid), userDoc)
      
      toast.success('Registration successful!')
      console.log('Registration successful:', result.user.email)
    } catch (error: any) {
      console.error('Registration error:', error)
      let errorMessage = 'Registration failed'
      
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
      
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    if (!firebaseUser || !user) return

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid)
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(userDocRef, updateData)
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...data } : null)
      
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Error updating profile')
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    firebaseUser,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile: updateUserProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider')
  }
  return context
}