import React, { useState } from 'react'
import RoleBasedHeader from './Layout/RoleBasedHeader'
import RoleBasedSidebar from './Layout/RoleBasedSidebar'
import DashboardView from './Dashboard/DashboardView'
import CasesView from './Cases/CasesView'
import MessagesView from './Messages/MessagesView'
import DocumentsView from './Documents/DocumentsView'
import SettingsView from './Settings/SettingsView'
import SecurityView from './Security/SecurityView'
import BillingView from './Billing/BillingView'
import TasksView from './Tasks/TasksView'
import VideoCallView from './VideoCall/VideoCallView'
import AnalyticsView from './Analytics/AnalyticsView'
import AIAssistantView from './AI/AIAssistantView'
import TransparencyDashboard from './Transparency/TransparencyDashboard'
import ProactiveAlerts from './Proactive/ProactiveAlerts'
import ValueAddedServices from './ValueAdded/ValueAddedServices'
import UserManagementView from './UserManagement/UserManagementView'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const ClientPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { loading } = useAuth()

  console.log('ClientPortal render - loading:', loading)

  // Show a minimal loading state only if absolutely necessary
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading portal...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />
      case 'cases':
        return <CasesView />
      case 'clients':
        return <div className="p-6"><h1 className="text-2xl font-bold">Client Management - Coming Soon</h1></div>
      case 'messages':
        return <MessagesView />
      case 'documents':
        return <DocumentsView />
      case 'billing':
        return <BillingView />
      case 'tasks':
        return <TasksView />
      case 'video':
        return <VideoCallView />
      case 'calendar':
        return <div className="p-6"><h1 className="text-2xl font-bold">Calendar - Coming Soon</h1></div>
      case 'time-tracking':
        return <div className="p-6"><h1 className="text-2xl font-bold">Time Tracking - Coming Soon</h1></div>
      case 'reports':
        return <div className="p-6"><h1 className="text-2xl font-bold">Reports - Coming Soon</h1></div>
      case 'analytics':
        return <AnalyticsView />
      case 'transparency':
        return <TransparencyDashboard />
      case 'proactive':
        return <ProactiveAlerts />
      case 'value-added':
        return <ValueAddedServices />
      case 'ai':
        return <AIAssistantView />
      case 'user-management':
        return <UserManagementView />
      case 'firm-settings':
        return <div className="p-6"><h1 className="text-2xl font-bold">Firm Settings - Coming Soon</h1></div>
      case 'settings':
        return <SettingsView />
      case 'security':
        return <SecurityView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleBasedHeader />
      <div className="flex h-[calc(100vh-80px)]">
        <RoleBasedSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto"
        >
          {renderContent()}
        </motion.main>
      </div>
    </div>
  )
}

export default ClientPortal