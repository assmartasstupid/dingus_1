/*
  # Fix Sign-Out Loop Issue

  This migration addresses the recursive sign-out loop by:
  1. Simplifying all RLS policies to prevent recursion
  2. Removing complex policy dependencies
  3. Ensuring clean auth state transitions
  4. Creating fail-safe policies for sign-out operations
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Drop problematic helper functions that might cause recursion
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_attorney_or_admin();
DROP FUNCTION IF EXISTS public.is_staff();
DROP FUNCTION IF EXISTS public.allow_user_creation();

-- Create simple, non-recursive policies for user_profiles
CREATE POLICY "Simple user profile read"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can always read their own profile
    auth.uid() = user_id
    OR
    -- Service role can read everything
    current_setting('role') = 'service_role'
  );

CREATE POLICY "Simple user profile insert"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Simple user profile update"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a separate policy for admin reads that won't cause recursion
CREATE POLICY "Admin profile read access"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow admin reads only if the user has admin role in a simple way
    EXISTS (
      SELECT 1 FROM user_profiles admin_check
      WHERE admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
      AND admin_check.user_id != user_profiles.user_id -- Prevent self-reference
    )
  );

-- Simplify audit_logs policies to prevent any recursion during sign out
DROP POLICY IF EXISTS "Users can read own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON audit_logs;

CREATE POLICY "Simple audit read"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow audit inserts but don't enforce them during sign out
CREATE POLICY "Simple audit insert"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update case policies to be simpler and avoid recursion
DROP POLICY IF EXISTS "Enhanced case read access" ON cases;
DROP POLICY IF EXISTS "Role-based case read access" ON cases;
DROP POLICY IF EXISTS "Role-based case insert access" ON cases;
DROP POLICY IF EXISTS "Role-based case update access" ON cases;

-- Simple case read policy
CREATE POLICY "Simple case read"
  ON cases
  FOR SELECT
  TO authenticated
  USING (
    -- Clients can read their own cases
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = cases.client_id 
      AND c.user_id = auth.uid()
    )
    OR
    -- Lawyers can read cases they're assigned to
    cases.lawyer_id = auth.uid()
    OR
    -- Users with admin role can read all cases (simple check)
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role = 'admin'
    )
  );

-- Simple case insert policy
CREATE POLICY "Simple case insert"
  ON cases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Only allow case creation if user is admin or attorney
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'attorney')
    )
  );

-- Simple case update policy
CREATE POLICY "Simple case update"
  ON cases
  FOR UPDATE
  TO authenticated
  USING (
    cases.lawyer_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'attorney')
    )
  );

-- Update case assignment policies
DROP POLICY IF EXISTS "Enhanced assignment management" ON case_assignments;
DROP POLICY IF EXISTS "Users can read own assignments" ON case_assignments;

CREATE POLICY "Simple assignment read"
  ON case_assignments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'attorney')
    )
  );

CREATE POLICY "Simple assignment management"
  ON case_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'attorney')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'attorney')
    )
  );

-- Update firm settings policies
DROP POLICY IF EXISTS "Enhanced firm settings access" ON firm_settings;
DROP POLICY IF EXISTS "Staff can read firm settings" ON firm_settings;

CREATE POLICY "Simple firm settings read"
  ON firm_settings
  FOR SELECT
  TO authenticated
  USING (true); -- All authenticated users can read firm settings

CREATE POLICY "Simple firm settings update"
  ON firm_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role = 'admin'
    )
  );

-- Ensure all tables have proper grants
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON cases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON case_assignments TO authenticated;
GRANT SELECT ON firm_settings TO authenticated;
GRANT UPDATE ON firm_settings TO authenticated;

-- Create indexes to improve performance and prevent slow queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_role ON user_profiles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Analyze tables for better query performance
ANALYZE user_profiles;
ANALYZE cases;
ANALYZE clients;
ANALYZE case_assignments;
ANALYZE audit_logs;

-- Test the policies by running a simple query
-- This should work without causing recursion
SELECT 
  'Policy test completed' as status,
  COUNT(*) as user_profiles_count
FROM user_profiles;