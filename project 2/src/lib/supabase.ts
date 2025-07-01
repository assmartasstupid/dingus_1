import { createClient } from '@supabase/supabase-js'

// For demo purposes, we'll use fallback values if env vars aren't set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key'

// In production, always require these variables
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Using demo mode.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced authentication functions
export const auth = {
  signUp: async (email: string, password: string, userData: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: userData
      }
    })
  },

  signIn: async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    // Simple audit logging without complex error handling
    if (result.data.user && !result.error) {
      try {
        await supabase.from('audit_logs').insert({
          user_id: result.data.user.id,
          action: 'sign_in',
          details: { email, timestamp: new Date().toISOString() }
        })
      } catch (error) {
        // Silently fail audit logging - don't block the sign in
        console.warn('Could not log sign in event:', error)
      }
    }
    
    return result
  },

  signOut: async () => {
    // Extremely simple sign out - no audit logging to prevent any RLS issues
    console.log('Supabase: Initiating sign out...')
    
    try {
      // Just sign out, no additional operations
      const result = await supabase.auth.signOut()
      console.log('Supabase: Sign out result:', result.error ? 'error' : 'success')
      return result
    } catch (error) {
      console.error('Supabase: Sign out error:', error)
      return { error }
    }
  },

  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
  },

  updatePassword: async (password: string) => {
    return await supabase.auth.updateUser({ password })
  }
}