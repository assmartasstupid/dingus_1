import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { UserRole } from '../types/auth'

export const usePermissions = () => {
  const { user, userProfile, loading: authLoading } = useAuth()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const fetchPermissions = async () => {
      // Don't fetch permissions if auth is still loading
      if (authLoading) {
        return
      }

      // Set timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (mounted) {
          console.log('Permissions fetch timeout, setting loading to false')
          setLoading(false)
        }
      }, 3000)

      if (!user) {
        setUserRole(null)
        setPermissions([])
        setLoading(false)
        return
      }

      try {
        console.log('Fetching permissions for user:', user.id)
        
        // Use userProfile from context if available
        let role = userProfile?.role

        // If no profile in context, try to fetch it
        if (!role) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle()

          role = profile?.role
        }

        // Check for admin email override
        if (user.email === 'admin@legalportal.com') {
          role = 'admin'
        }

        // Default to client if no role found
        if (!role) {
          console.log('No role found, defaulting to client')
          role = 'client'
        }

        console.log('User role:', role)
        setUserRole(role)

        // Get permissions for this role
        const { data: rolePermissions } = await supabase
          .from('role_permissions')
          .select(`
            permissions (
              name
            )
          `)
          .eq('role', role)

        const permissionNames = rolePermissions?.map(rp => rp.permissions.name) || []
        
        // If admin, grant all permissions
        if (role === 'admin') {
          const { data: allPermissions } = await supabase
            .from('permissions')
            .select('name')
          
          const allPermissionNames = allPermissions?.map(p => p.name) || []
          setPermissions(allPermissionNames)
          console.log('Admin permissions granted:', allPermissionNames.length, 'permissions')
        } else {
          setPermissions(permissionNames)
          console.log('User permissions:', permissionNames)
        }
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error)
        // Default to client role on error
        setUserRole('client')
        setPermissions([])
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchPermissions()

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [user, userProfile, authLoading])

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  const canAccess = (resource: string, action: string): boolean => {
    return hasPermission(`${resource}.${action}`)
  }

  const isAdmin = (): boolean => userRole === 'admin'
  const isAttorney = (): boolean => userRole === 'attorney'
  const isParalegal = (): boolean => userRole === 'paralegal'
  const isClient = (): boolean => userRole === 'client'
  const isStaff = (): boolean => ['admin', 'attorney', 'paralegal'].includes(userRole || '')

  return {
    userRole,
    permissions,
    loading: loading || authLoading,
    hasPermission,
    canAccess,
    isAdmin,
    isAttorney,
    isParalegal,
    isClient,
    isStaff,
    refetch: () => {
      setLoading(true)
      // The useEffect will handle refetching
    }
  }
}