import React from 'react'
import { Scale, Bell, User, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import ProfileImageUpload from '../Settings/ProfileImageUpload'

const Header: React.FC = () => {
  const { user, signOut } = useAuth()

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Scale className="h-8 w-8 text-blue-900" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">LegalPortal</h1>
            <p className="text-sm text-gray-500">Secure Client Communications</p>
          </div>
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
              currentImage=""
              onImageChange={() => {}}
              size="sm"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500">Client Portal</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={signOut}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header