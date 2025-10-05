-- Insert admin user into admins table
INSERT INTO public.admins (email, first_name, last_name)
VALUES ('daniel.nonso48@gmail.com', 'Daniel', 'Nonso')
ON CONFLICT (email) DO NOTHING;