import React, { useState } from 'react'
import { Bot, FileText, Search, Lightbulb, AlertTriangle, CheckCircle, Upload, Download } from 'lucide-react'
import { motion } from 'framer-motion'

interface AIAnalysis {
  id: string
  type: 'contract' | 'document' | 'case'
  title: string
  summary: string
  riskLevel: 'low' | 'medium' | 'high'
  keyFindings: string[]
  recommendations: string[]
  confidence: number
  createdAt: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: string
}

const AIAssistantView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI legal assistant. I can help you analyze documents, answer legal questions, and provide insights about your cases. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([
    {
      id: '1',
      type: 'contract',
      title: 'Employment Contract Analysis',
      summary: 'Comprehensive analysis of employment agreement with ABC Corp. Identified several areas of concern regarding termination clauses and non-compete agreements.',
      riskLevel: 'medium',
      keyFindings: [
        'Non-compete clause extends 24 months post-termination',
        'Termination notice period is below industry standard',
        'Intellectual property assignment is broadly defined',
        'Severance package terms are favorable'
      ],
      recommendations: [
        'Negotiate reduction of non-compete period to 12 months',
        'Request clarification on intellectual property scope',
        'Consider adding specific performance metrics for termination'
      ],
      confidence: 87,
      createdAt: '2024-01-20'
    },
    {
      id: '2',
      type: 'document',
      title: 'Legal Brief Analysis',
      summary: 'Analysis of opposing counsel\'s motion to dismiss. Identified potential weaknesses in their arguments and suggested counter-strategies.',
      riskLevel: 'low',
      keyFindings: [
        'Motion lacks sufficient legal precedent',
        'Factual assertions are not well-supported',
        'Procedural requirements appear to be met',
        'Timeline favors our position'
      ],
      recommendations: [
        'File comprehensive response highlighting precedent gaps',
        'Request additional discovery on disputed facts',
        'Consider cross-motion for summary judgment'
      ],
      confidence: 92,
      createdAt: '2024-01-18'
    }
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(newMessage),
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, aiResponse])
      setLoading(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      'Based on your question, I\'d recommend reviewing the relevant case law in your jurisdiction. The key precedents to consider are...',
      'This is an interesting legal question. From my analysis of similar cases, the typical approach would be to...',
      'I\'ve analyzed your document and found several important points to consider. Let me break down the key issues...',
      'According to current legal standards and best practices, I would suggest the following approach...',
      'This situation requires careful consideration of multiple factors. Here\'s my analysis of the potential outcomes...'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  const renderChat = () => (
    <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-full">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Legal Assistant</h3>
            <p className="text-sm text-gray-500">Online • Ready to help</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about your legal matters..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={loading || !newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  )

  const renderAnalyses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Document Analyses</h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Analyze Document</span>
        </motion.button>
      </div>

      <div className="grid gap-6">
        {analyses.map((analysis) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="font-semibold text-gray-900">{analysis.title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(analysis.riskLevel)}`}>
                  {analysis.riskLevel.toUpperCase()} RISK
                </span>
                <span className="text-sm text-gray-500">{analysis.confidence}% confidence</span>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{analysis.summary}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Search className="h-4 w-4 mr-1" />
                  Key Findings
                </h5>
                <ul className="space-y-1">
                  {analysis.keyFindings.map((finding, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Recommendations
                </h5>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <AlertTriangle className="h-3 w-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors flex items-center space-x-1"
              >
                <Download className="h-3 w-3" />
                <span>Export Report</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                View Details
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: Bot },
    { id: 'analyses', label: 'Document Analysis', icon: FileText },
    { id: 'insights', label: 'Case Insights', icon: Lightbulb }
  ]

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Legal Assistant</h1>
        <p className="text-gray-600">Get intelligent insights and assistance for your legal matters</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </motion.button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'analyses' && renderAnalyses()}
        {activeTab === 'insights' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Case Insights Coming Soon</h3>
            <p className="text-gray-500">AI-powered case analysis and predictive insights will be available here.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AIAssistantView