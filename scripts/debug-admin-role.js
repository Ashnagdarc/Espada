const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Starting debug script...');

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  'https://cdbbkhrotfbmcvicitei.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYmJraHJvdGZibWN2aWNpdGVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI4MzU4NiwiZXhwIjoyMDczODU5NTg2fQ.Bcy2tzElCycwz7f54Op53Mu-Lv3yKc7D4CNZpa8KhxM'
);

console.log('✅ Supabase client initialized');

async function debugAdminRole() {
  console.log('🔍 Debugging admin role for daniel.nonso48@gmail.com...\n');

  try {
    // 1. Check if user exists in customer_profiles table
    console.log('1. Checking customer_profiles table:');
    const { data: profiles, error: profileError } = await supabase
      .from('customer_profiles')
      .select('id, stack_user_id, email, first_name, last_name, role, created_at, updated_at')
      .eq('email', 'daniel.nonso48@gmail.com');

    if (profileError) {
      console.error('❌ Error querying customer_profiles:', profileError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ No profile found for daniel.nonso48@gmail.com');
      console.log('   This means the user has never been created in customer_profiles table');
      return;
    }

    console.log('✅ Profile found:');
    console.log(JSON.stringify(profiles[0], null, 2));

    const profile = profiles[0];
    
    // 2. Check the role specifically
    console.log('\n2. Role Analysis:');
    console.log(`   Current role: "${profile.role}"`);
    console.log(`   Is admin: ${profile.role === 'admin'}`);
    console.log(`   Role type: ${typeof profile.role}`);

    // 3. Check if there are multiple profiles (shouldn't be, but let's verify)
    if (profiles.length > 1) {
      console.log('\n⚠️  WARNING: Multiple profiles found for this email:');
      profiles.forEach((p, index) => {
        console.log(`   Profile ${index + 1}: role="${p.role}", id=${p.id}`);
      });
    }

    // 4. Check all profiles to see what roles exist
    console.log('\n3. All customer profiles in database:');
    const { data: allProfiles, error: allError } = await supabase
      .from('customer_profiles')
      .select('email, role, created_at')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error querying all profiles:', allError);
    } else {
      console.log(`   Total profiles: ${allProfiles.length}`);
      allProfiles.forEach(p => {
        console.log(`   ${p.email}: role="${p.role}"`);
      });
    }

    // 5. If role is not admin, let's fix it
    if (profile.role !== 'admin') {
      console.log('\n4. 🔧 Fixing admin role...');
      const { data: updateData, error: updateError } = await supabase
        .from('customer_profiles')
        .update({ role: 'admin' })
        .eq('email', 'daniel.nonso48@gmail.com')
        .select();

      if (updateError) {
        console.error('❌ Error updating role:', updateError);
      } else {
        console.log('✅ Role updated successfully:');
        console.log(JSON.stringify(updateData[0], null, 2));
      }
    } else {
      console.log('\n✅ Role is already set to admin - no update needed');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugAdminRole();