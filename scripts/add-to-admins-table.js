const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🚀 Adding admin user to admins table...');

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addAdminToTable() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    
    // Check if admin already exists in admins table
    console.log('1. Checking if admin exists in admins table...');
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('email')
      .eq('email', adminEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking admins table:', checkError);
      return;
    }

    if (existingAdmin) {
      console.log('✅ Admin user already exists in admins table');
      return;
    }

    // Add admin to admins table
    console.log('2. Adding admin user to admins table...');
    const { data, error } = await supabase
      .from('admins')
      .insert([{ email: adminEmail }])
      .select();

    if (error) {
      console.error('❌ Error adding admin to admins table:', error);
      return;
    }

    console.log('✅ Admin user added successfully to admins table:', data[0]);

    // Verify the addition
    console.log('3. Verifying admin was added...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying admin:', verifyError);
    } else {
      console.log('✅ Verification successful:', verifyData);
      console.log('🎉 Admin user is now properly configured in both tables!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addAdminToTable();