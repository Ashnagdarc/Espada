-- Add role column to customer_profiles for admin/customer distinction
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));

-- Create index for role column
CREATE INDEX IF NOT EXISTS idx_customer_profiles_role ON customer_profiles(role);

-- Update RLS policies to allow admins to access all data
CREATE POLICY "Admins can view all profiles" ON customer_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON customer_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert profiles" ON customer_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        ) OR role = 'customer'
    );

-- Update orders RLS policies for admin access
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        )
    );

-- Update products RLS policies for admin access
CREATE POLICY "Admins can insert products" ON products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        )
    );

CREATE POLICY "Admins can update products" ON products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete products" ON products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        )
    );

-- Update order_items RLS policies for admin access
CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        )
    );

CREATE POLICY "Admins can update order items" ON order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete order items" ON order_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.stack_user_id = auth.uid()::text 
            AND cp.role = 'admin'
        )
    );