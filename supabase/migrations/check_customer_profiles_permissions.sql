-- Check and grant permissions for customer_profiles table

-- Grant permissions to anon role for basic read access
GRANT SELECT ON customer_profiles TO anon;

-- Grant full permissions to authenticated role
GRANT ALL PRIVILEGES ON customer_profiles TO authenticated;

-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'customer_profiles' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    -- Policy for authenticated users to read their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON customer_profiles
            FOR SELECT USING (stack_user_id = auth.uid()::text);
    END IF;

    -- Policy for authenticated users to update their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON customer_profiles
            FOR UPDATE USING (stack_user_id = auth.uid()::text);
    END IF;

    -- Policy for authenticated users to insert their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON customer_profiles
            FOR INSERT WITH CHECK (stack_user_id = auth.uid()::text);
    END IF;
END
$$;