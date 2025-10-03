-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON customer_profiles;

-- Create a simpler approach using a function to check admin status
CREATE OR REPLACE FUNCTION is_admin(user_id text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customer_profiles 
    WHERE stack_user_id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies that don't cause recursion
CREATE POLICY "Admins can view all profiles" ON customer_profiles
    FOR SELECT USING (
        stack_user_id = auth.uid()::text OR 
        is_admin(auth.uid()::text)
    );

CREATE POLICY "Admins can update all profiles" ON customer_profiles
    FOR UPDATE USING (
        stack_user_id = auth.uid()::text OR 
        is_admin(auth.uid()::text)
    );

CREATE POLICY "Admins can insert any profile" ON customer_profiles
    FOR INSERT WITH CHECK (
        stack_user_id = auth.uid()::text OR 
        is_admin(auth.uid()::text) OR
        role = 'customer'
    );

-- Update other policies to use the function
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        is_admin(auth.uid()::text) OR
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.id = orders.customer_id 
            AND cp.stack_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (is_admin(auth.uid()::text));

-- Update products policies
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

CREATE POLICY "Admins can insert products" ON products
    FOR INSERT WITH CHECK (is_admin(auth.uid()::text));

CREATE POLICY "Admins can update products" ON products
    FOR UPDATE USING (is_admin(auth.uid()::text));

CREATE POLICY "Admins can delete products" ON products
    FOR DELETE USING (is_admin(auth.uid()::text));

-- Update order_items policies
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can insert order items" ON order_items;
DROP POLICY IF EXISTS "Admins can update order items" ON order_items;
DROP POLICY IF EXISTS "Admins can delete order items" ON order_items;

CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (
        is_admin(auth.uid()::text) OR
        EXISTS (
            SELECT 1 FROM orders o 
            JOIN customer_profiles cp ON o.customer_id = cp.id 
            WHERE o.id = order_items.order_id 
            AND cp.stack_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins can insert order items" ON order_items
    FOR INSERT WITH CHECK (is_admin(auth.uid()::text));

CREATE POLICY "Admins can update order items" ON order_items
    FOR UPDATE USING (is_admin(auth.uid()::text));

CREATE POLICY "Admins can delete order items" ON order_items
    FOR DELETE USING (is_admin(auth.uid()::text));