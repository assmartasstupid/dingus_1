import React, { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'

type AuthMode = 'login' | 'register' | 'forgot'

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {mode === 'login' && (
            <LoginForm
              onToggleMode={() => setMode('register')}
              onForgotPassword={() => setMode('forgot')}
            />
          )}
          {mode === 'register' && (
            <RegisterForm onToggleMode={() => setMode('login')} />
          )}
          {mode === 'forgot' && (
            <ForgotPasswordForm onBack={() => setMode('login')} />
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AuthPage