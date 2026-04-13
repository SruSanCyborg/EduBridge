'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  VideoCameraIcon,
  XMarkIcon,
  MicrophoneIcon,
  PhoneIcon,
  CameraIcon,
  SpeakerWaveIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import { 
  VideoCameraSlashIcon,
  MicrophoneSlashIcon 
} from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { db } from '@/lib/firebase'
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore'

interface VideoCallModalProps {
  isOpen: boolean
  onClose: () => void
  participantName?: string
  participantType?: 'mentor' | 'sponsor' | 'student'
  roomId?: string
  initiator?: boolean
}

export default function VideoCallModal({ 
  isOpen, 
  onClose, 
  participantName = 'Participant',
  participantType = 'student',
  roomId,
  initiator = false 
}: VideoCallModalProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [connectionState, setConnectionState] = useState<string>('disconnected')
  const [callStatus, setCallStatus] = useState<string>('Preparing call...')
  const [currentRoomId, setCurrentRoomId] = useState<string>('')
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isCallActive, setIsCallActive] = useState(false)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)

  const configuration = { 
    iceServers: [ 
      { urls: 'stun:stun.l.google.com:19302' }, 
      { urls: 'stun:stun1.l.google.com:19302' } 
    ] 
  }

  // Firebase is already imported and initialized

  // Start call when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeCall()
      startCallTimer()
    } else {
      cleanup()
    }
    
    return () => cleanup()
  }, [isOpen, roomId, initiator])

  // Handle connection state changes
  useEffect(() => {
    if (peerConnection) {
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState
        setConnectionState(state)
        
        switch (state) {
          case 'connecting':
            setCallStatus('Connecting...')
            break
          case 'connected':
            setCallStatus('Connected')
            setIsCallActive(true)
            toast.success('Call connected!')
            break
          case 'failed':
          case 'disconnected':
            setCallStatus('Connection lost')
            toast.error('Call disconnected')
            break
        }
      }
    }
  }, [peerConnection])

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const initializeCall = async () => {
    try {
      // Generate or use provided room ID
      const finalRoomId = roomId || Math.random().toString(36).substring(2, 10)
      setCurrentRoomId(finalRoomId)
      
      await setupMedia()
      createPeerConnection()
      
      if (initiator) {
        await createRoom(finalRoomId)
      } else {
        await joinRoom(finalRoomId)
      }
      
      setCallStatus(`Room ID: ${finalRoomId}`)
    } catch (error) {
      console.error('Error initializing call:', error)
      toast.error('Failed to start call')
      setCallStatus('Failed to connect')
    }
  }

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      setCallStatus('Camera and microphone ready')
    } catch (error) {
      console.error('Error accessing media:', error)
      toast.error('Cannot access camera/microphone')
      setCallStatus('Media access failed')
    }
  }

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(configuration)
    
    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream)
      })
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const [stream] = event.streams
      setRemoteStream(stream)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream
      }
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && currentRoomId) {
        const candidatesRef = collection(db, 'calls', currentRoomId, 'candidates')
        addDoc(candidatesRef, {
          candidate: event.candidate.toJSON(),
          type: initiator ? 'caller' : 'callee'
        })
      }
    }

    setPeerConnection(pc)
  }

  const createRoom = async (roomId: string) => {
    if (!peerConnection) return

    // Create room document
    const roomRef = doc(db, 'calls', roomId)
    await setDoc(roomRef, {
      created: serverTimestamp(),
      participants: {
        initiator: participantName
      }
    })

    // Create offer
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    
    await setDoc(roomRef, { 
      offer: offer 
    }, { merge: true })

    // Listen for answer
    onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data()
      if (data?.answer && !peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
      }
    })

    listenForCandidates(roomId)
    setCallStatus(`Waiting for ${participantName} to join...`)
  }

  const joinRoom = async (roomId: string) => {
    if (!peerConnection) return

    const roomRef = doc(db, 'calls', roomId)
    const roomSnapshot = await getDoc(roomRef)
    if (!roomSnapshot.exists()) {
      throw new Error('Room does not exist')
    }

    // Listen for offer
    onSnapshot(roomRef, async (snapshot) => {
      const data = snapshot.data()
      
      if (data?.offer && !peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
        
        // Create answer
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        
        await setDoc(roomRef, {
          answer: answer
        }, { merge: true })
      }
    })

    listenForCandidates(roomId)
    setCallStatus('Joining call...')
  }

  const listenForCandidates = (roomId: string) => {
    if (!peerConnection) return

    const candidatesRef = collection(db, 'calls', roomId, 'candidates')
    onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data()
          const candidateType = initiator ? 'callee' : 'caller'
          
          if (data.type === candidateType) {
            try {
              await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
            } catch (error) {
              console.error('Error adding ICE candidate:', error)
            }
          }
        }
      })
    })
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
        toast.success(videoTrack.enabled ? 'Camera on' : 'Camera off')
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
        toast.success(audioTrack.enabled ? 'Microphone on' : 'Microphone off')
      }
    }
  }

  const shareScreen = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        
        if (peerConnection && localStream) {
          // Replace video track
          const videoTrack = screenStream.getVideoTracks()[0]
          const sender = peerConnection.getSenders().find(s => 
            s.track?.kind === 'video'
          )
          
          if (sender) {
            await sender.replaceTrack(videoTrack)
          }
          
          setIsScreenSharing(true)
          toast.success('Screen sharing started')
          
          // Stop screen sharing when track ends
          videoTrack.onended = () => {
            stopScreenSharing()
          }
        }
      } else {
        stopScreenSharing()
      }
    } catch (error) {
      console.error('Error sharing screen:', error)
      toast.error('Failed to share screen')
    }
  }

  const stopScreenSharing = async () => {
    if (peerConnection && localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      const sender = peerConnection.getSenders().find(s => 
        s.track?.kind === 'video'
      )
      
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack)
      }
      
      setIsScreenSharing(false)
      toast.success('Screen sharing stopped')
    }
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(currentRoomId)
    toast.success('Room ID copied to clipboard!')
  }

  const endCall = () => {
    cleanup()
    onClose()
    toast.success('Call ended')
  }

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    
    if (peerConnection) {
      peerConnection.close()
    }
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
    }
    
    if (currentRoomId) {
      const roomRef = doc(db, 'calls', currentRoomId)
      deleteDoc(roomRef)
    }
    
    // Reset state
    setLocalStream(null)
    setRemoteStream(null)
    setPeerConnection(null)
    setConnectionState('disconnected')
    setCallStatus('Preparing call...')
    setCallDuration(0)
    setIsCallActive(false)
    setIsVideoEnabled(true)
    setIsAudioEnabled(true)
    setIsScreenSharing(false)
  }

  const getParticipantColor = (type: string) => {
    switch (type) {
      case 'mentor': return 'from-purple-500 to-purple-700'
      case 'sponsor': return 'from-green-500 to-green-700'
      default: return 'from-blue-500 to-blue-700'
    }
  }

  const getParticipantIcon = (type: string) => {
    switch (type) {
      case 'mentor': return '👨‍🏫'
      case 'sponsor': return '🤝'
      default: return '🎓'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && endCall()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl overflow-hidden max-w-6xl w-full max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 bg-gradient-to-r ${getParticipantColor(participantType)} rounded-full flex items-center justify-center text-white font-bold`}>
                  {getParticipantIcon(participantType)}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{participantName}</h3>
                  <p className="text-sm text-gray-300 capitalize">{participantType}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {isCallActive && (
                  <div className="text-white font-mono">
                    {formatDuration(callDuration)}
                  </div>
                )}
                <div className="text-sm text-gray-300">{callStatus}</div>
                <button
                  onClick={endCall}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative bg-black">
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoCameraIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">{initiator ? 'Waiting for participant...' : 'Connecting...'}</p>
                    {currentRoomId && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Room ID:</p>
                        <div className="flex items-center justify-center space-x-2">
                          <code className="bg-gray-800 px-3 py-1 rounded text-sm">{currentRoomId}</code>
                          <button
                            onClick={copyRoomId}
                            className="p-1 hover:bg-gray-700 rounded"
                          >
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Local Video */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoCameraSlashIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Connection Status Indicator */}
              <div className="absolute top-4 left-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  connectionState === 'connected' 
                    ? 'bg-green-600 text-white' 
                    : connectionState === 'connecting'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-red-600 text-white'
                }`}>
                  <div className={`w-2 h-2 rounded-full inline-block mr-2 ${
                    connectionState === 'connected' ? 'bg-green-200' : 'bg-white'
                  }`} />
                  {connectionState === 'connected' ? 'Connected' : 
                   connectionState === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-colors ${
                  isAudioEnabled 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isAudioEnabled ? (
                  <MicrophoneIcon className="w-6 h-6" />
                ) : (
                  <MicrophoneSlashIcon className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                  isVideoEnabled 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isVideoEnabled ? (
                  <CameraIcon className="w-6 h-6" />
                ) : (
                  <VideoCameraSlashIcon className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={shareScreen}
                className={`p-4 rounded-full transition-colors ${
                  isScreenSharing
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <SpeakerWaveIcon className="w-6 h-6" />
              </button>

              <button
                onClick={endCall}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
              >
                <PhoneIcon className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}