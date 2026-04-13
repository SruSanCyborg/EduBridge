'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import toast from 'react-hot-toast'

interface VideoCallInvitation {
  id: string
  from: {
    name: string
    email: string
    userType: 'mentor' | 'sponsor' | 'student'
  }
  to: {
    email: string
  }
  roomId: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: any
}

interface UseVideoCallProps {
  userEmail?: string
  onIncomingCall?: (invitation: VideoCallInvitation) => void
}

export const useVideoCall = ({ userEmail, onIncomingCall }: UseVideoCallProps = {}) => {
  const [incomingCall, setIncomingCall] = useState<VideoCallInvitation | null>(null)
  const [outgoingCall, setOutgoingCall] = useState<VideoCallInvitation | null>(null)
  const [isListening, setIsListening] = useState(false)

  // Listen for incoming calls
  useEffect(() => {
    if (!userEmail) return

    setIsListening(true)
    const callsRef = collection(db, 'video-calls')
    const q = query(
      callsRef,
      where('to.email', '==', userEmail),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const invitation = {
            id: change.doc.id,
            ...change.doc.data()
          } as VideoCallInvitation

          // Check if call is not expired (5 minutes)
          const createdAt = invitation.createdAt?.toDate() || new Date()
          const now = new Date()
          const diff = now.getTime() - createdAt.getTime()
          const fiveMinutes = 5 * 60 * 1000

          if (diff < fiveMinutes) {
            setIncomingCall(invitation)
            onIncomingCall?.(invitation)
            
            // Play notification sound
            if (typeof Audio !== 'undefined') {
              const audio = new Audio('/sounds/incoming-call.mp3')
              audio.play().catch(() => {
                // Fallback for browsers that require user interaction
                toast.success(`Incoming call from ${invitation.from.name}`)
              })
            }
          } else {
            // Auto-decline expired calls
            declineCall(invitation.id)
          }
        }
      })
    })

    return () => {
      unsubscribe()
      setIsListening(false)
    }
  }, [userEmail, onIncomingCall])

  const sendCallInvitation = useCallback(async (
    to: { name: string; email: string; userType: 'mentor' | 'sponsor' | 'student' },
    from: { name: string; email: string; userType: 'mentor' | 'sponsor' | 'student' }
  ) => {
    const roomId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const invitation: Omit<VideoCallInvitation, 'id'> = {
      from,
      to: { email: to.email },
      roomId,
      status: 'pending',
      createdAt: serverTimestamp()
    }

    try {
      const callRef = doc(collection(db, 'video-calls'))
      await setDoc(callRef, invitation)
      
      setOutgoingCall({ ...invitation, id: callRef.id })
      toast.success(`Call invitation sent to ${to.name}`)
      
      return {
        callId: callRef.id,
        roomId
      }
    } catch (error) {
      console.error('Error sending call invitation:', error)
      toast.error('Failed to send call invitation')
      throw error
    }
  }, [])

  const acceptCall = useCallback(async (callId: string) => {
    try {
      const callRef = doc(db, 'video-calls', callId)
      await setDoc(callRef, { status: 'accepted' }, { merge: true })
      
      setIncomingCall(null)
      toast.success('Call accepted')
    } catch (error) {
      console.error('Error accepting call:', error)
      toast.error('Failed to accept call')
    }
  }, [])

  const declineCall = useCallback(async (callId: string) => {
    try {
      const callRef = doc(db, 'video-calls', callId)
      await setDoc(callRef, { status: 'declined' }, { merge: true })
      
      setIncomingCall(null)
      toast.info('Call declined')
    } catch (error) {
      console.error('Error declining call:', error)
      toast.error('Failed to decline call')
    }
  }, [])

  const cancelCall = useCallback(async (callId: string) => {
    try {
      const callRef = doc(db, 'video-calls', callId)
      await deleteDoc(callRef)
      
      setOutgoingCall(null)
      toast.info('Call cancelled')
    } catch (error) {
      console.error('Error cancelling call:', error)
      toast.error('Failed to cancel call')
    }
  }, [])

  const cleanupExpiredCalls = useCallback(async () => {
    try {
      const callsRef = collection(db, 'video-calls')
      const q = query(callsRef, where('status', '==', 'pending'))
      const snapshot = await getDocs(q)
      
      const now = new Date()
      const fiveMinutes = 5 * 60 * 1000

      snapshot.docs.forEach(async (docSnapshot) => {
        const data = docSnapshot.data()
        const createdAt = data.createdAt?.toDate() || new Date()
        const diff = now.getTime() - createdAt.getTime()

        if (diff > fiveMinutes) {
          await deleteDoc(doc(db, 'video-calls', docSnapshot.id))
        }
      })
    } catch (error) {
      console.error('Error cleaning up expired calls:', error)
    }
  }, [])

  // Cleanup expired calls periodically
  useEffect(() => {
    const interval = setInterval(cleanupExpiredCalls, 2 * 60 * 1000) // every 2 minutes
    return () => clearInterval(interval)
  }, [cleanupExpiredCalls])

  return {
    incomingCall,
    outgoingCall,
    isListening,
    sendCallInvitation,
    acceptCall,
    declineCall,
    cancelCall
  }
}