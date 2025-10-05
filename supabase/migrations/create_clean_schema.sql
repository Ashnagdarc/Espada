-- =====================================================
-- CLEAN SCHEMA CREATION - ESPADA E-COMMERCE
-- =====================================================
-- This migration creates the new clean database schema
-- with proper separation between admin and customer entities
-- 
-- CRITICAL PRINCIPLE: ADMINS AND USERS ARE COMPLETELY SEPARATE
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ADMINS TABLE (COMPLETELY SEPARATE FROM CUSTOMERS)
-- =====================================================
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  stack_user_id VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'admin',
  permissions JSONB DEFAULT '{"dashboard": true, "products": true, "orders": true, "customers": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS for admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins can read/write their own records
CREATE POLICY "Admins can manage their own records" ON admins
  FOR ALL USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Grant permissions to authenticated role (for admin users)
GRANT ALL PRIVILEGES ON admins TO authenticated;

-- =====================================================
-- 2. CUSTOMER_PROFILES TABLE (ONLY FOR CUSTOMERS)
-- =====================================================
CREATE TABLE customer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stack_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  date_of_birth DATE,
  preferences JSONB DEFAULT '{"newsletter": false, "smsUpdates": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS for customer_profiles table
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Customers can read/write their own profiles only
CREATE POLICY "Customers can manage their own profiles" ON customer_profiles
  FOR ALL USING (stack_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Admins can read all customer profiles
CREATE POLICY "Admins can read all customer profiles" ON customer_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Grant permissions
GRANT ALL PRIVILEGES ON customer_profiles TO authenticated;
GRANT SELECT ON customer_profiles TO anon;

-- =====================================================
-- 3. PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]',
  colors JSONB DEFAULT '[]',
  sizes JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'active',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read access for all products
CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (status = 'active');

-- Only admins can create/update/delete products
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Grant permissions
GRANT ALL PRIVILEGES ON products TO authenticated;
GRANT SELECT ON products TO anon;

-- =====================================================
-- 4. ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  shipping_address JSONB,
  billing_address JSONB,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can read/write their own orders only
CREATE POLICY "Customers can manage their own orders" ON orders
  FOR ALL USING (
    customer_id IN (
      SELECT id FROM customer_profiles 
      WHERE stack_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Admins can read/write all orders
CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Grant permissions
GRANT ALL PRIVILEGES ON orders TO authenticated;

-- =====================================================
-- 5. ORDER_ITEMS TABLE
-- =====================================================
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  color VARCHAR(50),
  size VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS for order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Customers can read/write their own order items only
CREATE POLICY "Customers can manage their own order items" ON order_items
  FOR ALL USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN customer_profiles cp ON o.customer_id = cp.id
      WHERE cp.stack_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Admins can read/write all order items
CREATE POLICY "Admins can manage all order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Grant permissions
GRANT ALL PRIVILEGES ON order_items TO authenticated;

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_stack_user_id ON admins(stack_user_id);
CREATE INDEX idx_customer_profiles_stack_user_id ON customer_profiles(stack_user_id);
CREATE INDEX idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. SEED ADMIN USER
-- =====================================================
INSERT INTO admins (email, first_name, last_name, role, permissions)
VALUES (
  'daniel.nonso48@gmail.com',
  'Daniel',
  'Nonso',
  'admin',
  '{"dashboard": true, "products": true, "orders": true, "customers": true, "settings": true}'
) ON CONFLICT (email) DO NOTHING;

-- Log the schema creation
DO $$
BEGIN
    RAISE NOTICE 'Clean schema created successfully';
    RAISE NOTICE 'Admin user daniel.nonso48@gmail.com added to admins table';
    RAISE NOTICE 'All tables have proper RLS policies';
    RAISE NOTICE 'Ready for authentication logic updates';
END $$;