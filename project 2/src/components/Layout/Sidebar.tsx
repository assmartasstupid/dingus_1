import React from 'react'
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Upload, 
  Settings, 
  Shield, 
  DollarSign, 
  CheckSquare, 
  Video, 
  BarChart3, 
  Bot,
  Eye,
  Award,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'cases', label: 'My Cases', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: Upload },
    { id: 'video', label: 'Video Calls', icon: Video },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'transparency', label: 'Transparency', icon: Eye, badge: 'NEW' },
    { id: 'proactive', label: 'Smart Alerts', icon: Zap, badge: 'AI' },
    { id: 'value-added', label: 'Resources', icon: Award },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto"
    >
      <nav className="p-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <li key={item.id}>
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-900 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      item.badge === 'NEW' 
                        ? 'bg-green-500 text-white'
                        : item.badge === 'AI'
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              </li>
            )
          })}
        </ul>
      </nav>
    </motion.aside>
  )
}

export default Sidebar