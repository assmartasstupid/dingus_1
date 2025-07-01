/*
  # Add Sample Client Data for Admin Dashboard

  1. Sample Data Creation
    - Create sample user profiles (without auth dependency)
    - Create sample clients for backward compatibility
    - Create sample cases with realistic legal scenarios
    - Create sample messages and case assignments
    - Create sample audit logs

  2. Approach
    - Use existing admin user as reference where needed
    - Create standalone client records that can be associated with users later
    - Generate realistic legal case scenarios
    - Ensure all foreign key constraints are satisfied
*/

-- First, let's create sample clients directly (backward compatibility)
INSERT INTO clients (
  id, user_id, first_name, last_name, email, phone, address, role, created_at, updated_at
) VALUES
-- Sample Clients with null user_id (can be associated when users register)
(gen_random_uuid(), null, 'Sarah', 'Johnson', 'sarah.johnson@email.com', '(555) 123-4567', '123 Oak Street, Springfield, IL 62701', 'client', now() - interval '30 days', now() - interval '30 days'),
(gen_random_uuid(), null, 'Michael', 'Chen', 'michael.chen@email.com', '(555) 234-5678', '456 Pine Avenue, Chicago, IL 60601', 'client', now() - interval '25 days', now() - interval '25 days'),
(gen_random_uuid(), null, 'Emily', 'Rodriguez', 'emily.rodriguez@email.com', '(555) 345-6789', '789 Maple Drive, Peoria, IL 61602', 'client', now() - interval '20 days', now() - interval '20 days'),
(gen_random_uuid(), null, 'David', 'Thompson', 'david.thompson@email.com', '(555) 456-7890', '321 Elm Street, Rockford, IL 61101', 'client', now() - interval '18 days', now() - interval '18 days'),
(gen_random_uuid(), null, 'Jennifer', 'Williams', 'jennifer.williams@email.com', '(555) 567-8901', '654 Cedar Lane, Naperville, IL 60540', 'client', now() - interval '15 days', now() - interval '15 days'),
(gen_random_uuid(), null, 'Robert', 'Brown', 'robert.brown@email.com', '(555) 678-9012', '987 Birch Road, Aurora, IL 60506', 'client', now() - interval '12 days', now() - interval '12 days'),
(gen_random_uuid(), null, 'Lisa', 'Davis', 'lisa.davis@email.com', '(555) 789-0123', '147 Willow Street, Joliet, IL 60435', 'client', now() - interval '10 days', now() - interval '10 days'),
(gen_random_uuid(), null, 'James', 'Miller', 'james.miller@email.com', '(555) 890-1234', '258 Spruce Avenue, Elgin, IL 60120', 'client', now() - interval '8 days', now() - interval '8 days'),
(gen_random_uuid(), null, 'Amanda', 'Wilson', 'amanda.wilson@email.com', '(555) 901-2345', '369 Poplar Drive, Waukegan, IL 60085', 'client', now() - interval '6 days', now() - interval '6 days'),
(gen_random_uuid(), null, 'Christopher', 'Moore', 'christopher.moore@email.com', '(555) 012-3456', '741 Hickory Lane, Decatur, IL 62526', 'client', now() - interval '4 days', now() - interval '4 days')
ON CONFLICT (email) DO NOTHING;

-- Create sample user profiles for staff (these will need to be associated with real auth users when created)
-- We'll create these as "template" profiles that show what the system can handle
INSERT INTO user_profiles (
  id, user_id, role, first_name, last_name, email, phone, address, 
  department, bar_number, specializations, hourly_rate, bio, is_active, created_at, updated_at
) VALUES
-- Sample Attorney Profiles (user_id will be null until real users are created)
(gen_random_uuid(), null, 'attorney', 'Katherine', 'Smith', 'katherine.smith@legalfirm.com', '(555) 111-2222', '100 Legal Plaza, Springfield, IL 62701', 'Corporate Law', 'IL12345', ARRAY['Corporate Law', 'Contract Negotiation', 'Business Formation'], 350.00, 'Senior partner specializing in corporate law with over 15 years of experience.', true, now() - interval '365 days', now() - interval '365 days'),
(gen_random_uuid(), null, 'attorney', 'Richard', 'Anderson', 'richard.anderson@legalfirm.com', '(555) 333-4444', '200 Justice Boulevard, Chicago, IL 60601', 'Employment Law', 'IL23456', ARRAY['Employment Law', 'Labor Relations', 'Workplace Discrimination'], 325.00, 'Experienced employment attorney focused on protecting worker rights and resolving workplace disputes.', true, now() - interval '300 days', now() - interval '300 days'),
(gen_random_uuid(), null, 'attorney', 'Michelle', 'Taylor', 'michelle.taylor@legalfirm.com', '(555) 555-6666', '300 Law Street, Peoria, IL 61602', 'Real Estate Law', 'IL34567', ARRAY['Real Estate Law', 'Property Transactions', 'Zoning'], 300.00, 'Real estate law specialist with expertise in commercial and residential transactions.', true, now() - interval '250 days', now() - interval '250 days'),

