const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Checking RLS policies...');

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  'https://cdbbkhrotfbmcvicitei.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYmJraHJvdGZibWN2aWNpdGVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI4MzU4NiwiZXhwIjoyMDczODU5NTg2fQ.Bcy2tzElCycwz7f54Op53Mu-Lv3yKc7D4CNZpa8KhxM'
);

async function checkPolicies() {
  console.log('🚀 Starting policy check...');
  try {
    // Test if anon key can read the table
    console.log('🧪 Testing anon key access...');
    const anonSupabase = createClient(
      'https://cdbbkhrotfbmcvicitei.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYmJraHJvdGZibWN2aWNpdGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODM1ODYsImV4cCI6MjA3Mzg1OTU4Nn0.vUxqTD92AX_ESFzDbWJZBt_79hKuEZKk7zyy8e37Q1Y'
    );

    const { data: anonData, error: anonError } = await anonSupabase
      .from('customer_profiles')
      .select('*')
      .eq('email', 'daniel.nonso48@gmail.com')
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