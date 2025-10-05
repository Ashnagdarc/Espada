-- Update test product with working image URL
UPDATE products 
SET images = '["https://picsum.photos/300/300?random=1"]'::jsonb
WHERE name = 'Test Product';