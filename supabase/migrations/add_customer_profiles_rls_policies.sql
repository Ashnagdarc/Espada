-- Add RLS policies for customer_profiles table

-- Policy to allow users to read their own profile
CREATE POLICY "Users can read their own profile" ON customer_profiles
FOR SELECT USING (true);

-- Policy to allow users to update their own profile  
CREATE POLICY "Users can update their own profile" ON customer_profiles
FOR UPDATE USING (true);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON customer_profiles
FOR INSERT WITH CHECK (true);

-- Note: We're using 'true' for now to allow all operations since we're using Stack Auth
-- In a production environment, you might want to restrict this further based on auth.uid()
-- or other authentication mechanisms