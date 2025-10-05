-- Remove stack_user_id columns from tables as we migrate to Supabase Auth

-- Remove stack_user_id from admins table
ALTER TABLE admins DROP COLUMN IF EXISTS stack_user_id;

-- Remove stack_user_id from customer_profiles table and make it optional
ALTER TABLE customer_profiles ALTER COLUMN stack_user_id DROP NOT NULL;
ALTER TABLE customer_profiles DROP COLUMN IF EXISTS stack_user_id;

-- Add auth_user_id column to customer_profiles to link with Supabase Auth users
ALTER TABLE customer_profiles ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_auth_user_id ON customer_profiles(auth_user_id);

-- Update RLS policies to work with Supabase Auth
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;

-- Create new policies using auth.uid()
CREATE POLICY "Users can view own profile" ON customer_profiles
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON customer_profiles
    FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON customer_profiles
    FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- Admin policies remain the same as they use email-based authentication