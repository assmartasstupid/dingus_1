import React, { useEffect, useState } from 'react'
import { FileText, Clock, CheckCircle, AlertCircle, Plus, Search, Filter, Calendar, Users, MessageSquare } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import CaseTimeline from './CaseTimeline'
import MessageModal from '../Modals/MessageModal'
import DocumentUploadModal from '../Modals/DocumentUploadModal'
import ScheduleModal from '../Modals/ScheduleModal'

interface Case {
  id: string
  title: string
  description: string
  status: 'active' | 'pending' | 'closed'
  created_at: string
  updated_at: string
  progress?: number
  nextDeadline?: string
  assignedLawyer?: string
}

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  type: 'milestone' | 'document' | 'meeting' | 'deadline' | 'payment'
  status: 'completed' | 'pending' | 'overdue'
  details?: any
}

const CasesView: React.FC = () => {
  const { user } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showTimeline, setShowTimeline] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  useEffect(() => {
    fetchCases()
  }, [user])

  const fetchCases = async () => {
    if (!user) return

    try {
      // First check if user has a profile and get their role
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      // If no profile exists or user is not a client, show empty state
      if (!userProfile || userProfile.role !== 'client') {
        setCases([])
        setLoading(false)
        return
      }

      // Get the client record
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (client) {
        const { data: casesData, error } = await supabase
          .from('cases')
          .select('*')
          .eq('client_id', client.id)
          .order('updated_at', { ascending: false })

        if (error) {
          console.error('Error fetching cases:', error)
        } else {
          // Add mock progress and additional data
          const enhancedCases = (casesData || []).map(case_ => ({
            ...case_,
            progress: Math.floor(Math.random() * 100),
            nextDeadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            assignedLawyer: 'Attorney Smith'
          }))
          setCases(enhancedCases)
        }
      }
    } catch (error) {
      console.error('Error fetching cases:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTimelineEvents = (caseId: string) => {
    // Mock timeline events - in production, fetch from your database
    const mockEvents: TimelineEvent[] = [
      {
        id: '1',
        title: 'Case Initiated',
        description: 'Initial consultation completed and case opened',
        date: '2024-01-10',
        type: 'milestone',
        status: 'completed',
        details: { lawyer: 'Attorney Smith', duration: '60 minutes' }
      },
      {
        id: '2',
        title: 'Document Review',
        description: 'Contract documents submitted and under review',
        date: '2024-01-15',
        type: 'document',
        status: 'completed',
        details: { documents: 5, pages: 45 }
      },
      {
        id: '3',
        title: 'Client Meeting',
        description: 'Strategy discussion and case planning session',
        date: '2024-01-20',
        type: 'meeting',
        status: 'completed',
        details: { attendees: 3, location: 'Video Conference' }
      },
      {
        id: '4',
        title: 'Discovery Deadline',
        description: 'Submit all discovery materials to opposing counsel',
        date: '2024-02-01',
        type: 'deadline',
        status: 'pending',
        details: { priority: 'High', estimated_hours: 8 }
      },
      {
        id: '5',
        title: 'Retainer Payment',
        description: 'Monthly retainer payment due',
        date: '2024-02-05',
        type: 'payment',
        status: 'pending',
        details: { amount: '$2,500', method: 'Auto-pay' }
      }
    ]
    setTimelineEvents(mockEvents)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'closed':
        return <AlertCircle className="h-5 w-5 text-gray-500" />
      default:
        return <FileText className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const handleCaseClick = (case_: Case) => {
    setSelectedCase(case_)
    fetchTimelineEvents(case_.id)
    setShowTimeline(true)
  }

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (showTimeline && selectedCase) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowTimeline(false)}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            ← Back to Cases
          </motion.button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedCase.title}</h1>
          <p className="text-gray-600">{selectedCase.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Case Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium">{selectedCase.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${selectedCase.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned Lawyer:</span>
                  <span className="font-medium">{selectedCase.assignedLawyer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Deadline:</span>
                  <span className="font-medium">
                    {selectedCase.nextDeadline ? new Date(selectedCase.nextDeadline).toLocaleDateString() : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(selectedCase.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMessageModal(true)}
                  className="w-full bg-blue-50 text-blue-700 p-3 rounded-lg text-left hover:bg-blue-100 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Send Message</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDocumentModal(true)}
                  className="w-full bg-green-50 text-green-700 p-3 rounded-lg text-left hover:bg-green-100 transition-colors flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Upload Document</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowScheduleModal(true)}
                  className="w-full bg-purple-50 text-purple-700 p-3 rounded-lg text-left hover:bg-purple-100 transition-colors flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Meeting</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2">
            <CaseTimeline caseId={selectedCase.id} events={timelineEvents} />
          </div>
        </div>

        {/* Modals */}
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          caseId={selectedCase.id}
          caseName={selectedCase.title}
        />
        
        <DocumentUploadModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          caseId={selectedCase.id}
          caseName={selectedCase.title}
        />
        
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          caseId={selectedCase.id}
          caseName={selectedCase.title}
        />
      </div>
    )
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
            <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
            <p className="text-gray-600 mt-1">Track and manage your legal matters</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Case Request</span>
          </motion.button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search cases..."
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </motion.div>

      {filteredCases.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'You don\'t have any cases yet. Contact your legal team to get started.'
            }
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {filteredCases.map((case_, index) => (
            <motion.div
              key={case_.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCaseClick(case_)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(case_.status)}
                    <h3 className="text-xl font-semibold text-gray-900">{case_.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                      {case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{case_.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{case_.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${case_.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(case_.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated: {new Date(case_.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{case_.assignedLawyer}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCaseClick(case_)
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Timeline
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CasesView