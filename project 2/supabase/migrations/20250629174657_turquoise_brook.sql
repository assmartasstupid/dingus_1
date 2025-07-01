/*
  # Add User Roles and Permissions System

  1. New Tables
    - `user_roles` - Define different user roles (admin, attorney, paralegal, client)
    - `user_profiles` - Extended user profile information with role assignment
    - `permissions` - Define what each role can do
    - `role_permissions` - Link roles to specific permissions
    - `case_assignments` - Track which attorneys/paralegals are assigned to cases
    - `firm_settings` - Firm-wide configuration settings

  2. Security
    - Enable RLS on all new tables
    - Add policies for role-based access control
    - Ensure users can only access data appropriate to their role

  3. Changes
    - Extend existing tables to support multi-role functionality
    - Add role-based access controls
    - Create firm hierarchy and case assignment system
*/

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'attorney', 'paralegal', 'client');

-- Create user profiles table with role information
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  profile_image_url text,
  bio text,
  department text, -- For attorneys/paralegals
  bar_number text, -- For attorneys
  specializations text[], -- For attorneys
  hourly_rate decimal(10,2), -- For attorneys/paralegals
  is_active boolean DEFAULT true,
  firm_id uuid, -- For multi-firm support
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  resource text NOT NULL, -- e.g., 'cases', 'documents', 'billing'
  action text NOT NULL, -- e.g., 'create', 'read', 'update', 'delete'
  created_at timestamptz DEFAULT now()
);

-- Create role permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Create case assignments table
CREATE TABLE IF NOT EXISTS case_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_primary boolean DEFAULT false,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE(case_id, user_id)
);

-- Create firm settings table
CREATE TABLE IF NOT EXISTS firm_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name text NOT NULL DEFAULT 'Legal Firm',
  firm_logo_url text,
  primary_color text DEFAULT '#1e40af',
  secondary_color text DEFAULT '#7c3aed',
  billing_settings jsonb DEFAULT '{}',
  notification_settings jsonb DEFAULT '{}',
  security_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add role column to existing clients table for backward compatibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'role'
  ) THEN
    ALTER TABLE clients ADD COLUMN role user_role DEFAULT 'client';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_settings ENABLE ROW LEVEL SECURITY;

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
-- Case permissions
('cases.create', 'Create new cases', 'cases', 'create'),
('cases.read.own', 'Read own cases', 'cases', 'read'),
('cases.read.assigned', 'Read assigned cases', 'cases', 'read'),
('cases.read.all', 'Read all cases', 'cases', 'read'),
('cases.update.own', 'Update own cases', 'cases', 'update'),
('cases.update.assigned', 'Update assigned cases', 'cases', 'update'),
('cases.update.all', 'Update all cases', 'cases', 'update'),
('cases.delete', 'Delete cases', 'cases', 'delete'),

-- Document permissions
('documents.create', 'Upload documents', 'documents', 'create'),
('documents.read.own', 'Read own documents', 'documents', 'read'),
('documents.read.case', 'Read case documents', 'documents', 'read'),
('documents.read.all', 'Read all documents', 'documents', 'read'),
('documents.update', 'Update documents', 'documents', 'update'),
('documents.delete', 'Delete documents', 'documents', 'delete'),

-- Message permissions
('messages.create', 'Send messages', 'messages', 'create'),
('messages.read.own', 'Read own messages', 'messages', 'read'),
('messages.read.case', 'Read case messages', 'messages', 'read'),
('messages.read.all', 'Read all messages', 'messages', 'read'),

-- Billing permissions
('billing.read.own', 'Read own billing', 'billing', 'read'),
('billing.read.all', 'Read all billing', 'billing', 'read'),
('billing.create', 'Create billing entries', 'billing', 'create'),
('billing.update', 'Update billing entries', 'billing', 'update'),

-- User management permissions
('users.create', 'Create users', 'users', 'create'),
('users.read.all', 'Read all users', 'users', 'read'),
('users.update.all', 'Update all users', 'users', 'update'),
('users.delete', 'Delete users', 'users', 'delete'),

