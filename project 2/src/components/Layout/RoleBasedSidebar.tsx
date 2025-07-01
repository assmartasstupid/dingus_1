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
  Zap,
  Users,
  UserPlus,
  Building,
  Calendar,
  Clock,
  TrendingUp,
  Crown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { usePermissions } from '../../hooks/usePermissions'

interface RoleBasedSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const RoleBasedSidebar: React.FC<RoleBasedSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { userRole, isStaff, isAdmin, loading } = usePermissions()

  console.log('Sidebar render - loading:', loading, 'userRole:', userRole, 'isAdmin:', isAdmin())

  // Show a simple loading state
  if (loading) {
    return (
      <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
        <nav className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </nav>
      </aside>
    )
  }

  // Define menu items based on roles
  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'attorney', 'paralegal', 'client'] }
    ]

    const clientItems = [
      { id: 'cases', label: 'My Cases', icon: FileText, roles: ['client'] },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare, roles: ['client'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['client'] },
      { id: 'documents', label: 'Documents', icon: Upload, roles: ['client'] },
      { id: 'video', label: 'Video Calls', icon: Video, roles: ['client'] },
      { id: 'billing', label: 'Billing', icon: DollarSign, roles: ['client'] },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['client'] },
      { id: 'transparency', label: 'Transparency', icon: Eye, badge: 'NEW', roles: ['client'] },
      { id: 'proactive', label: 'Smart Alerts', icon: Zap, badge: 'AI', roles: ['client'] },
      { id: 'value-added', label: 'Resources', icon: Award, roles: ['client'] },
      { id: 'ai', label: 'AI Assistant', icon: Bot, roles: ['client'] }
    ]

    const staffItems = [
      { id: 'cases', label: 'Cases', icon: FileText, roles: ['admin', 'attorney', 'paralegal'] },
      { id: 'clients', label: 'Clients', icon: Users, roles: ['admin', 'attorney', 'paralegal'] },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare, roles: ['admin', 'attorney', 'paralegal'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['admin', 'attorney', 'paralegal'] },
      { id: 'documents', label: 'Documents', icon: Upload, roles: ['admin', 'attorney', 'paralegal'] },
      { id: 'video', label: 'Video Calls', icon: Video, roles: ['admin', 'attorney', 'paralegal'] },
      { id: 'calendar', label: 'Calendar', icon: Calendar, roles: ['admin', 'attorney', 'paralegal'] },
      { id: 'time-tracking', label: 'Time Tracking', icon: Clock, roles: ['admin', 'attorney', 'paralegal'] },
      { id: 'billing', label: 'Billing', icon: DollarSign, roles: ['admin', 'attorney'] },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'attorney'] },
      { id: 'reports', label: 'Reports', icon: TrendingUp, roles: ['admin', 'attorney'] },
      { id: 'ai', label: 'AI Assistant', icon: Bot, roles: ['admin', 'attorney', 'paralegal'] }
    ]

    const adminItems = [
      { id: 'user-management', label: 'User Management', icon: UserPlus, roles: ['admin'], badge: 'ADMIN' },
      { id: 'firm-settings', label: 'Firm Settings', icon: Building, roles: ['admin'], badge: 'ADMIN' }
    ]

    const settingsItems = [
      { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'attorney', 'paralegal', 'client'] },
      { id: 'security', label: 'Security', icon: Shield, roles: ['admin', 'attorney', 'paralegal', 'client'] }
    ]

    let allItems = [...baseItems]

    if (isStaff()) {
      allItems = [...allItems, ...staffItems]
    } else {
      allItems = [...allItems, ...clientItems]
    }

    if (isAdmin()) {
      allItems = [...allItems, ...adminItems]
    }

    allItems = [...allItems, ...settingsItems]

    // Filter items based on user role, default to client if no role
    const currentRole = userRole || 'client'
    return allItems.filter(item => 
      item.roles.includes(currentRole)
    )
  }

  const menuItems = getMenuItems()

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto"
    >
      <nav className="p-6">
        {/* Role indicator */}
        <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              userRole === 'admin' ? 'bg-purple-500' :
              userRole === 'attorney' ? 'bg-blue-500' :
              userRole === 'paralegal' ? 'bg-green-500' :
              'bg-gray-500'
            }`}></div>
            <span className="text-sm font-medium text-gray-700 capitalize flex items-center space-x-1">
              {isAdmin() && <Crown className="h-3 w-3 text-purple-600" />}
              <span>{userRole || 'Client'} Portal</span>
            </span>
          </div>
          {isAdmin() && (
            <div className="mt-2 text-xs text-purple-600 font-medium">
              Full System Access
            </div>
          )}
        </div>

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
                        : item.badge === 'ADMIN'
                        ? 'bg-purple-500 text-white'
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

export default RoleBasedSidebar