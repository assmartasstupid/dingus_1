// Supabase Setup Utilities
import { supabase } from './supabase'

export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}

export const setupDefaultData = async () => {
  try {
    // Check if firm settings exist
    const { data: firmSettings } = await supabase
      .from('firm_settings')
      .select('id')
      .limit(1)

    if (!firmSettings || firmSettings.length === 0) {
      // Create default firm settings
      await supabase.from('firm_settings').insert({
        firm_name: 'LegalPortal Pro',
        primary_color: '#1e40af',
        secondary_color: '#7c3aed'
      })
      console.log('✅ Default firm settings created')
    }

    // Check if permissions exist
    const { data: permissions } = await supabase
      .from('permissions')
      .select('id')
      .limit(1)

    if (!permissions || permissions.length === 0) {
      console.log('⚠️ No permissions found. Please run the database migration.')
      return false
    }

    console.log('✅ Default data setup complete')
    return true
  } catch (error) {
    console.error('❌ Error setting up default data:', error)
    return false
  }
}

export const createAdminUser = async (email: string, password: string) => {
  try {
    // This would typically be done through Supabase Auth Admin API
    // For now, users can register and the system will detect admin email
    console.log('To create admin user:')
    console.log('1. Register with email:', email)
    console.log('2. System will automatically assign admin role')
    return true
  } catch (error) {
    console.error('Error creating admin user:', error)
    return false
  }
}

// Development helper to check setup
export const validateSetup = async () => {
  console.log('🔍 Validating Supabase setup...')
  
  const connectionOk = await checkSupabaseConnection()
  if (!connectionOk) {
    console.log('❌ Setup validation failed: Cannot connect to Supabase')
    return false
  }

  const dataOk = await setupDefaultData()
  if (!dataOk) {
    console.log('❌ Setup validation failed: Missing default data')
    return false
  }

  console.log('✅ Supabase setup validation complete!')
  return true
}