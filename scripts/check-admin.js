const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    console.log(`Checking for admin user: ${adminEmail}...`);
    
    // Check admin profile in Supabase
    const { data: admins, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', adminEmail);

    if (adminError) {
      console.error('Error checking admin profile:', adminError);
      return;
    }

    console.log('Admin profiles found:', admins);

    // Check auth users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error checking auth users:', authError);
      return;
    }

    const targetUser = authUsers.users.find(user => user.email === adminEmail);
    console.log('Auth user found:', targetUser ? 'Yes' : 'No');
    if (targetUser) {
      console.log('Auth user details:', {
        id: targetUser.id,
        email: targetUser.email,
        email_confirmed_at: targetUser.email_confirmed_at,
        created_at: targetUser.created_at
      });
    }

  } catch (error) {
    console.error('Error checking admin user:', error);
  }
}

checkAdminUser();
    