import React, { useState } from 'react'
import { BookOpen, Users, TrendingUp, Lightbulb, Calendar, FileText, Award, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface LegalResource {
  id: string
  title: string
  type: 'article' | 'guide' | 'template' | 'webinar'
  category: string
  description: string
  readTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  featured: boolean
}

interface NetworkingEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'webinar' | 'workshop' | 'networking' | 'seminar'
  description: string
  speakers: string[]
  capacity: number
  registered: number
}

const ValueAddedServices: React.FC = () => {
  const [activeTab, setActiveTab] = useState('resources')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const legalResources: LegalResource[] = [
    {
      id: '1',
      title: 'Understanding Employment Contracts: A Complete Guide',
      type: 'guide',
      category: 'employment',
      description: 'Comprehensive guide to understanding your rights and obligations in employment contracts.',
      readTime: 15,
      difficulty: 'beginner',
      tags: ['contracts', 'employment', 'rights'],
      featured: true
    },
    {
      id: '2',
      title: 'Intellectual Property Protection for Startups',
      type: 'article',
      category: 'ip',
      description: 'Essential strategies for protecting your intellectual property as a startup.',
      readTime: 8,
      difficulty: 'intermediate',
      tags: ['ip', 'startups', 'protection'],
      featured: true
    },
    {
      id: '3',
      title: 'Contract Review Checklist Template',
      type: 'template',
      category: 'contracts',
      description: 'Downloadable checklist for reviewing business contracts.',
      readTime: 5,
      difficulty: 'beginner',
      tags: ['contracts', 'checklist', 'business'],
      featured: false
    },
    {
      id: '4',
      title: 'Navigating Corporate Compliance in 2024',
      type: 'webinar',
      category: 'compliance',
      description: 'Live webinar covering the latest compliance requirements for businesses.',
      readTime: 60,
      difficulty: 'advanced',
      tags: ['compliance', 'corporate', '2024'],
      featured: true
    }
  ]

  const networkingEvents: NetworkingEvent[] = [
    {
      id: '1',
      title: 'Legal Tech Innovation Summit',
      date: '2024-02-15',
      time: '2:00 PM EST',
      type: 'seminar',
      description: 'Explore the latest innovations in legal technology and their impact on the industry.',
      speakers: ['Sarah Johnson, Legal Tech Expert', 'Michael Chen, AI Researcher'],
      capacity: 100,
      registered: 67
    },
    {
      id: '2',
      title: 'Small Business Legal Workshop',
      date: '2024-02-20',
      time: '10:00 AM EST',
      type: 'workshop',
      description: 'Interactive workshop covering essential legal considerations for small businesses.',
      speakers: ['Attorney Smith', 'Business Consultant Davis'],
      capacity: 50,
      registered: 23
    },
    {
      id: '3',
      title: 'Client Networking Mixer',
      date: '2024-02-25',
      time: '6:00 PM EST',
      type: 'networking',
      description: 'Casual networking event for clients to connect and share experiences.',
      speakers: ['Various Industry Leaders'],
      capacity: 75,
      registered: 45
    }
  ]

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'employment', label: 'Employment Law' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'ip', label: 'Intellectual Property' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'business', label: 'Business Law' }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />
      case 'guide':
        return <BookOpen className="h-4 w-4" />
      case 'template':
        return <FileText className="h-4 w-4" />
      case 'webinar':
        return <Calendar className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50'
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50'
      case 'advanced':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'webinar':
        return 'text-blue-600 bg-blue-50'
      case 'workshop':
        return 'text-green-600 bg-green-50'
      case 'networking':
        return 'text-purple-600 bg-purple-50'
      case 'seminar':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredResources = legalResources.filter(resource => 
    selectedCategory === 'all' || resource.category === selectedCategory
  )

  const renderResources = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <motion.button
            key={category.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </motion.button>
        ))}
      </div>

      {/* Featured Resources */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-500" />
          Featured Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.filter(r => r.featured).map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(resource.type)}
                  <span className="text-sm font-medium text-blue-600 capitalize">{resource.type}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                  {resource.difficulty}
                </span>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">{resource.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{resource.readTime} min read</span>
                  <span>•</span>
                  <span>{resource.tags.join(', ')}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Access
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* All Resources */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Resources</h3>
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(resource.type)}
                      <span className="text-sm font-medium text-gray-600 capitalize">{resource.type}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty}
                    </span>
                    {resource.featured && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{resource.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{resource.readTime} min read</span>
                    <span>•</span>
                    <span>{resource.tags.join(', ')}</span>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors ml-4"
                >
                  Access
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center space-x-3 mb-3">
          <Users className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Exclusive Client Events</h3>
        </div>
        <p className="text-gray-600">
          Join our exclusive events designed to educate, connect, and empower our clients. 
          Network with fellow entrepreneurs and learn from industry experts.
        </p>
      </div>

      <div className="grid gap-6">
        {networkingEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <span>{event.time}</span>
                  <span>{event.registered}/{event.capacity} registered</span>
                </div>
                
                <p className="text-gray-600 mb-3">{event.description}</p>
                
                <div className="text-sm text-gray-600">
                  <strong>Speakers:</strong> {event.speakers.join(', ')}
                </div>
              </div>
              
              <div className="ml-6 text-center">
                <div className="mb-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Register
                </motion.button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Registration Progress</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((event.registered / event.capacity) * 100)}% full
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'resources', label: 'Legal Resources', icon: BookOpen },
    { id: 'events', label: 'Client Events', icon: Users },
    { id: 'insights', label: 'Market Insights', icon: TrendingUp },
    { id: 'tools', label: 'Business Tools', icon: Lightbulb }
  ]

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Award className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Value-Added Services</h1>
            <p className="text-gray-600">Exclusive resources and opportunities for our clients</p>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-medium">
            🎯 Beyond Legal Services: Education, Networking & Business Growth
          </p>
          <p className="text-purple-700 text-sm mt-1">
            Access exclusive content, connect with fellow entrepreneurs, and grow your business with our comprehensive support ecosystem.
          </p>
        </div>
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
                    ? 'bg-white text-purple-600 shadow-sm'
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
        {activeTab === 'resources' && renderResources()}
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'insights' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Market Insights Coming Soon</h3>
            <p className="text-gray-500">Industry trends, market analysis, and strategic insights will be available here.</p>
          </div>
        )}
        {activeTab === 'tools' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Business Tools Coming Soon</h3>
            <p className="text-gray-500">Exclusive business tools and calculators will be available here.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ValueAddedServices