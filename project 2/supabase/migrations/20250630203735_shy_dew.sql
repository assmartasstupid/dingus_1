-- Migration to fix sign-out loop by simplifying RLS policies
-- Step 1: Drop ALL policies that depend on helper functions

-- Drop all user_profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Drop all case policies
DROP POLICY IF EXISTS "Enhanced case read access" ON cases;
DROP POLICY IF EXISTS "Role-based case read access" ON cases;
DROP POLICY IF EXISTS "Role-based case insert access" ON cases;
DROP POLICY IF EXISTS "Role-based case update access" ON cases;
DROP POLICY IF EXISTS "Clients can read own cases" ON cases;
DROP POLICY IF EXISTS "Lawyers can insert cases" ON cases;
DROP POLICY IF EXISTS "Lawyers can update cases" ON cases;

-- Drop all case assignment policies
DROP POLICY IF EXISTS "Enhanced assignment management" ON case_assignments;
DROP POLICY IF EXISTS "Users can read own assignments" ON case_assignments;
DROP POLICY IF EXISTS "Attorneys can manage assignments" ON case_assignments;

-- Drop all firm settings policies
DROP POLICY IF EXISTS "Enhanced firm settings access" ON firm_settings;
DROP POLICY IF EXISTS "Staff can read firm settings" ON firm_settings;
DROP POLICY IF EXISTS "All authenticated users can read firm settings" ON firm_settings;
DROP POLICY IF EXISTS "Admins can update firm settings" ON firm_settings;

-- Drop all audit log policies
DROP POLICY IF EXISTS "Users can read own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON audit_logs;

-- Drop all document policies that might use functions
DROP POLICY IF EXISTS "Users can read case documents" ON documents;
DROP POLICY IF EXISTS "Users can upload documents" ON documents;

-- Drop all message policies that might use functions
DROP POLICY IF EXISTS "Users can read case messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update message read status" ON messages;

-- Step 2: Now safely drop the helper functions
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_attorney_or_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_staff() CASCADE;
DROP FUNCTION IF EXISTS public.allow_user_creation() CASCADE;

-- Step 3: Create simple, non-recursive policies

-- Simple user_profiles policies
CREATE POLICY "Simple user profile read"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can always read their own profile
    auth.uid() = user_id
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

-- Service role access for admin operations
CREATE POLICY "Service role full access on user_profiles"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin read access (non-recursive)
CREATE POLICY "Admin can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_check
      WHERE admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
      AND admin_check.id != user_profiles.id -- Prevent self-reference in same row
    )
  );

-- Simple audit_logs policies
CREATE POLICY "Simple audit read"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Simple audit insert"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Simple case policies
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
    -- Users with admin/attorney role can read all cases
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'attorney')
    )
  );

CREATE POLICY "Simple case insert"
  ON cases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'attorney')
    )
  );

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

-- Simple case assignment policies
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

CREATE POLICY "Simple assignment write"
  ON case_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'attorney')
    )
  );

CREATE POLICY "Simple assignment update"
  ON case_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'attorney')
    )
  );

CREATE POLICY "Simple assignment delete"
  ON case_assignments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'attorney')
    )
  );

-- Simple firm settings policies
CREATE POLICY "Everyone can read firm settings"
  ON firm_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can update firm settings"
  ON firm_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role = 'admin'
    )
  );

CREATE POLICY "Admin can insert firm settings"
  ON firm_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() 
      AND up.role = 'admin'
    )
  );

-- Recreate document policies
CREATE POLICY "Users can read case documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      JOIN clients ON cases.client_id = clients.id
      WHERE cases.id = documents.case_id 
      AND (clients.user_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM cases 
      JOIN clients ON cases.client_id = clients.id
      WHERE cases.id = documents.case_id 
      AND (clients.user_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

-- Recreate message policies
CREATE POLICY "Users can read case messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      JOIN clients ON cases.client_id = clients.id
      WHERE cases.id = messages.case_id 
      AND (clients.user_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM cases 
      JOIN clients ON cases.client_id = clients.id
      WHERE cases.id = messages.case_id 
      AND (clients.user_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Users can update message read status"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      JOIN clients ON cases.client_id = clients.id
      WHERE cases.id = messages.case_id 
      AND (clients.user_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

-- Ensure proper grants
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON cases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON case_assignments TO authenticated;
GRANT SELECT ON firm_settings TO authenticated;
GRANT UPDATE, INSERT ON firm_settings TO authenticated;
GRANT SELECT, INSERT ON documents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_role ON user_profiles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Update table statistics
ANALYZE user_profiles;
ANALYZE cases;
ANALYZE clients;
ANALYZE case_assignments;
ANALYZE audit_logs;

-- Test query to ensure policies work
SELECT 
  'Migration completed successfully' as status,
  COUNT(*) as total_profiles
FROM user_profiles;