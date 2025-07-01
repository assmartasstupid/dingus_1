import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './components/Auth/AuthPage'
import ClientPortal from './components/ClientPortal'
import SetupGuide from './components/Setup/SetupGuide'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()

  // Check if Supabase is configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'https://demo-project.supabase.co'

  console.log('App render - loading:', loading, 'user:', user ? 'exists' : 'null', 'configured:', isSupabaseConfigured)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-xs text-gray-400 mt-2">Initializing secure connection...</p>
        </div>
      </div>
    )
  }

  // Show setup guide if Supabase is not configured
  if (!isSupabaseConfigured) {
    return <SetupGuide />
  }

  return user ? <ClientPortal /> : <AuthPage />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App