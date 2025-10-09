-- Fix admin role for daniel.nonso48@gmail.com
-- This migration ensures the admin user is properly set up in customer_profiles table

-- First, check if the user exists in customer_profiles and update/insert as needed
DO $$
DECLARE
    user_exists BOOLEAN;
    auth_user_uuid UUID;
BEGIN
    -- Get the auth user ID for daniel.nonso48@gmail.com
    SELECT id INTO auth_user_uuid 
    FROM auth.users 
    WHERE email = 'daniel.nonso48@gmail.com';
    
    IF auth_user_uuid IS NOT NULL THEN
        -- Check if profile exists in customer_profiles
        SELECT EXISTS(
            SELECT 1 FROM customer_profiles 
            WHERE email = 'daniel.nonso48@gmail.com'
        ) INTO user_exists;
        
        IF user_exists THEN
            -- Update existing profile to admin role
            UPDATE customer_profiles 
            SET 
                role = 'admin',
                auth_user_id = auth_user_uuid,
                updated_at = now()
            WHERE email = 'daniel.nonso48@gmail.com';
            
            RAISE NOTICE 'Updated existing profile for daniel.nonso48@gmail.com to admin role';
        ELSE
            -- Insert new profile with admin role
            INSERT INTO customer_profiles (
                email,
                first_name,
                last_name,
                role,
                auth_user_id,
                status,
                created_at,
                updated_at
            ) VALUES (
                'daniel.nonso48@gmail.com',
                'Daniel',
                'Nonso',
                'admin',
                auth_user_uuid,
                'active',
                now(),
                now()
            );
            
            RAISE NOTICE 'Created new admin profile for daniel.nonso48@gmail.com';
        END IF;
    ELSE
        RAISE NOTICE 'Auth user not found for daniel.nonso48@gmail.com';
    END IF;
END $$;

-- Verify the result
SELECT 
    email,
    role,
    auth_user_id,
    status,
    created_at
FROM customer_profiles 
WHERE email = 'daniel.nonso48@gmail.com';