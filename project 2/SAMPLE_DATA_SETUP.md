# Add Sample Data to Your Database

## Step 1: Run the Sample Data Migration

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL to add sample clients and cases:

```sql
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

-- Get the admin user ID to use as lawyer_id for sample cases
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Try to get admin user
    SELECT user_id INTO admin_user_id FROM user_profiles WHERE email = 'admin@legalportal.com' LIMIT 1;
    
    -- If no admin, get any existing user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
    END IF;
    
    -- If we have a user, create cases
    IF admin_user_id IS NOT NULL THEN
        -- Create sample cases
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
    END IF;
END $$;

-- Verify the data was created
SELECT 'Clients created:' as summary, COUNT(*) as count FROM clients
UNION ALL
SELECT 'Cases created:', COUNT(*) FROM cases
UNION ALL
SELECT 'User profiles created:', COUNT(*) FROM user_profiles WHERE role != 'admin';
```

4. Click "Run" to execute the SQL

## Step 2: Verify Data Creation

After running the SQL, you should see a summary showing:
- 10 clients created
- 10 cases created  
- 5 user profiles created

## Step 3: Check Data Access

If you still don't see data in the app, try these troubleshooting steps:

### For Admin Users:
1. Make sure you're logged in as an admin user (admin@legalportal.com)
2. Go to "User Management" to see all user profiles
3. Admin users should see all clients and cases

### For Client Users:
- Client users will only see their own cases (none yet, since sample clients aren't linked to real user accounts)
- To see cases as a client, you'd need to register with one of the sample client emails

### Quick Test Query:
Run this in Supabase SQL Editor to see what data exists:

```sql
-- Check clients
SELECT 'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
-- Check cases  
SELECT 'cases', COUNT(*) FROM cases
UNION ALL
-- Check user profiles
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
-- Check your current user
SELECT 'your_user_profile', COUNT(*) FROM user_profiles WHERE user_id = auth.uid();
```

## Step 4: Role-Based Data Visibility

The app shows different data based on your role:

- **Admin**: Can see all clients, cases, and user profiles
- **Attorney/Paralegal**: Can see assigned cases and firm data  
- **Client**: Can only see their own cases and data

Make sure you're logged in as an admin user to see all the sample data!