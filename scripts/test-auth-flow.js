const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

console.log("🧪 Testing authentication flow...");

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAuthFlow() {
  console.log("🔍 Testing authentication flow scenarios...\n");

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminStackUserId = process.env.ADMIN_STACK_USER_ID || 'e9d83ddc-11a2-41a4-b689-ab0467a1a69c';
    
    // Test 1: Verify admin profile exists and has correct role
    console.log("1. Testing admin profile lookup by stack_user_id...");
    const { data: profileById, error: errorById } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("stack_user_id", adminStackUserId)
      .single();

    if (profileById) {
      console.log("✅ Profile found by stack_user_id:", {
        email: profileById.email,
        role: profileById.role,
        stack_user_id: profileById.stack_user_id,
      });
    } else {
      console.log("❌ No profile found by stack_user_id");
    }

    // Test 2: Verify admin profile exists by email
    console.log("\n2. Testing admin profile lookup by email...");
    const { data: profileByEmail, error: errorByEmail } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("email", adminEmail)
      .single();

    if (profileByEmail) {
      console.log("✅ Profile found by email:", {
        email: profileByEmail.email,
        role: profileByEmail.role,
        stack_user_id: profileByEmail.stack_user_id,
      });
    } else {
      console.log("❌ No profile found by email");
    }

    // Test 3: Simulate the authentication context logic
    console.log("\n3. Simulating authentication context logic...");

    // Simulate user object from Stack Auth
    const mockUser = {
      id: adminStackUserId,
      primaryEmail: adminEmail,
      displayName: process.env.ADMIN_DISPLAY_NAME || "Admin User",
    };

    console.log("Mock user:", mockUser);

    // Test profile fetch by stack_user_id (primary lookup)
    const { data: primaryLookup, error: primaryError } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("stack_user_id", mockUser.id)
      .single();

    if (primaryLookup) {
      console.log("✅ Primary lookup successful:", {
        role: primaryLookup.role,
        shouldRedirectToAdmin: primaryLookup.role === "admin",
      });
    } else if (primaryError?.code === "PGRST116") {
      console.log("⚠️ No profile found by stack_user_id, checking by email...");

      // Test email-based lookup (fallback)
      const { data: emailLookup, error: emailError } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("email", mockUser.primaryEmail)
        .single();

      if (emailLookup) {
        console.log("✅ Email lookup successful:", {
          role: emailLookup.role,
          shouldRedirectToAdmin: emailLookup.role === "admin",
        });

        // Simulate updating stack_user_id
        console.log("🔄 Would update stack_user_id for existing profile");
      } else {
        console.log("⚠️ No profile found by email, would create new profile");

        // Simulate admin email check
        const isAdminEmail =
          mockUser.primaryEmail === adminEmail;
        const defaultRole = isAdminEmail ? "admin" : "customer";

        console.log("🆕 Would create new profile with role:", defaultRole);
      }
    }

    // Test 4: Verify redirect logic
    console.log("\n4. Testing redirect logic...");
    const testProfile = profileById || profileByEmail;

    if (testProfile) {
      if (testProfile.role === "admin") {
        console.log("✅ Admin user detected - should redirect to /admin");
      } else {
        console.log(
          "👤 Regular user - should redirect to /account or specified destination"
        );
      }
    }

    console.log("\n🎉 Authentication flow test completed successfully!");
  } catch (error) {
    console.error("❌ Error in authentication flow test:", error);
  }
}

// Run the test
testAuthFlow().catch(console.error);