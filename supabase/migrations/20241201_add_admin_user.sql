-- Add admin user to admins table
INSERT INTO admins (email) 
VALUES ('daniel.nonso48@gmail.com')
ON CONFLICT (email) DO NOTHING;