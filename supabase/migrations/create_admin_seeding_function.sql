-- Create a function to seed admin users that bypasses RLS
CREATE OR REPLACE FUNCTION seed_admin_user(
  p_stack_user_id text,
  p_email text,
  p_first_name text DEFAULT 'Admin',
  p_last_name text DEFAULT 'User'
)
RETURNS uuid AS $$
DECLARE
  profile_id uuid;
BEGIN
  -- Insert admin profile bypassing RLS
  INSERT INTO customer_profiles (
    stack_user_id,
    email,
    first_name,
    last_name,
    role
  ) VALUES (
    p_stack_user_id,
    p_email,
    p_first_name,
    p_last_name,
    'admin'
  ) RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;