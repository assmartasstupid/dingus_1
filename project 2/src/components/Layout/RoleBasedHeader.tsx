import React, { useState } from 'react'
import { Scale, Bell, User, LogOut, Settings, Shield, Users, Crown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { motion } from 'framer-motion'
import ProfileImageUpload from '../Settings/ProfileImageUpload'

const RoleBasedHeader: React.FC = () => {
  const { user, userProfile, signOut, loading } = useAuth()
  const { userRole, isStaff, isAdmin } = usePermissions()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut || loading) return // Prevent multiple clicks
    
    try {
      setIsSigningOut(true)
      console.log('Header: Starting sign out...')
      await signOut()
      console.log('Header: Sign out completed')
    } catch (error) {
      console.error('Header: Error during sign out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'attorney':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'paralegal':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'client':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPortalTitle = () => {
    switch (userRole) {
      case 'admin':
        return 'Admin Portal'
      case 'attorney':
        return 'Attorney Portal'
      case 'paralegal':
        return 'Paralegal Portal'
      case 'client':
        return 'Client Portal'
      default:
        return 'Legal Portal'
    }
  }

  const getPortalIcon = () => {
    if (isAdmin()) {
      return <Crown className="h-5 w-5 text-purple-600" />
    }
    if (isStaff()) {
      return <Users className="h-5 w-5 text-blue-600" />
    }
    return <User className="h-5 w-5 text-gray-600" />
  }

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Scale className="h-8 w-8 text-blue-900" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">LegalPortal Pro</h1>
              <div className="flex items-center space-x-2">
                {getPortalIcon()}
                <p className="text-sm text-gray-500">{getPortalTitle()}</p>
              </div>
            </div>
          </div>
          
          {isAdmin() && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full">
              <Crown className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Administrator</span>
            </div>
          )}
          
          {isStaff() && !isAdmin() && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Staff Access</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-500 hover:text-gray-700 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </motion.button>

          <div className="flex items-center space-x-3">
            <ProfileImageUpload
              currentImage={userProfile?.profile_image_url || ""}
              onImageChange={() => {}}
              size="sm"
            />
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : user?.email}
                </p>
                {userRole && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(userRole)}`}>
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Security"
            >
              <Shield className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              disabled={loading || isSigningOut}
              className={`p-2 transition-colors ${
                loading || isSigningOut
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-red-600'
              }`}
              title="Sign Out"
            >
              {loading || isSigningOut ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
              ) : (
                <LogOut className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default RoleBasedHeader