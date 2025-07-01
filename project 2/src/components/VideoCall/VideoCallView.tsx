import React, { useState, useRef, useEffect } from 'react'
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor, Users, Settings, Calendar, Clock, Plus, Search, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import VideoCallModal from './VideoCallModal'
import ScheduleModal from '../Modals/ScheduleModal'

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  duration: number
  participants: string[]
  status: 'scheduled' | 'active' | 'completed'
  meetingUrl?: string
  type: 'video' | 'phone' | 'in-person'
  description?: string
}

const VideoCallView: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    // Mock meetings data
    const mockMeetings: Meeting[] = [
      {
        id: '1',
        title: 'Contract Review Discussion',
        date: '2024-01-30',
        time: '10:00 AM',
        duration: 60,
        participants: ['John Doe (You)', 'Attorney Smith'],
        status: 'scheduled',
        type: 'video',
        description: 'Review employment contract terms and conditions',
        meetingUrl: 'https://meet.example.com/contract-review-123'
      },
      {
        id: '2',
        title: 'Case Strategy Meeting',
        date: '2024-01-28',
        time: '2:00 PM',
        duration: 45,
        participants: ['John Doe (You)', 'Attorney Smith', 'Paralegal Johnson'],
        status: 'completed',
        type: 'video',
        description: 'Discuss litigation strategy and next steps'
      },
      {
        id: '3',
        title: 'Initial Consultation',
        date: '2024-02-02',
        time: '11:00 AM',
        duration: 30,
        participants: ['John Doe (You)', 'Attorney Smith'],
        status: 'scheduled',
        type: 'phone',
        description: 'Initial case assessment and consultation'
      },
      {
        id: '4',
        title: 'Document Review Session',
        date: '2024-02-05',
        time: '3:00 PM',
        duration: 90,
        participants: ['John Doe (You)', 'Attorney Smith'],
        status: 'scheduled',
        type: 'video',
        description: 'Review discovery documents and evidence'
      }
    ]
    setMeetings(mockMeetings)
  }, [])

  const startCall = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setShowVideoCall(true)
  }

  const endCall = () => {
    setShowVideoCall(false)
    setSelectedMeeting(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'phone':
        return <Phone className="h-4 w-4" />
      case 'in-person':
        return <Users className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const upcomingMeetings = filteredMeetings.filter(m => m.status === 'scheduled')
  const pastMeetings = filteredMeetings.filter(m => m.status === 'completed')

  const isToday = (dateString: string) => {
    const today = new Date().toDateString()
    const meetingDate = new Date(dateString).toDateString()
    return today === meetingDate
  }

  const isSoon = (dateString: string, timeString: string) => {
    const now = new Date()
    const meetingDateTime = new Date(`${dateString} ${timeString}`)
    const diffMinutes = (meetingDateTime.getTime() - now.getTime()) / (1000 * 60)
    return diffMinutes <= 15 && diffMinutes > 0
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Consultations</h1>
            <p className="text-gray-600 mt-1">Schedule and join video meetings with your legal team</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Meeting</span>
          </motion.button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Meetings</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6"
      >
        <div className="text-center">
          <Video className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need an immediate consultation?</h3>
          <p className="text-gray-600 mb-4">Start an instant video call with available legal team members</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startCall({
              id: 'instant',
              title: 'Instant Consultation',
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString(),
              duration: 30,
              participants: ['You', 'Available Attorney'],
              status: 'active',
              type: 'video'
            })}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Phone className="h-4 w-4" />
            <span>Start Instant Call</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Meetings</h2>
          <div className="grid gap-4">
            {upcomingMeetings.map((meeting) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-all ${
                  isSoon(meeting.date, meeting.time) ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </span>
                      {isToday(meeting.date) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Today
                        </span>
                      )}
                      {isSoon(meeting.date, meeting.time) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                          Starting Soon
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(meeting.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{meeting.time} ({meeting.duration} min)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(meeting.type)}
                        <span className="capitalize">{meeting.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{meeting.participants.length} participants</span>
                      </div>
                    </div>
                    
                    {meeting.description && (
                      <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      <strong>Participants:</strong> {meeting.participants.join(', ')}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {meeting.type === 'video' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startCall(meeting)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Video className="h-4 w-4" />
                        <span>Join</span>
                      </motion.button>
                    )}
                    {meeting.type === 'phone' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Call</span>
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Reschedule
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Meetings</h2>
          <div className="grid gap-4">
            {pastMeetings.map((meeting) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(meeting.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{meeting.time} ({meeting.duration} min)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(meeting.type)}
                        <span className="capitalize">{meeting.type}</span>
                      </div>
                    </div>
                    
                    {meeting.description && (
                      <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      <strong>Participants:</strong> {meeting.participants.join(', ')}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                    >
                      View Recording
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Transcript
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No meetings found */}
      {filteredMeetings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Schedule your first consultation to get started'
            }
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Meeting</span>
          </motion.button>
        </motion.div>
      )}

      {/* Video Call Modal */}
      {showVideoCall && selectedMeeting && (
        <VideoCallModal
          meeting={selectedMeeting}
          onEndCall={endCall}
        />
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </div>
  )
}

export default VideoCallView