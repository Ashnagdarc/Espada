-- Check current status of daniel.nonso48@gmail.com in both tables

-- Check customer_profiles table
SELECT 
    'customer_profiles' as table_name,
    email,
    role,
    auth_user_id,
    status,
    created_at
FROM customer_profiles 
WHERE email = 'daniel.nonso48@gmail.com';

-- Check admins table (legacy)
SELECT 
    'admins' as table_name,
    email,
    first_name,
    last_name,
    created_at
FROM admins 
WHERE email = 'daniel.nonso48@gmail.com';

-- Check auth.users table
SELECT 
    'auth_users' as table_name,
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'daniel.nonso48@gmail.com';