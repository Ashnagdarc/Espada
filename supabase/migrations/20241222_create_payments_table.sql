-- =====================================================
-- PAYSTACK PAYMENTS INTEGRATION - DATABASE MIGRATION
-- =====================================================
-- This migration creates the payments table and updates
-- the orders table for Paystack integration
-- =====================================================

-- =====================================================
-- 1. CREATE PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  paystack_reference VARCHAR(255) UNIQUE NOT NULL,
  paystack_access_code VARCHAR(255),
  authorization_url TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  status VARCHAR(50) DEFAULT 'pending', -- pending, success, failed, abandoned
  gateway_response TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ADD INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_reference ON payments(paystack_reference);
CREATE INDEX idx_payments_status ON payments(status);

-- =====================================================
-- 3. ADD RLS POLICIES FOR PAYMENTS TABLE
-- =====================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Customers can read their own payments
CREATE POLICY "Customers can read their own payments" ON payments
  FOR SELECT USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN customer_profiles cp ON o.customer_id = cp.id
      WHERE cp.stack_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Admins can manage all payments
CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Grant permissions
GRANT ALL PRIVILEGES ON payments TO authenticated;

-- =====================================================
-- 4. UPDATE ORDERS TABLE FOR PAYSTACK
-- =====================================================
-- Add Paystack-specific fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paystack_reference VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50) DEFAULT 'paystack';

-- Add index for Paystack reference
CREATE INDEX IF NOT EXISTS idx_orders_paystack_reference ON orders(paystack_reference);

-- =====================================================
-- 5. CREATE TRIGGER FOR PAYMENTS UPDATED_AT
-- =====================================================
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. LOG MIGRATION COMPLETION
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Paystack payments table created successfully';
    RAISE NOTICE 'Orders table updated with Paystack fields';
    RAISE NOTICE 'All RLS policies and indexes created';
    RAISE NOTICE 'Ready for Paystack integration';
END $$;