-- Remove stack_user_id columns from tables as we migrate to Supabase Auth

-- Remove stack_user_id from admins table
ALTER TABLE admins DROP COLUMN IF EXISTS stack_user_id;

-- Add auth_user_id to customer_profiles table
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for auth_user_id
CREATE INDEX IF NOT EXISTS idx_customer_profiles_auth_user_id ON customer_profiles(auth_user_id);

-- Drop all existing policies that depend on stack_user_id
DROP POLICY IF EXISTS "Customers can manage their own profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Customers can manage their own orders" ON orders;
DROP POLICY IF EXISTS "Customers can manage their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

-- Remove stack_user_id from customer_profiles table
ALTER TABLE customer_profiles DROP COLUMN IF EXISTS stack_user_id CASCADE;

-- Create new RLS policies using auth.uid()
CREATE POLICY "Users can view own profile" ON customer_profiles
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON customer_profiles
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON customer_profiles
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- Update orders table policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customer_profiles cp 
      WHERE cp.id = orders.customer_id 
      AND cp.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_profiles cp 
      WHERE cp.id = orders.customer_id 
      AND cp.auth_user_id = auth.uid()
    )
  );

-- Update order_items table policies
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customer_profiles cp 
      JOIN orders o ON o.customer_id = cp.id
      WHERE o.id = order_items.order_id 
      AND cp.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_profiles cp 
      JOIN orders o ON o.customer_id = cp.id
      WHERE o.id = order_items.order_id 
      AND cp.auth_user_id = auth.uid()
    )
  );