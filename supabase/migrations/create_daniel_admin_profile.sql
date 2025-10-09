-- Create admin profile for daniel.nonso48@gmail.com
-- This user exists in auth.users but not in customer_profiles

INSERT INTO public.customer_profiles (
    auth_user_id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
)
SELECT 
    '5f1402a8-e1d6-4358-a3d4-46b4e6ffe152'::uuid,
    'daniel.nonso48@gmail.com',
    'Daniel',
    'Nonso',
    'admin',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.customer_profiles 
    WHERE email = 'daniel.nonso48@gmail.com'
);

-- Verify the insertion
SELECT 
    id,
    auth_user_id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM public.customer_profiles 
WHERE email = 'daniel.nonso48@gmail.com';