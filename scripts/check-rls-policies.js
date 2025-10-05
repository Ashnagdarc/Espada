const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Checking RLS policies...');

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPolicies() {
  console.log('🚀 Starting policy check...');
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    // Test if anon key can read the table
    console.log('🧪 Testing anon key access...');
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: anonData, error: anonError } = await anonSupabase
      .from('customer_profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (anonError) {
      console.log('❌ Anon key cannot read profile:', anonError.message);
      console.log('Error details:', anonError);
    } else {
      console.log('✅ Anon key can read profile:', anonData?.email);
    }

  } catch (error) {
    console.error('❌ Error in policy check:', error);
  }
}

checkPolicies().catch(console.error);