import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../types/auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Use refs to prevent stale closures and race conditions
  const isSigningOutRef = useRef(false)
  const mountedRef = useRef(true)
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let authSubscription: any = null

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mountedRef.current) return
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        console.log('Initial session:', session ? 'found' : 'not found')
        
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          await fetchUserProfile(session.user.id, session.user.email)
        } else {
          setSession(null)
          setUser(null)
          setUserProfile(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error in initializeAuth:', error)
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    // Set up auth state listener
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mountedRef.current) return

        console.log('Auth state changed:', event)
        
        // Handle sign out immediately and simply
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out - clearing state')
          
          // Clear any pending timeouts
          if (cleanupTimeoutRef.current) {
            clearTimeout(cleanupTimeoutRef.current)
            cleanupTimeoutRef.current = null
          }
          
          setSession(null)
          setUser(null)
          setUserProfile(null)
          isSigningOutRef.current = false
          setLoading(false)
          return
        }
        
        // Handle sign in events
        if (event === 'SIGNED_IN' && session?.user && !isSigningOutRef.current) {
          console.log('User signed in')
          setSession(session)
          setUser(session.user)
          
          try {
            await fetchUserProfile(session.user.id, session.user.email)
          } catch (error) {
            console.error('Error fetching profile:', error)
          }
        }

        // Handle token refresh
        if (event === 'TOKEN_REFRESHED' && session?.user && !isSigningOutRef.current) {
          setSession(session)
          setUser(session.user)
        }

        if (!isSigningOutRef.current) {
          setLoading(false)
        }
      })

      authSubscription = subscription
    }

    initializeAuth().then(() => {
      if (mountedRef.current) {
        setupAuthListener()
      }
    })

    return () => {
      mountedRef.current = false
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current)
      }
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [])

  const fetchUserProfile = async (userId: string, email?: string) => {
    // Don't fetch profile if we're signing out or component is unmounted
    if (isSigningOutRef.current || !mountedRef.current) {
      return
    }

    try {
      console.log('Fetching user profile for:', userId)
      
      let profile = null
      
      // Try to get profile by user_id first
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }
      
      if (profileData) {
        profile = profileData
      } else if (email) {
        // Try to find by email and update user_id
        const { data: emailProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle()
        
        if (emailProfile) {
          const { data: updatedProfile } = await supabase
            .from('user_profiles')
            .update({ user_id: userId })
            .eq('email', email)
            .select()
            .single()
          
          profile = updatedProfile
        } else {
          // Create default profile
          const defaultRole = email === 'admin@legalportal.com' ? 'admin' : 'client'
          const { data: newProfile } = await supabase
            .from('user_profiles')
            .insert({
              user_id: userId,
              role: defaultRole,
              first_name: defaultRole === 'admin' ? 'System' : 'User',
              last_name: defaultRole === 'admin' ? 'Administrator' : 'Account',
              email: email,
              is_active: true
            })
            .select()
            .single()
          
          profile = newProfile
        }
      }

      if (mountedRef.current && !isSigningOutRef.current) {
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
    }
  }

  const refreshProfile = async () => {
    if (user && !isSigningOutRef.current && mountedRef.current) {
      await fetchUserProfile(user.id, user.email)
    }
  }

  const signOut = async () => {
    // Prevent multiple concurrent sign outs
    if (isSigningOutRef.current) {
      console.log('Sign out already in progress')
      return
    }

    try {
      console.log('Starting sign out...')
      isSigningOutRef.current = true
      setLoading(true)
      
      // Clear state immediately to prevent any further operations
      setUserProfile(null)
      setUserProfile(null)
      setUser(null)
      setSession(null)
      
      // Set a timeout to force cleanup if sign out hangs
      cleanupTimeoutRef.current = setTimeout(() => {
        console.log('Force cleanup after timeout')
        if (mountedRef.current) {
          setUser(null)
          setSession(null)
          setUserProfile(null)
          setLoading(false)
          isSigningOutRef.current = false
        }
      }, 5000) // 5 second timeout
      
      // Perform the actual sign out
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error during sign out:', error)
      }
      
      // Clear timeout since sign out completed
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current)
        cleanupTimeoutRef.current = null
      }
      
      console.log('Sign out completed')
      
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      // Always clear state and reset flags
      setUser(null)
      setSession(null)
      setUserProfile(null)
      isSigningOutRef.current = false
      setLoading(false)
      
      // Clear any remaining timeout
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current)
        cleanupTimeoutRef.current = null
      }
    }
  }

  const value = {
    user,
    session,
    userProfile,
    loading,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}