-- Sample Paralegal Profiles
(gen_random_uuid(), null, 'paralegal', 'Thomas', 'Jackson', 'thomas.jackson@legalfirm.com', '(555) 777-8888', '400 Legal Avenue, Springfield, IL 62701', 'Litigation Support', null, null, 85.00, 'Experienced paralegal specializing in litigation support and case management.', true, now() - interval '200 days', now() - interval '200 days'),
(gen_random_uuid(), null, 'paralegal', 'Maria', 'Garcia', 'maria.garcia@legalfirm.com', '(555) 999-0000', '500 Court Street, Chicago, IL 60601', 'Document Preparation', null, null, 80.00, 'Detail-oriented paralegal focused on document preparation and client communication.', true, now() - interval '150 days', now() - interval '150 days')

ON CONFLICT (email) DO NOTHING;

-- Get the admin user ID to use as lawyer_id for sample cases (fallback to any existing user)
DO $$
DECLARE
    admin_user_id uuid;
    sample_attorney_id uuid;
BEGIN
    -- Try to get admin user
    SELECT user_id INTO admin_user_id FROM user_profiles WHERE email = 'admin@legalportal.com' LIMIT 1;
    
    -- If no admin, get any existing user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
    END IF;
    
    -- If we still don't have a user, create cases without lawyer assignment
    IF admin_user_id IS NOT NULL THEN
        -- Create sample cases with the available user as lawyer
        INSERT INTO cases (
            client_id, lawyer_id, title, description, status, created_at, updated_at
        )
        SELECT 
            c.id,
            admin_user_id,
            CASE 
                WHEN c.email = 'sarah.johnson@email.com' THEN 'Business Formation Consultation'
                WHEN c.email = 'michael.chen@email.com' THEN 'Contract Review - Software License'
                WHEN c.email = 'emily.rodriguez@email.com' THEN 'Corporate Merger Advisory'
                WHEN c.email = 'david.thompson@email.com' THEN 'Employment Contract Negotiation'
                WHEN c.email = 'jennifer.williams@email.com' THEN 'Real Estate Purchase Agreement'
                WHEN c.email = 'robert.brown@email.com' THEN 'Workplace Discrimination Claim'
                WHEN c.email = 'lisa.davis@email.com' THEN 'Wrongful Termination Case'
                WHEN c.email = 'james.miller@email.com' THEN 'Employment Contract Dispute'
                WHEN c.email = 'amanda.wilson@email.com' THEN 'Residential Property Purchase'
                WHEN c.email = 'christopher.moore@email.com' THEN 'Commercial Lease Negotiation'
            END,
            CASE 
                WHEN c.email = 'sarah.johnson@email.com' THEN 'Assistance with LLC formation and initial business setup including operating agreements.'
                WHEN c.email = 'michael.chen@email.com' THEN 'Review and negotiation of enterprise software licensing agreement with vendor.'
                WHEN c.email = 'emily.rodriguez@email.com' THEN 'Legal advisory services for corporate merger and acquisition process.'
                WHEN c.email = 'david.thompson@email.com' THEN 'Negotiation and review of executive employment contract terms.'
                WHEN c.email = 'jennifer.williams@email.com' THEN 'Legal representation for commercial real estate purchase transaction.'
                WHEN c.email = 'robert.brown@email.com' THEN 'Legal representation for workplace discrimination and hostile work environment claim.'
                WHEN c.email = 'lisa.davis@email.com' THEN 'Pursuing wrongful termination claim and seeking appropriate compensation.'
                WHEN c.email = 'james.miller@email.com' THEN 'Dispute resolution regarding breach of employment contract terms.'
                WHEN c.email = 'amanda.wilson@email.com' THEN 'Legal assistance with residential home purchase including title review and closing.'
                WHEN c.email = 'christopher.moore@email.com' THEN 'Negotiation and review of commercial lease agreement for retail space.'
            END,
            CASE 
                WHEN c.email IN ('sarah.johnson@email.com', 'michael.chen@email.com', 'robert.brown@email.com', 'lisa.davis@email.com', 'james.miller@email.com') THEN 'active'
                WHEN c.email IN ('emily.rodriguez@email.com', 'david.thompson@email.com', 'amanda.wilson@email.com', 'christopher.moore@email.com') THEN 'pending'
                ELSE 'closed'
            END,
            c.created_at + interval '1 day',
            c.created_at + interval '1 day'
        FROM clients c
        WHERE c.email IN (
            'sarah.johnson@email.com', 'michael.chen@email.com', 'emily.rodriguez@email.com', 
            'david.thompson@email.com', 'jennifer.williams@email.com', 'robert.brown@email.com',
            'lisa.davis@email.com', 'james.miller@email.com', 'amanda.wilson@email.com', 
            'christopher.moore@email.com'
        )
        ON CONFLICT DO NOTHING;

        -- Create case assignments for the created cases
        INSERT INTO case_assignments (case_id, user_id, role, is_primary, assigned_at, assigned_by)
        SELECT 
            cases.id,
            admin_user_id,
            'admin',
            true,
            cases.created_at,
            admin_user_id
        FROM cases
        WHERE cases.lawyer_id = admin_user_id
        ON CONFLICT (case_id, user_id) DO NOTHING;

        -- Create sample messages from admin perspective
        INSERT INTO messages (case_id, sender_id, content, created_at)
        SELECT 
            cases.id,
            admin_user_id,
            CASE 
                WHEN cases.title LIKE '%Business Formation%' THEN 'Welcome to our firm! I''ll be handling your LLC formation. Let''s schedule a consultation to discuss your business goals.'
                WHEN cases.title LIKE '%Contract Review%' THEN 'I''ve received your software license agreement. I''ll review it thoroughly and provide feedback within 48 hours.'
                WHEN cases.title LIKE '%Employment%' THEN 'I''ve reviewed your employment situation. We have several options to pursue. Let''s discuss your priorities.'
                WHEN cases.title LIKE '%Real Estate%' THEN 'I''ll guide you through the property purchase process. First, let''s review the purchase agreement terms.'
                WHEN cases.title LIKE '%Discrimination%' THEN 'I understand this is a difficult situation. We''ll build a strong case to protect your rights.'
                WHEN cases.title LIKE '%Termination%' THEN 'Let''s gather all documentation related to your termination. We''ll evaluate the strength of your case.'
                ELSE 'Thank you for choosing our firm. I''ll be your primary attorney and will keep you updated on all developments.'
            END,
            cases.created_at + interval '2 hours'
        FROM cases
        WHERE cases.lawyer_id = admin_user_id
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Create sample documents (these don't need real files, just metadata)
INSERT INTO documents (case_id, name, file_path, file_size, mime_type, uploaded_by, created_at)
SELECT 
    cases.id,
    CASE 
        WHEN cases.title LIKE '%Business%' THEN 'Articles of Incorporation Draft.pdf'
        WHEN cases.title LIKE '%Contract%' THEN 'Software License Agreement.pdf'
        WHEN cases.title LIKE '%Employment%' THEN 'Employment Contract.pdf'
        WHEN cases.title LIKE '%Real Estate%' THEN 'Purchase Agreement.pdf'
        WHEN cases.title LIKE '%Discrimination%' THEN 'HR Complaint Filing.pdf'
        ELSE 'Case Documentation.pdf'
    END,
    '/documents/sample/' || cases.id || '/' || 
    CASE 
        WHEN cases.title LIKE '%Business%' THEN 'articles-of-incorporation.pdf'
        WHEN cases.title LIKE '%Contract%' THEN 'software-license.pdf'
        WHEN cases.title LIKE '%Employment%' THEN 'employment-contract.pdf'
        WHEN cases.title LIKE '%Real Estate%' THEN 'purchase-agreement.pdf'
        WHEN cases.title LIKE '%Discrimination%' THEN 'hr-complaint.pdf'
        ELSE 'case-docs.pdf'
    END,
    (random() * 1000000 + 50000)::bigint, -- Random file size between 50KB and 1MB
    'application/pdf',
    cases.lawyer_id,
    cases.created_at + interval '1 day'
FROM cases
WHERE cases.lawyer_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Create some sample audit logs (only if we have real users)
DO $$
DECLARE
    user_count integer;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    IF user_count > 0 THEN
        -- Create audit logs for existing users
        INSERT INTO audit_logs (user_id, action, details, created_at)
        SELECT 
            au.id,
            'case_view',
            jsonb_build_object(
                'case_id', c.id,
                'case_title', c.title,
                'ip_address', '192.168.1.' || (100 + (random() * 50)::int),
                'user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ),
            c.created_at + interval '3 hours'
        FROM auth.users au
        CROSS JOIN cases c
        LIMIT 20
        ON CONFLICT DO NOTHING;

        -- Add some login logs
        INSERT INTO audit_logs (user_id, action, details, created_at)
        SELECT 
            au.id,
            'sign_in',
            jsonb_build_object(
                'login_method', 'email_password',
                'ip_address', '192.168.1.' || (100 + (random() * 50)::int),
                'user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'timestamp', now()
            ),
            now() - interval '1 day' + (random() * interval '24 hours')
        FROM auth.users au
        LIMIT 10
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Add some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_case_id ON messages(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);

-- Update table statistics for better query planning
ANALYZE clients;
ANALYZE cases;
ANALYZE messages;
ANALYZE documents;
ANALYZE case_assignments;
ANALYZE audit_logs;
ANALYZE user_profiles;

-- Display summary of created data
DO $$
DECLARE
    client_count integer;
    case_count integer;
    message_count integer;
    profile_count integer;
BEGIN
    SELECT COUNT(*) INTO client_count FROM clients;
    SELECT COUNT(*) INTO case_count FROM cases;
    SELECT COUNT(*) INTO message_count FROM messages;
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE role != 'admin';
    
    RAISE NOTICE 'Sample data created successfully:';
    RAISE NOTICE '- % client records', client_count;
    RAISE NOTICE '- % case records', case_count;
    RAISE NOTICE '- % message records', message_count;
    RAISE NOTICE '- % staff profile templates', profile_count;
END $$;