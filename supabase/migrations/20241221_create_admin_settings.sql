-- =====================================================
-- ADMIN SETTINGS TABLE MIGRATION
-- =====================================================
-- This migration creates the admin_settings table to store
-- all admin configuration data instead of hardcoded values
-- =====================================================

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL, -- 'general', 'notifications', 'security', 'appearance'
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_settings_category ON admin_settings(category);
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at 
    BEFORE UPDATE ON admin_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - only admins can access settings
CREATE POLICY "Admin full access to settings" ON admin_settings 
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM customer_profiles cp 
            WHERE cp.auth_user_id = auth.uid() 
            AND cp.role = 'admin'
        )
    );

-- Grant permissions to authenticated role
GRANT ALL PRIVILEGES ON admin_settings TO authenticated;

-- Insert initial admin settings data
INSERT INTO admin_settings (category, key, value) VALUES
('general', 'store_config', '{
    "storeName": "Espada Store",
    "storeDescription": "Premium fashion and accessories",
    "contactEmail": "admin@espada.com",
    "contactPhone": "+1 (555) 123-4567",
    "timezone": "America/New_York",
    "currency": "USD"
}'),
('notifications', 'preferences', '{
    "emailNotifications": true,
    "orderNotifications": true,
    "lowStockAlerts": true,
    "customerSignups": false
}'),
('security', 'policies', '{
    "twoFactorAuth": false,
    "sessionTimeout": 30,
    "passwordRequirements": true
}'),
('appearance', 'theme_config', '{
    "theme": "light",
    "primaryColor": "#3B82F6",
    "logoUrl": ""
}')
ON CONFLICT (category, key) DO NOTHING;