export type UserRole = 'admin' | 'attorney' | 'paralegal' | 'client'

export interface UserProfile {
  id: string
  user_id: string
  role: UserRole
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  profile_image_url?: string
  bio?: string
  department?: string
  bar_number?: string
  specializations?: string[]
  hourly_rate?: number
  is_active: boolean
  firm_id?: string
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface CaseAssignment {
  id: string
  case_id: string
  user_id: string
  role: UserRole
  is_primary: boolean
  assigned_at: string
  assigned_by?: string
}

export interface FirmSettings {
  id: string
  firm_name: string
  firm_logo_url?: string
  primary_color: string
  secondary_color: string
  billing_settings: Record<string, any>
  notification_settings: Record<string, any>
  security_settings: Record<string, any>
  created_at: string
  updated_at: string
}