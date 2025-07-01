import React, { useState, useEffect } from 'react'
import { CheckSquare, Square, Plus, Calendar, User, Flag, Filter, Search, Clock, MoreVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import NewTaskModal from './NewTaskModal'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  assignedTo: string
  caseId?: string
  caseName?: string
  category: string
  estimatedHours: number
  createdAt: string
  completedAt?: string
  dependencies?: string[]
}

const TasksView: React.FC = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [sortBy, setSortBy] = useState('dueDate')

  useEffect(() => {
    // Mock data - in production, fetch from your database
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Review contract terms',
        description: 'Analyze the employment contract for potential issues and provide feedback',
        status: 'pending',
        priority: 'high',
        dueDate: '2024-02-01',
        assignedTo: 'client',
        caseId: '1',
        caseName: 'Employment Dispute',
        category: 'legal',
        estimatedHours: 2,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'Gather supporting documents',
        description: 'Collect all relevant employment records and communications',
        status: 'in_progress',
        priority: 'medium',
        dueDate: '2024-01-30',
        assignedTo: 'client',
        caseId: '1',
        caseName: 'Employment Dispute',
        category: 'intake',
        estimatedHours: 1,
        createdAt: '2024-01-15'
      },
      {
        id: '3',
        title: 'Sign retainer agreement',
        description: 'Review and sign the legal services agreement',
        status: 'completed',
        priority: 'high',
        dueDate: '2024-01-20',
        assignedTo: 'client',
        caseId: '2',
        caseName: 'Contract Review - ABC Corp',
        category: 'general',
        estimatedHours: 0.5,
        createdAt: '2024-01-10',
        completedAt: '2024-01-18'
      },
      {
        id: '4',
        title: 'Research case precedents',
        description: 'Find similar cases and analyze their outcomes',
        status: 'pending',
        priority: 'medium',
        dueDate: '2024-02-05',
        assignedTo: 'lawyer',
        caseId: '1',
        caseName: 'Employment Dispute',
        category: 'research',
        estimatedHours: 4,
        createdAt: '2024-01-20'
      },
      {
        id: '5',
        title: 'Prepare court filing',
        description: 'Draft and prepare initial court documents',
        status: 'pending',
        priority: 'high',
        dueDate: '2024-02-10',
        assignedTo: 'lawyer',
        caseId: '1',
        caseName: 'Employment Dispute',
        category: 'filing',
        estimatedHours: 3,
        createdAt: '2024-01-22'
      }
    ]

    setTasks(mockTasks)
    setLoading(false)
  }, [])

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev])
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'pending':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'legal':
        return 'text-purple-600 bg-purple-50'
      case 'research':
        return 'text-blue-600 bg-blue-50'
      case 'filing':
        return 'text-orange-600 bg-orange-50'
      case 'meeting':
        return 'text-green-600 bg-green-50'
      case 'intake':
        return 'text-indigo-600 bg-indigo-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 
                         task.status === 'pending' ? 'in_progress' : 'completed'
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        }
      }
      return task
    }))
  }

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed'
  }

  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'status':
          const statusOrder = { pending: 3, in_progress: 2, completed: 1 }
          return statusOrder[b.status] - statusOrder[a.status]
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })
  }

  const filteredTasks = sortTasks(tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.caseName && task.caseName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  }))

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'legal', label: 'Legal Review' },
    { value: 'research', label: 'Research' },
    { value: 'filing', label: 'Court Filing' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'intake', label: 'Client Intake' }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage your case-related tasks and deadlines</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewTaskModal(true)}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </motion.button>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="dueDate">Sort by Due Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first task to get started'
            }
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewTaskModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-all ${
                isOverdue(task.dueDate, task.status) ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleTaskStatus(task.id)}
                  className="mt-1"
                >
                  {task.status === 'completed' ? (
                    <CheckSquare className="h-5 w-5 text-green-500" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </motion.button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      <p className={`text-sm mt-1 ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        <Flag className="h-3 w-3 inline mr-1" />
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                        {categories.find(c => c.value === task.category)?.label}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        {isOverdue(task.dueDate, task.status) && (
                          <span className="text-red-500 font-medium">(Overdue)</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{task.assignedTo === 'client' ? 'You' : task.assignedTo === 'lawyer' ? 'Legal Team' : 'Both'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{task.estimatedHours}h estimated</span>
                      </div>
                    </div>
                    {task.caseName && (
                      <span className="text-blue-600 font-medium">{task.caseName}</span>
                    )}
                  </div>

                  {task.completedAt && (
                    <div className="mt-2 text-xs text-green-600">
                      Completed on {new Date(task.completedAt).toLocaleDateString()}
                    </div>
                  )}

                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Depends on: {task.dependencies.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  )
}

export default TasksView