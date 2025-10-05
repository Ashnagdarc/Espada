-- =====================================================
-- ENHANCED CUSTOMER PROFILES MIGRATION
-- =====================================================
-- This migration enhances the existing customer_profiles table
-- with additional fields for better admin management
-- =====================================================

-- Add new columns to customer_profiles table
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Create customer_addresses table for better address management
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
  street_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_status ON customer_profiles(status);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_total_spent ON customer_profiles(total_spent DESC);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_last_order_date ON customer_profiles(last_order_date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_type ON customer_addresses(type);

-- Enable RLS for customer_addresses
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customer_addresses
CREATE POLICY "Users can view own addresses" ON customer_addresses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.id = customer_addresses.customer_id 
            AND cp.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own addresses" ON customer_addresses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.id = customer_addresses.customer_id 
            AND cp.auth_user_id = auth.uid()
        )
    );

-- Admin policies for customer_addresses
CREATE POLICY "Admins can view all addresses" ON customer_addresses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.auth_user_id = auth.uid() 
            AND cp.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all addresses" ON customer_addresses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.auth_user_id = auth.uid() 
            AND cp.role = 'admin'
        )
    );

-- Grant permissions
GRANT ALL PRIVILEGES ON customer_addresses TO authenticated;

-- Create function to update customer statistics
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer statistics when order status changes to completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE customer_profiles 
        SET 
            total_orders = total_orders + 1,
            total_spent = total_spent + NEW.total,
            last_order_date = NEW.updated_at
        WHERE id = NEW.customer_id;
    END IF;
    
    -- Update statistics when order is cancelled
    IF NEW.status = 'cancelled' AND OLD.status = 'completed' THEN
        UPDATE customer_profiles 
        SET 
            total_orders = GREATEST(total_orders - 1, 0),
            total_spent = GREATEST(total_spent - NEW.total, 0.00)
        WHERE id = NEW.customer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update customer statistics
CREATE TRIGGER trigger_update_customer_stats
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();