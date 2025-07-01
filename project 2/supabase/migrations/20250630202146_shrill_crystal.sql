-- Fix Sample Data Association
-- Run this in Supabase SQL Editor AFTER you've logged into the app

-- First, let's see what users exist
-- SELECT * FROM auth.users;

-- Associate sample clients with the current admin user
-- Replace 'admin@legalportal.com' with your actual email if different
DO $$
DECLARE
    current_user_id uuid;
    sample_client_id uuid;
BEGIN
    -- Get the admin user ID (replace email if needed)
    SELECT id INTO current_user_id 
    FROM auth.users 
    WHERE email = 'admin@legalportal.com'
    LIMIT 1;
    
    -- If no admin user, get any user
    IF current_user_id IS NULL THEN
        SELECT id INTO current_user_id 
        FROM auth.users 
        LIMIT 1;
    END IF;
    
    IF current_user_id IS NOT NULL THEN
        -- Update one sample client to be associated with the current user
        UPDATE clients 
        SET user_id = current_user_id 
        WHERE email = 'sarah.johnson@email.com';
        
        -- Get the client ID for creating cases
        SELECT id INTO sample_client_id 
        FROM clients 
        WHERE email = 'sarah.johnson@email.com';
        
        -- Create or update user profile for the current user
        INSERT INTO user_profiles (
            user_id, role, first_name, last_name, email, is_active, created_at, updated_at
        ) VALUES (
            current_user_id, 'admin', 'System', 'Administrator', 
            (SELECT email FROM auth.users WHERE id = current_user_id),
            true, now(), now()
        )
        ON CONFLICT (email) DO UPDATE SET
            user_id = current_user_id,
            role = 'admin',
            is_active = true;
        
        -- Update cases to be associated with this client and user
        UPDATE cases 
        SET client_id = sample_client_id, lawyer_id = current_user_id
        WHERE title IN (
            'Business Formation Consultation',
            'Contract Review - Software License', 
            'Corporate Merger Advisory'
        );
        
        RAISE NOTICE 'Sample data associated with user: %', current_user_id;
        RAISE NOTICE 'Client ID: %', sample_client_id;
    ELSE
        RAISE NOTICE 'No user found. Please log into the app first.';
    END IF;
END $$;

-- Alternative: If you want to see all sample data regardless of user, 
-- temporarily modify the RLS policies (NOT recommended for production)

-- Check what data exists
SELECT 'Clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'Cases' as table_name, COUNT(*) as count FROM cases
UNION ALL  
SELECT 'User Profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'Auth Users' as table_name, COUNT(*) as count FROM auth.users;

-- Check current user's associated data
SELECT 
    'Your User ID' as info,
    auth.uid()::text as value
UNION ALL
SELECT 
    'Your Profile' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid()) 
        THEN 'Profile exists' 
        ELSE 'No profile found' 
    END as value
UNION ALL
SELECT 
    'Your Client Record' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM clients WHERE user_id = auth.uid()) 
        THEN 'Client record exists' 
        ELSE 'No client record' 
    END as value
UNION ALL
SELECT 
    'Your Cases' as info,
    COUNT(*)::text as value
FROM cases c
JOIN clients cl ON cl.id = c.client_id
WHERE cl.user_id = auth.uid();