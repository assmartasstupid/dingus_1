import React, { useState, useEffect } from 'react'
import { Bell, AlertTriangle, TrendingUp, Calendar, Shield, Zap, CheckCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProactiveAlert {
  id: string
  type: 'deadline' | 'opportunity' | 'risk' | 'compliance' | 'market' | 'legal_update'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  actionRequired: boolean
  dueDate?: string
  category: string
  impact: 'low' | 'medium' | 'high'
  recommendations: string[]
  relatedCase?: string
  dismissed: boolean
  createdAt: string
}

const ProactiveAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'dismissed'>('active')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in production, this would come from AI analysis
    const mockAlerts: ProactiveAlert[] = [
      {
        id: '1',
        type: 'deadline',
        priority: 'urgent',
        title: 'Contract Renewal Deadline Approaching',
        description: 'Your employment contract with ABC Corp expires in 30 days. Early renewal negotiations could secure better terms.',
        actionRequired: true,
        dueDate: '2024-02-28',
        category: 'Employment',
        impact: 'high',
        recommendations: [
          'Schedule renewal discussion with HR',
          'Review current market rates for your position',
          'Prepare list of achievements for negotiation'
        ],
        relatedCase: 'Employment Contract Review',
        dismissed: false,
        createdAt: '2024-01-29'
      },
      {
        id: '2',
        type: 'legal_update',
        priority: 'high',
        title: 'New Employment Law Changes',
        description: 'Recent legislation affects remote work policies. Your current agreement may need updates to ensure compliance.',
        actionRequired: true,
        category: 'Employment',
        impact: 'medium',
        recommendations: [
          'Review remote work clauses in current contract',
          'Update employee handbook if applicable',
          'Consult on compliance requirements'
        ],
        dismissed: false,
        createdAt: '2024-01-28'
      },
      {
        id: '3',
        type: 'opportunity',
        priority: 'medium',
        title: 'Intellectual Property Protection Opportunity',
        description: 'Your recent project innovations may qualify for patent protection. Acting quickly could secure competitive advantages.',
        actionRequired: false,
        category: 'Intellectual Property',
        impact: 'high',
        recommendations: [
          'Document all innovative processes and methods',
          'Conduct prior art search',
          'File provisional patent application'
        ],
        dismissed: false,
        createdAt: '2024-01-27'
      },
      {
        id: '4',
        type: 'compliance',
        priority: 'high',
        title: 'Data Privacy Audit Recommended',
        description: 'Based on your business growth, a comprehensive data privacy audit would ensure GDPR/CCPA compliance.',
        actionRequired: true,
        category: 'Privacy & Compliance',
        impact: 'high',
        recommendations: [
          'Inventory all data collection practices',
          'Review privacy policies and notices',
          'Implement data retention schedules',
          'Train staff on privacy requirements'
        ],
        dismissed: false,
        createdAt: '2024-01-26'
      },
      {
        id: '5',
        type: 'market',
        priority: 'medium',
        title: 'Industry Merger Activity Alert',
        description: 'Increased M&A activity in your sector. Consider reviewing shareholder agreements and exit strategies.',
        actionRequired: false,
        category: 'Corporate',
        impact: 'medium',
        recommendations: [
          'Review current shareholder agreements',
          'Update company valuation',
          'Prepare due diligence materials'
        ],
        dismissed: false,
        createdAt: '2024-01-25'
      }
    ]

    setAlerts(mockAlerts)
    setLoading(false)
  }, [])

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ))
  }

  const undismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: false } : alert
    ))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="h-5 w-5" />
      case 'opportunity':
        return <TrendingUp className="h-5 w-5" />
      case 'risk':
        return <AlertTriangle className="h-5 w-5" />
      case 'compliance':
        return <Shield className="h-5 w-5" />
      case 'market':
        return <TrendingUp className="h-5 w-5" />
      case 'legal_update':
        return <Bell className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'text-red-600 bg-red-50'
      case 'opportunity':
        return 'text-green-600 bg-green-50'
      case 'risk':
        return 'text-orange-600 bg-orange-50'
      case 'compliance':
        return 'text-blue-600 bg-blue-50'
      case 'market':
        return 'text-purple-600 bg-purple-50'
      case 'legal_update':
        return 'text-indigo-600 bg-indigo-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-700 bg-red-100 border-red-300'
      case 'high':
        return 'text-orange-700 bg-orange-100 border-orange-300'
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'low':
        return 'text-green-700 bg-green-100 border-green-300'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && !alert.dismissed) ||
                         (filter === 'dismissed' && alert.dismissed)
    const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter
    return matchesFilter && matchesPriority
  })

  const alertStats = {
    total: alerts.length,
    active: alerts.filter(a => !a.dismissed).length,
    urgent: alerts.filter(a => a.priority === 'urgent' && !a.dismissed).length,
    actionRequired: alerts.filter(a => a.actionRequired && !a.dismissed).length
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
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
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Proactive Legal Alerts</h1>
            <p className="text-gray-600">AI-powered insights to keep you ahead of legal issues</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800 font-medium">Proactive Legal Intelligence</p>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Our AI continuously monitors legal developments, deadlines, and opportunities relevant to your matters.
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{alertStats.total}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-blue-600">{alertStats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-3xl font-bold text-red-600">{alertStats.urgent}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Action Required</p>
              <p className="text-3xl font-bold text-orange-600">{alertStats.actionRequired}</p>
            </div>
            <Zap className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex space-x-2">
          {['active', 'dismissed', 'all'].map(filterOption => (
            <motion.button
              key={filterOption}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(filterOption as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </motion.button>
          ))}
        </div>
        
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-all ${
                alert.priority === 'urgent' ? 'border-red-300' : 'border-gray-200'
              } ${alert.dismissed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(alert.type)}`}>
                    {getTypeIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(alert.priority)}`}>
                        {alert.priority.toUpperCase()}
                      </span>
                      {alert.actionRequired && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Action Required
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{alert.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                      <span>Category: {alert.category}</span>
                      <span className={`font-medium ${getImpactColor(alert.impact)}`}>
                        {alert.impact.charAt(0).toUpperCase() + alert.impact.slice(1)} Impact
                      </span>
                      {alert.dueDate && (
                        <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                      )}
                      {alert.relatedCase && (
                        <span>Case: {alert.relatedCase}</span>
                      )}
                    </div>
                    
                    {alert.recommendations.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                        <ul className="space-y-1">
                          {alert.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {!alert.dismissed ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => dismissAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Dismiss alert"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => undismissAlert(alert.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      Restore
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAlerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
          <p className="text-gray-500">
            {filter === 'dismissed' 
              ? 'No dismissed alerts to show'
              : 'All caught up! No active alerts at this time.'
            }
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default ProactiveAlerts