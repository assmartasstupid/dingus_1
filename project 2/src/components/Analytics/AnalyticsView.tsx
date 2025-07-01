import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, DollarSign, FileText, MessageSquare, Calendar, Target } from 'lucide-react'
import { motion } from 'framer-motion'

interface AnalyticsData {
  caseProgress: {
    totalCases: number
    activeCases: number
    completedCases: number
    averageResolutionTime: number
  }
  communication: {
    totalMessages: number
    responseTime: number
    meetingsHeld: number
    documentsShared: number
  }
  billing: {
    totalBilled: number
    totalPaid: number
    averageHourlyRate: number
    hoursLogged: number
  }
  timeline: {
    month: string
    cases: number
    hours: number
    billing: number
  }[]
}

const AnalyticsView: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('6months')

  useEffect(() => {
    // Mock analytics data - in production, fetch from your database
    const mockData: AnalyticsData = {
      caseProgress: {
        totalCases: 12,
        activeCases: 4,
        completedCases: 8,
        averageResolutionTime: 45 // days
      },
      communication: {
        totalMessages: 156,
        responseTime: 2.5, // hours
        meetingsHeld: 18,
        documentsShared: 34
      },
      billing: {
        totalBilled: 28500,
        totalPaid: 24200,
        averageHourlyRate: 250,
        hoursLogged: 114
      },
      timeline: [
        { month: 'Jul', cases: 2, hours: 18, billing: 4500 },
        { month: 'Aug', cases: 3, hours: 24, billing: 6000 },
        { month: 'Sep', cases: 1, hours: 12, billing: 3000 },
        { month: 'Oct', cases: 2, hours: 20, billing: 5000 },
        { month: 'Nov', cases: 3, hours: 28, billing: 7000 },
        { month: 'Dec', cases: 1, hours: 12, billing: 3000 }
      ]
    }

    setTimeout(() => {
      setAnalyticsData(mockData)
      setLoading(false)
    }, 1000)
  }, [timeRange])

  const calculateProgress = (current: number, total: number) => {
    return total > 0 ? (current / total) * 100 : 0
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!analyticsData) return null

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your legal case progress and insights</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{analyticsData.caseProgress.totalCases}</p>
              <p className="text-sm text-gray-600">Total Cases</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-medium">{analyticsData.caseProgress.activeCases}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium">{analyticsData.caseProgress.completedCases}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">${analyticsData.billing.totalBilled.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Billed</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Paid</span>
              <span className="font-medium">${analyticsData.billing.totalPaid.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${calculateProgress(analyticsData.billing.totalPaid, analyticsData.billing.totalBilled)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{analyticsData.billing.hoursLogged}</p>
              <p className="text-sm text-gray-600">Hours Logged</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Rate</span>
              <span className="font-medium">${analyticsData.billing.averageHourlyRate}/hr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Resolution Time</span>
              <span className="font-medium">{analyticsData.caseProgress.averageResolutionTime} days</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{analyticsData.communication.totalMessages}</p>
              <p className="text-sm text-gray-600">Messages</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Response Time</span>
              <span className="font-medium">{analyticsData.communication.responseTime}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Meetings</span>
              <span className="font-medium">{analyticsData.communication.meetingsHeld}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Case Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Case Progress</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Completed Cases</span>
              <span className="text-sm font-bold text-green-600">
                {analyticsData.caseProgress.completedCases}/{analyticsData.caseProgress.totalCases}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${calculateProgress(analyticsData.caseProgress.completedCases, analyticsData.caseProgress.totalCases)}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Active Cases</span>
              <span className="text-sm font-bold text-blue-600">
                {analyticsData.caseProgress.activeCases}/{analyticsData.caseProgress.totalCases}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${calculateProgress(analyticsData.caseProgress.activeCases, analyticsData.caseProgress.totalCases)}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Average Resolution Time</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.caseProgress.averageResolutionTime} days</p>
            <p className="text-xs text-gray-500">Based on completed cases</p>
          </div>
        </motion.div>

        {/* Timeline Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {analyticsData.timeline.map((month, index) => (
              <div key={month.month} className="flex items-center space-x-4">
                <div className="w-8 text-sm font-medium text-gray-600">{month.month}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Cases: {month.cases}</span>
                    <span className="text-gray-500">Hours: {month.hours}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(month.billing / 7000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs font-medium text-gray-900">${month.billing.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Communication Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Communication Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{analyticsData.communication.totalMessages}</p>
            <p className="text-sm text-gray-600">Total Messages</p>
            <p className="text-xs text-gray-500 mt-1">Avg 26 per case</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{analyticsData.communication.responseTime}h</p>
            <p className="text-sm text-gray-600">Avg Response Time</p>
            <p className="text-xs text-gray-500 mt-1">Within business hours</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{analyticsData.communication.meetingsHeld}</p>
            <p className="text-sm text-gray-600">Meetings Held</p>
            <p className="text-xs text-gray-500 mt-1">1.5 per case avg</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AnalyticsView