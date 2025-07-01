-- Fix Sample Data Association (Direct Method)
-- Run this in Supabase SQL Editor

-- First, let's see what users exist and get the user ID directly
DO $$
DECLARE
    target_user_id uuid;
    target_email text;
    sample_client_id uuid;
    case_count integer;
BEGIN
    -- Try to find admin user first
    SELECT id, email INTO target_user_id, target_email
    FROM auth.users 
    WHERE email = 'admin@legalportal.com'
    LIMIT 1;
    
    -- If no admin user, get any user (probably your registered user)
    IF target_user_id IS NULL THEN
        SELECT id, email INTO target_user_id, target_email
        FROM auth.users 
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;
    
    IF target_user_id IS NOT NULL THEN
        RAISE NOTICE 'Working with user: % (ID: %)', target_email, target_user_id;
        
        -- 1. Create/update user profile
        INSERT INTO user_profiles (
            user_id, role, first_name, last_name, email, is_active, created_at, updated_at
        ) VALUES (
            target_user_id, 'admin', 'System', 'Administrator', 
            target_email, true, now(), now()
        )
        ON CONFLICT (email) DO UPDATE SET
            user_id = target_user_id,
            role = 'admin',
            is_active = true,
            updated_at = now();
        
        -- 2. Associate sample client with this user
        UPDATE clients 
        SET user_id = target_user_id 
        WHERE email = 'sarah.johnson@email.com';
        
        -- Get the updated client ID
        SELECT id INTO sample_client_id 
        FROM clients 
        WHERE email = 'sarah.johnson@email.com';
        
        -- 3. Create cases for this client-user combination
        -- First, delete any existing cases to avoid conflicts
        DELETE FROM cases WHERE title IN (
            'Business Formation Consultation',
            'Contract Review - Software License', 
            'Corporate Merger Advisory',
            'Employment Contract Negotiation'
        );
        
        -- Create new cases
        INSERT INTO cases (client_id, lawyer_id, title, description, status, created_at, updated_at)
        VALUES 
        (sample_client_id, target_user_id, 'Business Formation Consultation', 
         'Assistance with LLC formation and initial business setup including operating agreements.', 
         'active', now() - interval '5 days', now() - interval '5 days'),
        (sample_client_id, target_user_id, 'Contract Review - Software License', 
         'Review and negotiation of enterprise software licensing agreement with vendor.', 
         'active', now() - interval '3 days', now() - interval '3 days'),
        (sample_client_id, target_user_id, 'Corporate Merger Advisory', 
         'Legal advisory services for corporate merger and acquisition process.', 
         'pending', now() - interval '1 day', now() - interval '1 day'),
        (sample_client_id, target_user_id, 'Employment Contract Negotiation', 
         'Negotiation and review of executive employment contract terms.', 
         'active', now(), now());
        
        -- 4. Create case assignments
        INSERT INTO case_assignments (case_id, user_id, role, is_primary, assigned_at, assigned_by)
        SELECT c.id, target_user_id, 'admin', true, c.created_at, target_user_id
        FROM cases c
        WHERE c.client_id = sample_client_id
        ON CONFLICT (case_id, user_id) DO NOTHING;
        
        -- 5. Create some sample messages
        INSERT INTO messages (case_id, sender_id, content, created_at)
        SELECT 
            c.id,
            target_user_id,
            'Welcome to our firm! I''ll be handling your case. Let''s schedule a consultation to discuss your goals.',
            c.created_at + interval '1 hour'
        FROM cases c
        WHERE c.client_id = sample_client_id
        ON CONFLICT DO NOTHING;
        
        -- Get final counts
        SELECT COUNT(*) INTO case_count FROM cases WHERE client_id = sample_client_id;
        
        RAISE NOTICE 'SUCCESS! Created % cases for client % associated with user %', 
                     case_count, sample_client_id, target_user_id;
        
    ELSE
        RAISE NOTICE 'ERROR: No users found in auth.users table. Please register/login first.';
    END IF;
END $$;

-- Final verification query
SELECT 
    u.email as "User Email",
    u.id as "User ID",
    up.role as "User Role",
    c.email as "Client Email", 
    COUNT(cases.*) as "Number of Cases"
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
LEFT JOIN clients c ON c.user_id = u.id  
LEFT JOIN cases ON cases.client_id = c.id
GROUP BY u.email, u.id, up.role, c.email
ORDER BY u.created_at DESC;