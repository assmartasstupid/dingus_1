import React from 'react'
import { CheckCircle, Clock, AlertTriangle, Calendar, FileText, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  type: 'milestone' | 'document' | 'meeting' | 'deadline' | 'payment'
  status: 'completed' | 'pending' | 'overdue'
  details?: any
}

interface CaseTimelineProps {
  caseId: string
  events: TimelineEvent[]
}

const CaseTimeline: React.FC<CaseTimelineProps> = ({ caseId, events }) => {
  const getEventIcon = (type: string, status: string) => {
    const iconClass = status === 'completed' ? 'text-green-500' : 
                     status === 'overdue' ? 'text-red-500' : 'text-yellow-500'
    
    switch (type) {
      case 'milestone':
        return <CheckCircle className={`h-5 w-5 ${iconClass}`} />
      case 'document':
        return <FileText className={`h-5 w-5 ${iconClass}`} />
      case 'meeting':
        return <MessageSquare className={`h-5 w-5 ${iconClass}`} />
      case 'deadline':
        return <Clock className={`h-5 w-5 ${iconClass}`} />
      case 'payment':
        return <Calendar className={`h-5 w-5 ${iconClass}`} />
      default:
        return <AlertTriangle className={`h-5 w-5 ${iconClass}`} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200'
      case 'overdue':
        return 'bg-red-100 border-red-200'
      case 'pending':
        return 'bg-yellow-100 border-yellow-200'
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Case Timeline</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start space-x-4"
            >
              {/* Timeline dot */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusColor(event.status)}`}>
                {getEventIcon(event.type, event.status)}
              </div>
              
              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  
                  {event.details && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 space-y-1">
                        {Object.entries(event.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CaseTimeline