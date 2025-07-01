import React, { useState } from 'react'
import { X, Plus, Calendar, Flag, User, FileText, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated: (task: any) => void
}

interface TaskTemplate {
  id: string
  name: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimatedHours: number
  category: string
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onTaskCreated }) => {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    assignedTo: 'client',
    category: 'general',
    estimatedHours: 1,
    dependencies: [] as string[],
    attachments: [] as File[]
  })
  const [useTemplate, setUseTemplate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const taskTemplates: TaskTemplate[] = [
    {
      id: '1',
      name: 'Document Review',
      description: 'Review and analyze legal documents for compliance and accuracy',
      priority: 'high',
      estimatedHours: 2,
      category: 'legal'
    },
    {
      id: '2',
      name: 'Client Information Gathering',
      description: 'Collect necessary client information and documentation',
      priority: 'medium',
      estimatedHours: 1,
      category: 'intake'
    },
    {
      id: '3',
      name: 'Research Legal Precedents',
      description: 'Research relevant case law and legal precedents',
      priority: 'medium',
      estimatedHours: 4,
      category: 'research'
    },
    {
      id: '4',
      name: 'Prepare Court Filing',
      description: 'Prepare and review court documents for filing',
      priority: 'high',
      estimatedHours: 3,
      category: 'filing'
    },
    {
      id: '5',
      name: 'Client Meeting Preparation',
      description: 'Prepare agenda and materials for client meeting',
      priority: 'medium',
      estimatedHours: 1,
      category: 'meeting'
    }
  ]

  const categories = [
    { value: 'general', label: 'General', icon: FileText },
    { value: 'legal', label: 'Legal Review', icon: FileText },
    { value: 'research', label: 'Research', icon: FileText },
    { value: 'filing', label: 'Court Filing', icon: FileText },
    { value: 'meeting', label: 'Meeting', icon: User },
    { value: 'intake', label: 'Client Intake', icon: User }
  ]

  const handleTemplateSelect = (template: TaskTemplate) => {
    setSelectedTemplate(template)
    setTaskData({
      ...taskData,
      title: template.name,
      description: template.description,
      priority: template.priority,
      category: template.category,
      estimatedHours: template.estimatedHours
    })
    setUseTemplate(true)
    setStep(2)
  }

  const handleCreateTask = async () => {
    if (!taskData.title.trim() || !taskData.dueDate) return

    setLoading(true)
    try {
      // In a real app, you'd save this to your tasks table
      const newTask = {
        id: Date.now().toString(),
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        assignedTo: taskData.assignedTo,
        category: taskData.category,
        estimatedHours: taskData.estimatedHours,
        status: 'pending',
        createdAt: new Date().toISOString(),
        dependencies: taskData.dependencies
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onTaskCreated(newTask)
      setSuccess(true)
      
      setTimeout(() => {
        setSuccess(false)
        onClose()
        resetForm()
      }, 2000)
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setTaskData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assignedTo: 'client',
      category: 'general',
      estimatedHours: 1,
      dependencies: [],
      attachments: []
    })
    setUseTemplate(false)
    setSelectedTemplate(null)
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

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Task</h3>
        <p className="text-gray-600">Choose how you'd like to create your task</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStep(2)}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
        >
          <Plus className="h-8 w-8 text-blue-600 mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Create from Scratch</h4>
          <p className="text-sm text-gray-600">Start with a blank task and customize everything</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStep(3)}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
        >
          <FileText className="h-8 w-8 text-green-600 mb-3" />
          <h4 className="font-semibold text-gray-900 mb-2">Use Template</h4>
          <p className="text-sm text-gray-600">Choose from pre-built task templates</p>
        </motion.button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
        {useTemplate && selectedTemplate && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            Using template: {selectedTemplate.name}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            value={taskData.title}
            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            placeholder="Enter task title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={taskData.description}
            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
            placeholder="Describe what needs to be done..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={taskData.priority}
              onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={taskData.dueDate}
              onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
              min={getMinDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={taskData.category}
              onChange={(e) => setTaskData({ ...taskData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              value={taskData.estimatedHours}
              onChange={(e) => setTaskData({ ...taskData, estimatedHours: parseInt(e.target.value) || 1 })}
              min="0.5"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To
          </label>
          <select
            value={taskData.assignedTo}
            onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="client">Client (You)</option>
            <option value="lawyer">Legal Team</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateTask}
          disabled={loading || !taskData.title.trim() || !taskData.dueDate}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{loading ? 'Creating...' : 'Create Task'}</span>
        </motion.button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Template</h3>
        <p className="text-gray-600">Select a template to get started quickly</p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {taskTemplates.map((template) => (
          <motion.button
            key={template.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleTemplateSelect(template)}
            className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{template.name}</h4>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(template.priority)}`}>
                  <Flag className="h-3 w-3 inline mr-1" />
                  {template.priority}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {template.estimatedHours}h
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{template.description}</p>
            <div className="mt-2">
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {categories.find(c => c.value === template.category)?.label}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  )

  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Plus className="h-8 w-8 text-green-600" />
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">Task Created!</h4>
      <p className="text-gray-600">Your task has been created and added to your task list.</p>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Plus className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">New Task</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {success ? renderSuccess() : (
                <>
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default NewTaskModal