import React, { useState, useEffect } from 'react'
import { DollarSign, Clock, FileText, TrendingUp, Eye, Shield, Award, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

interface BillingTransparency {
  totalBilled: number
  hoursLogged: number
  averageRate: number
  taskBreakdown: {
    task: string
    hours: number
    rate: number
    total: number
    date: string
  }[]
  upcomingCosts: {
    description: string
    estimatedCost: number
    timeline: string
  }[]
}

interface CaseProgress {
  milestones: {
    name: string
    completed: boolean
    dueDate: string
    description: string
    impact: 'low' | 'medium' | 'high'
  }[]
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
    mitigation: string[]
  }
  successProbability: number
  timelineAccuracy: number
}

const TransparencyDashboard: React.FC = () => {
  const { user } = useAuth()
  const [billingData, setBillingData] = useState<BillingTransparency | null>(null)
  const [caseProgress, setCaseProgress] = useState<CaseProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in production, fetch from your database
    const mockBilling: BillingTransparency = {
      totalBilled: 8750,
      hoursLogged: 35,
      averageRate: 250,
      taskBreakdown: [
        {
          task: 'Contract Review & Analysis',
          hours: 8,
          rate: 250,
          total: 2000,
          date: '2024-01-15'
        },
        {
          task: 'Legal Research - Employment Law',
          hours: 12,
          rate: 200,
          total: 2400,
          date: '2024-01-18'
        },
        {
          task: 'Document Preparation',
          hours: 6,
          rate: 250,
          total: 1500,
          date: '2024-01-22'
        },
        {
          task: 'Client Consultation',
          hours: 4,
          rate: 300,
          total: 1200,
          date: '2024-01-25'
        },
        {
          task: 'Court Filing Preparation',
          hours: 5,
          rate: 250,
          total: 1250,
          date: '2024-01-28'
        }
      ],
      upcomingCosts: [
        {
          description: 'Court Filing Fees',
          estimatedCost: 450,
          timeline: 'Next 2 weeks'
        },
        {
          description: 'Expert Witness Consultation',
          estimatedCost: 1200,
          timeline: 'Next month'
        },
        {
          description: 'Discovery Document Review',
          estimatedCost: 800,
          timeline: 'Next 3 weeks'
        }
      ]
    }

    const mockProgress: CaseProgress = {
      milestones: [
        {
          name: 'Initial Case Assessment',
          completed: true,
          dueDate: '2024-01-10',
          description: 'Complete review of case merits and initial strategy',
          impact: 'high'
        },
        {
          name: 'Discovery Phase',
          completed: true,
          dueDate: '2024-01-25',
          description: 'Gather all relevant documents and evidence',
          impact: 'high'
        },
        {
          name: 'Expert Witness Identification',
          completed: false,
          dueDate: '2024-02-15',
          description: 'Identify and retain expert witnesses',
          impact: 'medium'
        },
        {
          name: 'Mediation Attempt',
          completed: false,
          dueDate: '2024-03-01',
          description: 'Attempt resolution through mediation',
          impact: 'high'
        },
        {
          name: 'Trial Preparation',
          completed: false,
          dueDate: '2024-04-01',
          description: 'Prepare all materials for trial',
          impact: 'high'
        }
      ],
      riskAssessment: {
        level: 'medium',
        factors: [
          'Opposing party has strong legal representation',
          'Some documentation gaps in evidence',
          'Jurisdiction has mixed precedent on similar cases'
        ],
        mitigation: [
          'Engaging additional expert witnesses',
          'Pursuing alternative dispute resolution',
          'Strengthening documentation through discovery'
        ]
      },
      successProbability: 75,
      timelineAccuracy: 88
    }

    setBillingData(mockBilling)
    setCaseProgress(mockProgress)
    setLoading(false)
  }, [])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
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
          <Eye className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transparency Dashboard</h1>
            <p className="text-gray-600">Complete visibility into your legal matter</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <p className="text-blue-800 font-medium">100% Transparent Billing & Progress Tracking</p>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Every hour, every task, every cost - fully documented and explained in real-time.
          </p>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investment</p>
              <p className="text-3xl font-bold text-gray-900">${billingData?.totalBilled.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {billingData?.hoursLogged} hours @ avg ${billingData?.averageRate}/hr
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Probability</p>
              <p className="text-3xl font-bold text-green-600">{caseProgress?.successProbability}%</p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Based on case analysis</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Timeline Accuracy</p>
              <p className="text-3xl font-bold text-blue-600">{caseProgress?.timelineAccuracy}%</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Prediction reliability</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Milestones Complete</p>
              <p className="text-3xl font-bold text-purple-600">
                {caseProgress?.milestones.filter(m => m.completed).length}/{caseProgress?.milestones.length}
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Case progression</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Billing Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Detailed Billing Breakdown
          </h3>
          
          <div className="space-y-4">
            {billingData?.taskBreakdown.map((task, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{task.task}</h4>
                  <span className="font-bold text-gray-900">${task.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{task.hours}h × ${task.rate}/hr</span>
                  <span>{new Date(task.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Upcoming Estimated Costs</h4>
            <div className="space-y-2">
              {billingData?.upcomingCosts.map((cost, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-900">{cost.description}</span>
                    <span className="text-gray-500 ml-2">({cost.timeline})</span>
                  </div>
                  <span className="font-medium text-gray-900">${cost.estimatedCost.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Case Progress & Risk Assessment */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Milestones */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Case Milestones
            </h3>
            
            <div className="space-y-4">
              {caseProgress?.milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-4 h-4 rounded-full mt-1 ${
                    milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${
                        milestone.completed ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {milestone.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(milestone.impact)}`}>
                          {milestone.impact} impact
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(milestone.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-orange-500" />
              Risk Assessment
            </h3>
            
            <div className={`p-4 rounded-lg border mb-4 ${getRiskColor(caseProgress?.riskAssessment.level || 'medium')}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overall Risk Level</span>
                <span className="font-bold uppercase">{caseProgress?.riskAssessment.level}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
                <ul className="space-y-1">
                  {caseProgress?.riskAssessment.factors.map((factor, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Mitigation Strategies</h4>
                <ul className="space-y-1">
                  {caseProgress?.riskAssessment.mitigation.map((strategy, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TransparencyDashboard