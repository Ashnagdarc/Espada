const main = async () => {
  const [{ createClient }, { config }] = await Promise.all([
    import('@supabase/supabase-js'),
    import('dotenv')
  ]);

  config();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are not configured.');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const targetEmail = process.env.ADMIN_EMAIL || 'daniel.nonso48@gmail.com';

  console.log(`🔍 Checking for admin user: ${targetEmail}`);

  // Get all profiles with this email
  const { data: profiles, error } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('email', targetEmail);

  if (error) {
    console.error('❌ Error fetching profiles:', error);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log('❌ No profiles found for admin user');
    return;
  }

  console.log(`📊 Found ${profiles.length} profiles for this email`);

  // Show all profiles
  profiles.forEach((profile, index) => {
    console.log(`Profile ${index + 1}:`, {
      id: profile.id,
      stack_user_id: profile.stack_user_id,
      email: profile.email,
      role: profile.role,
      created_at: profile.created_at
    });
  });

  if (profiles.length > 1) {
    console.log('🧹 Multiple profiles found, cleaning up duplicates...');

    // Keep the one with admin role, or the first one if none have admin role
    const adminProfile = profiles.find(p => p.role === 'admin') || profiles[0];
    const profilesToDelete = profiles.filter(p => p.id !== adminProfile.id);

    console.log(`✅ Keeping profile: ${adminProfile.id} (role: ${adminProfile.role})`);

    for (const profile of profilesToDelete) {
      console.log(`🗑️ Deleting duplicate profile: ${profile.id}`);
      const { error: deleteError } = await supabase
        .from('customer_profiles')
        .delete()
        .eq('id', profile.id);

      if (deleteError) {
        console.error(`❌ Error deleting profile ${profile.id}:`, deleteError);
      } else {
        console.log(`✅ Deleted profile ${profile.id}`);
      }
    }

    // Ensure the remaining profile has admin role
    if (adminProfile.role !== 'admin') {
      console.log('🔄 Updating profile role to admin...');
      const { error: updateError } = await supabase
        .from('customer_profiles')
        .update({ role: 'admin' })
        .eq('id', adminProfile.id);

      if (updateError) {
        console.error('❌ Error updating role:', updateError);
      } else {
        console.log('✅ Profile role updated to admin');
      }
    }
  } else {
    const profile = profiles[0];
    if (profile.role !== 'admin') {
      console.log('🔄 Updating profile role to admin...');
      const { error: updateError } = await supabase
        .from('customer_profiles')
        .update({ role: 'admin' })
        .eq('id', profile.id);

      if (updateError) {
        console.error('❌ Error updating role:', updateError);
      } else {
        console.log('✅ Profile role updated to admin');
      }
    } else {
      console.log('✅ Profile already has admin role');
    }
  }

  // Final verification
  console.log('\n🔍 Final verification...');
  const { data: finalProfile, error: finalError } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('email', targetEmail)
    .maybeSingle();

  if (finalError) {
    console.error('❌ Error in final verification:', finalError);
  } else {
    console.log('✅ Final profile state:', {
      id: finalProfile?.id,
      stack_user_id: finalProfile?.stack_user_id,
      email: finalProfile?.email,
      role: finalProfile?.role,
      first_name: finalProfile?.first_name,
      last_name: finalProfile?.last_name
    });

    if (finalProfile?.role === 'admin') {
      console.log('🎉 Admin user is properly configured!');
    } else {
      console.log('❌ Admin user role is still not correct');
    }
  }
};

main().catch(error => {
  console.error('❌ Unexpected error fixing admin user:', error);
});
