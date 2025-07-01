-- Drop all existing policies on user_profiles to start fresh
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Attorneys can read firm profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own profile during registration
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Service role can do everything (for admin operations)
CREATE POLICY "Service role full access"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a function to check if current user is admin (in public schema)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Create a function to check if current user is attorney or admin
CREATE OR REPLACE FUNCTION public.is_attorney_or_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'attorney')
  );
$$;

-- Create a function to check if current user is staff (admin, attorney, or paralegal)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'attorney', 'paralegal')
  );
$$;

-- Update cases table policies to use these functions
DROP POLICY IF EXISTS "Role-based case read access" ON cases;
DROP POLICY IF EXISTS "Enhanced case read access" ON cases;

CREATE POLICY "Enhanced case read access"
  ON cases
  FOR SELECT
  TO authenticated
  USING (
    -- Clients can read their own cases
    (EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = cases.client_id 
      AND c.user_id = auth.uid()
    ))
    OR
    -- Assigned team members can read cases
    (EXISTS (
      SELECT 1 FROM case_assignments ca
      WHERE ca.case_id = cases.id 
      AND ca.user_id = auth.uid()
    ))
    OR
    -- Lawyers assigned to the case can read it
    (cases.lawyer_id = auth.uid())
    OR
    -- Staff members can read all cases
    public.is_staff()
  );

-- Update case assignment policies
DROP POLICY IF EXISTS "Attorneys can manage assignments" ON case_assignments;
DROP POLICY IF EXISTS "Enhanced assignment management" ON case_assignments;

CREATE POLICY "Enhanced assignment management"
  ON case_assignments
  FOR ALL
  TO authenticated
  USING (public.is_attorney_or_admin())
  WITH CHECK (public.is_attorney_or_admin());

-- Update firm settings policies  
DROP POLICY IF EXISTS "Admins can update firm settings" ON firm_settings;
DROP POLICY IF EXISTS "Enhanced firm settings access" ON firm_settings;

CREATE POLICY "Enhanced firm settings access"
  ON firm_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Add a policy for staff to read firm settings
CREATE POLICY "Staff can read firm settings"
  ON firm_settings
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- Create a simple policy for user creation that doesn't cause recursion
-- This allows the initial admin user creation
CREATE OR REPLACE FUNCTION public.allow_user_creation()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  -- Always allow user profile creation during registration
  -- The application logic will handle role assignment
  SELECT true;
$$;

-- Drop and recreate the insert policy to be more permissive during registration
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND public.allow_user_creation()
  );

-- Grant execute permissions on the new functions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_attorney_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.allow_user_creation() TO authenticated;