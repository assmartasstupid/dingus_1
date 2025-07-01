import React, { useState, useEffect } from 'react'
import { Database, CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import { checkSupabaseConnection, validateSetup } from '../../lib/supabase-setup'

const SetupGuide: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [setupSteps, setSetupSteps] = useState({
    connection: false,
    migration: false,
    storage: false,
    auth: false
  })

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const isConnected = await checkSupabaseConnection()
    setConnectionStatus(isConnected ? 'connected' : 'error')
    
    if (isConnected) {
      const isValid = await validateSetup()
      setSetupSteps(prev => ({
        ...prev,
        connection: true,
        migration: isValid
      }))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const migrationSQL = `-- Run this in your Supabase SQL Editor
-- This will create all necessary tables and security policies

-- The migration file is located at:
-- supabase/migrations/20250629174657_turquoise_brook.sql

-- Copy the entire contents of that file and run it in the SQL Editor`

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <Database className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Setup Guide</h1>
            <p className="text-gray-600">Follow these steps to set up your Legal Client Portal</p>
          </div>

          {/* Connection Status */}
          <div className="mb-8 p-4 rounded-lg border-2 border-dashed">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {connectionStatus === 'checking' && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                )}
                {connectionStatus === 'connected' && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                {connectionStatus === 'error' && (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
                <span className="font-medium">
                  {connectionStatus === 'checking' && 'Checking Supabase connection...'}
                  {connectionStatus === 'connected' && 'Connected to Supabase!'}
                  {connectionStatus === 'error' && 'Cannot connect to Supabase'}
                </span>
              </div>
              <button
                onClick={checkConnection}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recheck
              </button>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="space-y-6">
            {/* Step 1: Environment Variables */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  setupSteps.connection ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  1
                </div>
                <h3 className="text-lg font-semibold">Configure Environment Variables</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Create .env file:</span>
                  <button
                    onClick={() => copyToClipboard(`VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <pre className="text-sm text-gray-700">
{`VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
                </pre>
              </div>
              
              <p className="text-sm text-gray-600">
                Get these values from your Supabase project dashboard → Settings → API
              </p>
            </div>

            {/* Step 2: Database Migration */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  setupSteps.migration ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  2
                </div>
                <h3 className="text-lg font-semibold">Run Database Migration</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">SQL Migration:</span>
                  <button
                    onClick={() => copyToClipboard(migrationSQL)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {migrationSQL}
                </pre>
              </div>
              
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Open Supabase SQL Editor
                </a>
              </div>
            </div>

            {/* Step 3: Storage Setup */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                  3
                </div>
                <h3 className="text-lg font-semibold">Set Up Storage</h3>
              </div>
              
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Go to Storage in your Supabase dashboard</li>
                <li>Create a new bucket named "documents"</li>
                <li>Set it as Private (not public)</li>
                <li>Add the storage policies from the setup guide</li>
              </ol>
            </div>

            {/* Step 4: Authentication */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                  4
                </div>
                <h3 className="text-lg font-semibold">Configure Authentication</h3>
              </div>
              
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Go to Authentication → Settings in Supabase</li>
                <li>Set Site URL to: http://localhost:5173 (for development)</li>
                <li>Add redirect URL: http://localhost:5173/auth/callback</li>
                <li>Customize email templates if needed</li>
              </ol>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Demo Accounts</h3>
            <p className="text-blue-800 text-sm mb-3">
              You can create these accounts through the registration page:
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-white rounded p-3">
                <strong>Admin Account:</strong> admin@legalportal.com (any password)
                <br />
                <span className="text-gray-600">Will automatically get admin privileges</span>
              </div>
              <div className="bg-white rounded p-3">
                <strong>Client Account:</strong> Any other email
                <br />
                <span className="text-gray-600">Will get client privileges by default</span>
              </div>
            </div>
          </div>

          {/* Help Links */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Need help? Check out these resources:</p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://supabase.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Supabase Docs</span>
              </a>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Supabase Dashboard</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SetupGuide