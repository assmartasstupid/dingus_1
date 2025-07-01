import React, { useState, useRef, useEffect } from 'react'
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, Settings, Users, MessageSquare, MoreVertical } from 'lucide-react'
import { motion } from 'framer-motion'

interface Meeting {
  id: string
  title: string
  participants: string[]
  duration: number
}

interface VideoCallModalProps {
  meeting: Meeting
  onEndCall: () => void
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: string
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ meeting, onEndCall }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    startCall()
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    return () => {
      clearInterval(timer)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
    }
  }

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream
        }
        setIsScreenSharing(true)
      } else {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled
        })
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
        setIsScreenSharing(false)
      }
    } catch (error) {
      console.error('Error with screen sharing:', error)
    }
  }

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString()
      }
      setChatMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-lg font-semibold">{meeting.title}</h2>
              <p className="text-sm text-gray-300">
                {meeting.participants.join(', ')}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
                <span>{formatDuration(callDuration)}</span>
              </div>
              {isRecording && (
                <div className="flex items-center space-x-2">
                  <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
                  <span>Recording</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-lg ${
                isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-600 hover:bg-gray-500'
              } transition-colors`}
            >
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
            >
              <Users className="h-4 w-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowChat(!showChat)}
              className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors relative"
            >
              <MessageSquare className="h-4 w-4" />
              {chatMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chatMessages.length}
                </span>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Main Video Area */}
          <div className="flex-1 relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
            
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">JD</span>
                  </div>
                  <p>Camera is off</p>
                </div>
              </div>
            )}

            {isScreenSharing && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                Screen Sharing
              </div>
            )}

            {/* Participant thumbnails */}
            <div className="absolute top-4 right-4 space-y-2">
              {meeting.participants.slice(1).map((participant, index) => (
                <div key={index} className="w-32 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-8 h-8 bg-gray-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {participant.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <p className="text-xs">{participant.split(' ')[0]}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Connection status */}
            <div className="absolute bottom-20 left-4 flex items-center space-x-2 text-white text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connection: Excellent</span>
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="w-80 bg-white border-l border-gray-200 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Chat</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-gray-900">{msg.sender}</span>
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700">{msg.message}</p>
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <p className="text-gray-500 text-center">No messages yet</p>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={sendChatMessage}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Participants Panel */}
          {showParticipants && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="w-80 bg-white border-l border-gray-200"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Participants ({meeting.participants.length})</h3>
              </div>
              
              <div className="p-4 space-y-3">
                {meeting.participants.map((participant, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {participant.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{participant}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Connected</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Mic className="h-4 w-4 text-green-500" />
                      <Video className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleAudio}
              className={`p-3 rounded-full ${
                isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
              } text-white transition-colors`}
            >
              {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
              } text-white transition-colors`}
            >
              {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleScreenShare}
              className={`p-3 rounded-full ${
                isScreenSharing ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
              } text-white transition-colors`}
            >
              <Monitor className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors"
            >
              <Settings className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onEndCall}
              className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
            >
              <PhoneOff className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoCallModal