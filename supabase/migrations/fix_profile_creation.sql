-- Fix profile creation issue by allowing users to create their own profiles
-- This migration addresses the RLS policy issue preventing new user profile creation

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON customer_profiles;

-- Create a policy that allows users to create their own profile
CREATE POLICY "Users can create own profile" ON customer_profiles
    FOR INSERT WITH CHECK (stack_user_id = auth.uid()::text);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON customer_profiles
    FOR SELECT USING (stack_user_id = auth.uid()::text);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON customer_profiles
    FOR UPDATE USING (stack_user_id = auth.uid()::text);

-- Create a separate policy for admin access that doesn't cause recursion
-- First, create a function that checks if the current user is admin without using RLS
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
DECLARE
    admin_count integer;
BEGIN
    -- Use a direct query without RLS to check admin status
    SELECT COUNT(*) INTO admin_count
    FROM customer_profiles 
    WHERE stack_user_id = auth.uid()::text AND role = 'admin';
    
    RETURN admin_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create admin policies using the auth.is_admin function
CREATE POLICY "Admins can view all profiles" ON customer_profiles
    FOR SELECT USING (auth.is_admin());

CREATE POLICY "Admins can update all profiles" ON customer_profiles
    FOR UPDATE USING (auth.is_admin());

CREATE POLICY "Admins can insert profiles for others" ON customer_profiles
    FOR INSERT WITH CHECK (auth.is_admin());

-- Ensure the admin user exists
-- Insert admin user if it doesn't exist (this will be executed with elevated privileges)
DO $$
BEGIN
    -- Check if admin user exists, if not create one
    IF NOT EXISTS (
        SELECT 1 FROM customer_profiles 
        WHERE email = 'daniel.nonso48@gmail.com' AND role = 'admin'
    ) THEN
        -- This assumes the Stack Auth user ID for daniel.nonso48@gmail.com
        -- You may need to update this with the actual Stack user ID
        INSERT INTO customer_profiles (
            stack_user_id,
            email,
            first_name,
            last_name,
            role,
            preferences
        ) VALUES (
            'admin_user_id_placeholder', -- This needs to be replaced with actual Stack user ID
            'daniel.nonso48@gmail.com',
            'Daniel',
            'Nonso',
            'admin',
            '{"newsletter": false, "smsUpdates": false}'::jsonb
        ) ON CONFLICT (stack_user_id) DO UPDATE SET
            role = 'admin',
            email = 'daniel.nonso48@gmail.com';
    END IF;
END $$;