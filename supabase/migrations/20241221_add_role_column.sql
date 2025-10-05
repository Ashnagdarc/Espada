-- =====================================================
-- ADD ROLE COLUMN TO CUSTOMER PROFILES
-- =====================================================
-- This migration adds the role column to customer_profiles
-- to distinguish between customers and admins
-- =====================================================

-- Add role column to customer_profiles
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));

-- Create index for role column
CREATE INDEX IF NOT EXISTS idx_customer_profiles_role ON customer_profiles(role);

-- Update any existing admin users to have admin role
-- This assumes there might be existing admin users based on email or other criteria
UPDATE customer_profiles 
SET role = 'admin' 
WHERE email LIKE '%admin%' OR email = 'admin@espada.com';

-- If no admin exists, we'll create one in the next migration