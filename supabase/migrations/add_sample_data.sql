-- Add sample customer profiles for dashboard testing
INSERT INTO customer_profiles (id, email, first_name, last_name, phone, address, city, postal_code, country, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'john.doe@example.com', 'John', 'Doe', '+1234567890', '123 Main St', 'New York', '10001', 'USA', now(), now()),
  (gen_random_uuid(), 'jane.smith@example.com', 'Jane', 'Smith', '+1987654321', '456 Oak Ave', 'Los Angeles', '90210', 'USA', now(), now()),
  (gen_random_uuid(), 'mike.johnson@example.com', 'Mike', 'Johnson', '+1555123456', '789 Pine Rd', 'Chicago', '60601', 'USA', now(), now());

-- Add sample orders with varying statuses and amounts
INSERT INTO orders (id, customer_id, order_number, status, total_amount, currency, payment_status, payment_method, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  cp.id,
  'ORD-' || LPAD((ROW_NUMBER() OVER())::text, 6, '0'),
  CASE 
    WHEN ROW_NUMBER() OVER() % 4 = 0 THEN 'pending'
    WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'completed'
    WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'shipped'
    ELSE 'delivered'
  END,
  CASE 
    WHEN ROW_NUMBER() OVER() % 3 = 0 THEN 299.99
    WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 149.50
    ELSE 89.99
  END,
  'USD',
  CASE 
    WHEN ROW_NUMBER() OVER() % 3 = 0 THEN 'completed'
    ELSE 'pending'
  END,
  'credit_card',
  now() - INTERVAL '1 day' * (ROW_NUMBER() OVER()),
  now()
FROM customer_profiles cp
CROSS JOIN generate_series(1, 2) -- Create 2 orders per customer (6 total orders)
LIMIT 6;

-- Add sample order items linking orders to products
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, created_at)
SELECT 
  gen_random_uuid(),
  o.id,
  p.id,
  CASE WHEN random() > 0.5 THEN 1 ELSE 2 END, -- Random quantity 1 or 2
  p.price,
  o.created_at
FROM orders o
CROSS JOIN products p
WHERE random() > 0.3 -- Randomly include products in orders
LIMIT 12; -- Limit to reasonable number of order items