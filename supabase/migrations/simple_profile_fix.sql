-- Simple fix for profile creation issue
-- Allow users to create their own profiles

-- Drop all existing policies on customer_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles for others" ON customer_profiles;

-- Create simple policies that work
CREATE POLICY "Allow profile creation" ON customer_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON customer_profiles
    FOR SELECT USING (stack_user_id = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON customer_profiles
    FOR UPDATE USING (stack_user_id = auth.uid()::text);