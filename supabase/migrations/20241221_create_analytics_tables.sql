-- =====================================================
-- ANALYTICS TABLES MIGRATION
-- =====================================================
-- This migration creates analytics tables for real-time
-- dashboard data instead of calculated mock data
-- =====================================================

-- Create daily_analytics table for aggregated daily metrics
CREATE TABLE IF NOT EXISTS daily_analytics (
  date DATE PRIMARY KEY,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  unique_customers INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_analytics table for product performance tracking
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, date)
);

-- Create customer_analytics table for customer behavior tracking
CREATE TABLE IF NOT EXISTS customer_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sessions INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, date)
);

-- Create indexes for analytics performance
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_product_analytics_date ON product_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_date ON customer_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_customer_id ON customer_analytics(customer_id);

-- Enable RLS for analytics tables
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only admins can access analytics
CREATE POLICY "Admin access to daily analytics" ON daily_analytics 
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.auth_user_id = auth.uid() 
            AND cp.role = 'admin'
        )
    );

CREATE POLICY "Admin access to product analytics" ON product_analytics 
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.auth_user_id = auth.uid() 
            AND cp.role = 'admin'
        )
    );

CREATE POLICY "Admin access to customer analytics" ON customer_analytics 
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.auth_user_id = auth.uid() 
            AND cp.role = 'admin'
        )
    );

-- Grant permissions to authenticated role
GRANT ALL PRIVILEGES ON daily_analytics TO authenticated;
GRANT ALL PRIVILEGES ON product_analytics TO authenticated;
GRANT ALL PRIVILEGES ON customer_analytics TO authenticated;

-- Create function to update customer statistics
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer statistics when order status changes to completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE customer_profiles 
        SET 
            total_orders = total_orders + 1,
            total_spent = total_spent + NEW.total_amount,
            last_order_date = NEW.updated_at
        WHERE id = NEW.customer_id;
    END IF;
    
    -- Update statistics when order is cancelled
    IF NEW.status = 'cancelled' AND OLD.status = 'completed' THEN
        UPDATE customer_profiles 
        SET 
            total_orders = GREATEST(total_orders - 1, 0),
            total_spent = GREATEST(total_spent - NEW.total_amount, 0.00)
        WHERE id = NEW.customer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS TRIGGER AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    order_total DECIMAL(10,2);
    customer_count INTEGER;
    new_customer_count INTEGER;
    avg_order_value DECIMAL(10,2);
BEGIN
    -- Calculate daily metrics
    SELECT 
        COUNT(*),
        COALESCE(SUM(total_amount), 0),
        COUNT(DISTINCT customer_id)
    INTO 
        customer_count,
        order_total,
        customer_count
    FROM orders 
    WHERE DATE(created_at) = today_date 
    AND status = 'completed';
    
    -- Count new customers today
    SELECT COUNT(*) INTO new_customer_count
    FROM customer_profiles 
    WHERE DATE(created_at) = today_date;
    
    -- Calculate average order value
    SELECT COALESCE(AVG(total_amount), 0) INTO avg_order_value
    FROM orders 
    WHERE DATE(created_at) = today_date 
    AND status = 'completed';
    
    -- Upsert daily analytics
    INSERT INTO daily_analytics (
        date, 
        total_orders, 
        total_revenue, 
        unique_customers, 
        new_customers, 
        average_order_value
    ) VALUES (
        today_date,
        customer_count,
        order_total,
        customer_count,
        new_customer_count,
        avg_order_value
    )
    ON CONFLICT (date) DO UPDATE SET
        total_orders = EXCLUDED.total_orders,
        total_revenue = EXCLUDED.total_revenue,
        unique_customers = EXCLUDED.unique_customers,
        new_customers = EXCLUDED.new_customers,
        average_order_value = EXCLUDED.average_order_value;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update analytics
CREATE TRIGGER trigger_update_daily_analytics_on_order
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_analytics();

CREATE TRIGGER trigger_update_daily_analytics_on_customer
    AFTER INSERT ON customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_analytics();

-- Create function to update product analytics
CREATE OR REPLACE FUNCTION update_product_analytics()
RETURNS TRIGGER AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    item RECORD;
BEGIN
    -- Update product analytics for each item in the order
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        FOR item IN 
            SELECT product_id, quantity, price 
            FROM order_items 
            WHERE order_id = NEW.id
        LOOP
            INSERT INTO product_analytics (product_id, date, orders, revenue)
            VALUES (item.product_id, today_date, item.quantity, item.price * item.quantity)
            ON CONFLICT (product_id, date) DO UPDATE SET
                orders = product_analytics.orders + EXCLUDED.orders,
                revenue = product_analytics.revenue + EXCLUDED.revenue;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product analytics
CREATE TRIGGER trigger_update_product_analytics
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_product_analytics();

-- Insert initial analytics data for current date
INSERT INTO daily_analytics (date, total_orders, total_revenue, unique_customers, new_customers, average_order_value)
SELECT 
    CURRENT_DATE,
    COUNT(*) as total_orders,
    COALESCE(SUM(total_amount), 0) as total_revenue,
    COUNT(DISTINCT customer_id) as unique_customers,
    0 as new_customers,
    COALESCE(AVG(total_amount), 0) as average_order_value
FROM orders 
WHERE DATE(created_at) = CURRENT_DATE 
AND status = 'completed'
ON CONFLICT (date) DO NOTHING;