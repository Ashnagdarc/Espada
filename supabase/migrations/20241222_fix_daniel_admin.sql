-- Ensure daniel.nonso48@gmail.com is properly set up as admin in customer_profiles

-- First, get the auth user ID
WITH auth_user AS (
  SELECT id as auth_id FROM auth.users WHERE email = 'daniel.nonso48@gmail.com'
)
-- Insert or update the admin profile
INSERT INTO customer_profiles (
  email,
  first_name,
  last_name,
  role,
  auth_user_id,
  status,
  created_at,
  updated_at
)
SELECT 
  'daniel.nonso48@gmail.com',
  'Daniel',
  'Nonso',
  'admin',
  auth_user.auth_id,
  'active',
  now(),
  now()
FROM auth_user
WHERE auth_user.auth_id IS NOT NULL
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  auth_user_id = EXCLUDED.auth_user_id,
  status = 'active',
  updated_at = now();