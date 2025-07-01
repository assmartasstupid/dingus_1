# Supabase Setup Guide for Legal Client Portal

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up/sign in
3. Click "New Project"
4. Choose your organization
5. Fill in your project details:
   - **Name**: Legal Client Portal
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region to your users
6. Click "Create new project"

## Step 2: Get Your Project Credentials

1. Once your project is created, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (something like `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run Database Migrations

The project includes migration files that will set up all the necessary tables and security policies.

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the migrations in order:
   - First: Copy and run `supabase/migrations/20250629174657_turquoise_brook.sql`
   - Then: Copy and run `supabase/migrations/fix_rls_policies.sql`

These migrations will create:
- User profiles table with role-based access
- Permissions and role permissions tables
- Case assignments table
- Firm settings table
- All necessary Row Level Security (RLS) policies that prevent infinite recursion
- Helper functions for role-based access control

## Step 5: Set Up Storage (for Document Uploads)

1. In your Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name it `documents`
4. Make it **Private** (not public)
5. Click "Create bucket"

### Configure Storage Policies

Go to **Storage** → **Policies** and add these policies for the `documents` bucket:

**Policy 1: Users can upload their own documents**
```sql
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Policy 2: Users can view their own documents**
```sql
CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Policy 3: Users can delete their own documents**
```sql
CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 6: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your domain (for local development: `http://localhost:5173`)
3. Under **Redirect URLs**, add your domain with `/auth/callback`

### Email Templates (Optional)

You can customize the email templates in **Authentication** → **Email Templates** for:
- Confirm signup
- Reset password
- Magic link

## Step 7: Create Test Users

You can create test users in two ways:

### Option A: Through the Application
1. Start your application (`npm run dev`)
2. Go to the registration page
3. Create accounts with different roles

### Option B: Through Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Add email and password
4. After creating the user, the application will automatically create a user profile

## Step 8: Test the Application

1. Start your development server: `npm run dev`
2. Try logging in with the demo accounts shown on the login page:
   - **Admin**: admin@legalportal.com / Admin123!
   - **Client**: client@example.com / Client123!

## Default Admin Account

The system will automatically create an admin profile for any user with the email `admin@legalportal.com`. You can:

1. Create this user in Supabase Auth
2. Or register through the app with this email
3. The system will automatically assign admin role

## Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**: 
   - Check your `.env` file has the correct Supabase URL and anon key
   - Restart your development server after adding environment variables

2. **Database errors**:
   - Make sure you've run the migration SQL in the Supabase SQL Editor
   - Check that RLS is enabled on all tables

3. **File upload errors**:
   - Ensure the `documents` storage bucket exists
   - Check that storage policies are correctly configured

4. **User profile not found**:
   - The app automatically creates user profiles, but you may need to refresh
   - Check the `user_profiles` table in your Supabase dashboard

### Checking Your Setup:

1. **Database Tables**: Go to **Table Editor** and verify these tables exist:
   - `user_profiles`
   - `clients`
   - `cases`
   - `documents`
   - `messages`
   - `audit_logs`
   - `permissions`
   - `role_permissions`
   - `case_assignments`
   - `firm_settings`

2. **Storage**: Go to **Storage** and verify the `documents` bucket exists

3. **Authentication**: Go to **Authentication** → **Users** to see created users

## Security Features

This setup includes:
- Row Level Security (RLS) on all tables
- Role-based access control
- Secure file uploads with user isolation
- Audit logging for security events
- Email verification for new accounts

## Next Steps

Once Supabase is set up:
1. Customize the firm settings in the admin panel
2. Add your team members through user management
3. Configure email templates and branding
4. Set up any additional integrations you need

For production deployment, make sure to:
- Use environment variables for sensitive data
- Configure proper CORS settings
- Set up database backups
- Monitor usage and performance