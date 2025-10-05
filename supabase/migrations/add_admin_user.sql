-- Add admin user for testing
INSERT INTO admins (email, first_name, last_name, role, permissions)
VALUES (
  'admin@espada.com',
  'Admin',
  'User',
  'admin',
  '{"orders": true, "products": true, "customers": true, "dashboard": true}'::jsonb
)
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  updated_at = now();