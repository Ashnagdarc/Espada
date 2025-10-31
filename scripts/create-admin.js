const main = async () => {
  const [{ createClient }, { config }] = await Promise.all([
    import('@supabase/supabase-js'),
    import('dotenv')
  ]);

  config();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Supabase URL:', supabaseUrl);
  console.log('Service Role Key exists:', Boolean(serviceRoleKey));

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase environment variables');
    return;
  }

  // Create Supabase admin client
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  console.log('Creating admin user in Supabase Auth...');

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-verify admin users
    });

    if (authError) {
      console.error('Error creating user in Supabase Auth:', authError);
      return;
    }

    console.log('Admin user created successfully in Supabase Auth!');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);
    console.log('Email confirmed:', authData.user.email_confirmed_at);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

void main();