-- Analytics permissions
('analytics.read.own', 'Read own analytics', 'analytics', 'read'),
('analytics.read.all', 'Read all analytics', 'analytics', 'read'),

-- Settings permissions
('settings.read', 'Read settings', 'settings', 'read'),
('settings.update', 'Update settings', 'settings', 'update')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role, permission_id) 
SELECT 'admin', id FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'attorney', id FROM permissions 
WHERE name IN (
  'cases.create', 'cases.read.assigned', 'cases.read.all', 'cases.update.assigned', 'cases.update.all',
  'documents.create', 'documents.read.case', 'documents.read.all', 'documents.update', 'documents.delete',
  'messages.create', 'messages.read.case', 'messages.read.all',
  'billing.read.all', 'billing.create', 'billing.update',
  'analytics.read.all',
  'settings.read'
)
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'paralegal', id FROM permissions 
WHERE name IN (
  'cases.read.assigned', 'cases.update.assigned',
  'documents.create', 'documents.read.case', 'documents.update',
  'messages.create', 'messages.read.case',
  'billing.read.own',
  'analytics.read.own',
  'settings.read'
)
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'client', id FROM permissions 
WHERE name IN (
  'cases.read.own',
  'documents.create', 'documents.read.own',
  'messages.create', 'messages.read.own',
  'billing.read.own',
  'analytics.read.own'
)
ON CONFLICT DO NOTHING;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

CREATE POLICY "Attorneys can read firm profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role IN ('admin', 'attorney')
    )
  );

-- RLS Policies for case_assignments
CREATE POLICY "Users can read own assignments"
  ON case_assignments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Attorneys can manage assignments"
  ON case_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role IN ('admin', 'attorney')
    )
  );

-- RLS Policies for permissions and role_permissions
CREATE POLICY "All authenticated users can read permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can read role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for firm_settings
CREATE POLICY "All authenticated users can read firm settings"
  ON firm_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update firm settings"
  ON firm_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

-- Update existing cases table policies to support role-based access
DROP POLICY IF EXISTS "Users can read own client data" ON cases;
DROP POLICY IF EXISTS "Lawyers can insert cases" ON cases;
DROP POLICY IF EXISTS "Lawyers can update cases" ON cases;

CREATE POLICY "Role-based case read access"
  ON cases
  FOR SELECT
  TO authenticated
  USING (
    -- Clients can read their own cases
    (EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = cases.client_id AND c.user_id = auth.uid()
    ))
    OR
    -- Attorneys and paralegals can read assigned cases
    (EXISTS (
      SELECT 1 FROM case_assignments ca
      WHERE ca.case_id = cases.id AND ca.user_id = auth.uid()
    ))
    OR
    -- Admins and attorneys can read all cases
    (EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role IN ('admin', 'attorney')
    ))
  );

CREATE POLICY "Role-based case insert access"
  ON cases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role IN ('admin', 'attorney')
    )
  );

CREATE POLICY "Role-based case update access"
  ON cases
  FOR UPDATE
  TO authenticated
  USING (
    -- Assigned users can update
    (EXISTS (
      SELECT 1 FROM case_assignments ca
      WHERE ca.case_id = cases.id AND ca.user_id = auth.uid()
    ))
    OR
    -- Admins and attorneys can update all
    (EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role IN ('admin', 'attorney')
    ))
  );

-- Insert default firm settings
INSERT INTO firm_settings (firm_name) VALUES ('LegalPortal Pro')
ON CONFLICT DO NOTHING;

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM user_profiles 
    WHERE user_id = user_uuid 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user permission
CREATE OR REPLACE FUNCTION has_permission(user_uuid uuid, permission_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles up
    JOIN role_permissions rp ON rp.role = up.role
    JOIN permissions p ON p.id = rp.permission_id
    WHERE up.user_id = user_uuid AND p.name = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_firm_settings_updated_at
    BEFORE UPDATE ON firm_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();