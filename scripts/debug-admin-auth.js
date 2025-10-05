const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAdminAuth() {
  console.log('🔍 Debugging admin authentication...');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  
  try {
    // Check if admin exists in admins table
    console.log('🔍 Checking admins table for:', adminEmail);
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', adminEmail);
    
    console.log('📊 Admin query result:', { adminData, adminError });
    
    if (adminData && adminData.length > 0) {
      console.log('✅ Admin user found in database:', adminData[0]);
    } else {
      console.log('❌ Admin user not found in database');
      
      // Create admin user
      console.log('🆕 Creating admin user...');
      const { data: newAdmin, error: createError } = await supabase
        .from('admins')
        .insert([
          {
            email: adminEmail,
            first_name: 'Daniel',
            last_name: 'Nonso',
            role: 'admin',
            permissions: {
              orders: true,
              products: true,
              customers: true,
              dashboard: true
            }
          }
        ])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating admin:', createError);
      } else {
        console.log('✅ Admin user created:', newAdmin);
      }
    }
    
    // Check if user exists in auth.users
    console.log('🔍 Checking auth.users for:', adminEmail);
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
    } else {
      const adminAuthUser = authUsers.users.find(user => user.email === adminEmail);
      if (adminAuthUser) {
        console.log('✅ Admin auth user found:', {
          id: adminAuthUser.id,
          email: adminAuthUser.email,
          email_confirmed_at: adminAuthUser.email_confirmed_at,
          created_at: adminAuthUser.created_at
        });
      } else {
        console.log('❌ Admin auth user not found');
        
        // Create auth user
        console.log('🆕 Creating auth user...');
        const tempPassword = process.env.ADMIN_TEMP_PASSWORD || 'TempPassword123!';
        console.log('⚠️  Using temporary password. Please change after first login.');
        const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
          email: adminEmail,
          password: tempPassword,
          email_confirm: true
        });
        
        if (createAuthError) {
          console.error('❌ Error creating auth user:', createAuthError);
        } else {
          console.log('✅ Auth user created:', newAuthUser);
        }
      }
    }