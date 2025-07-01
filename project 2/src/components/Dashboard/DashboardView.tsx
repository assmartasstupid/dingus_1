import React, { useEffect, useState } from 'react'
import { FileText, MessageSquare, Clock, CheckCircle, AlertTriangle, Eye, Zap, Award } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import MessageModal from '../Modals/MessageModal'
import DocumentUploadModal from '../Modals/DocumentUploadModal'
import ScheduleModal from '../Modals/ScheduleModal'

interface DashboardStats {
  activeCases: number
  unreadMessages: number
  pendingDocuments: number
  upcomingDeadlines: number
}

interface QuickInsight {
  id: string
  type: 'transparency' | 'proactive' | 'value-added'
  title: string
  description: string
  action: string
  priority: 'low' | 'medium' | 'high'
}

const DashboardView: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    activeCases: 0,
    unreadMessages: 0,
    pendingDocuments: 0,
    upcomingDeadlines: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [quickInsights, setQuickInsights] = useState<QuickInsight[]>([])
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch client data
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (client) {
        // Fetch cases count
        const { count: casesCount } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .eq('status', 'active')

        // Fetch unread messages count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .is('read_at', null)
          .neq('sender_id', user.id)

        setStats({
          activeCases: casesCount || 0,
          unreadMessages: unreadCount || 0,
          pendingDocuments: 3, // Mock data
          upcomingDeadlines: 2 // Mock data
        })

        // Fetch recent activity
        const { data: cases } = await supabase
          .from('cases')
          .select('*')
          .eq('client_id', client.id)
          .order('updated_at', { ascending: false })
          .limit(5)

        setRecentActivity(cases || [])

        // Mock quick insights
        const insights: QuickInsight[] = [
          {
            id: '1',
            type: 'transparency',
            title: 'Billing Transparency Available',
            description: 'View detailed breakdown of all legal costs and time spent on your matters.',
            action: 'View Transparency Dashboard',
            priority: 'medium'
          },
          {
            id: '2',
            type: 'proactive',
            title: 'Contract Renewal Alert',
            description: 'Your employment contract expires in 30 days. Early action recommended.',
            action: 'View Smart Alerts',
            priority: 'high'
          },
          {
            id: '3',
            type: 'value-added',
            title: 'New Legal Resources Available',
            description: 'Access exclusive guides and templates for business growth.',
            action: 'Explore Resources',
            priority: 'low'
          }
        ]
        setQuickInsights(insights)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'transparency':
        return <Eye className="h-5 w-5" />
      case 'proactive':
        return <Zap className="h-5 w-5" />
      case 'value-added':
        return <Award className="h-5 w-5" />
      default:
        return <CheckCircle className="h-5 w-5" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'transparency':
        return 'text-blue-600 bg-blue-50'
      case 'proactive':
        return 'text-yellow-600 bg-yellow-50'
      case 'value-added':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const statCards = [
    {
      title: 'Active Cases',
      value: stats.activeCases,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending Documents',
      value: stats.pendingDocuments,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ]

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-600">Here's an overview of your legal matters</p>
      </motion.div>

      {/* Enhanced Value Proposition Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">🚀 Next-Generation Legal Services</h2>
            <p className="text-blue-100">
              Experience 100% transparent billing, AI-powered insights, and exclusive client resources
            </p>
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              Learn More
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Smart Insights</h2>
          <div className="space-y-4">
            {quickInsights.map((insight) => (
              <div
                key={insight.id}
                className={`border-l-4 ${getPriorityColor(insight.priority)} bg-gray-50 p-4 rounded-r-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    {insight.action}
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMessageModal(true)}
              className="w-full bg-blue-50 text-blue-700 p-4 rounded-lg text-left hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Send a Message</span>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDocumentModal(true)}
              className="w-full bg-green-50 text-green-700 p-4 rounded-lg text-left hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5" />
                <span className="font-medium">Upload Document</span>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowScheduleModal(true)}
              className="w-full bg-purple-50 text-purple-700 p-4 rounded-lg text-left hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Schedule Consultation</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(activity.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
      />
      
      <DocumentUploadModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
      />
      
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </div>
  )
}

export default DashboardView