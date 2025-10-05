-- Insert a test product for testing edit/delete functionality
INSERT INTO products (
  name,
  description,
  price,
  category,
  stock_quantity,
  images,
  colors,
  sizes,
  featured
) VALUES (
  'Test Product',
  'This is a test product for testing edit and delete functionality',
  29.99,
  'test',
  10,
  '["https://picsum.photos/300/300?random=1"]'::jsonb,
  '["Red", "Blue"]'::jsonb,
  '["S", "M", "L"]'::jsonb,
  false
) ON CONFLICT DO NOTHING;