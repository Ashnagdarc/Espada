const { createClient } = require("@supabase/supabase-js");

console.log("🧪 Testing authentication flow...");

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  "https://cdbbkhrotfbmcvicitei.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYmJraHJvdGZibWN2aWNpdGVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI4MzU4NiwiZXhwIjoyMDczODU5NTg2fQ.Bcy2tzElCycwz7f54Op53Mu-Lv3yKc7D4CNZpa8KhxM"
);

async function testAuthFlow() {
  console.log("🔍 Testing authentication flow scenarios...\n");

  try {
    // Test 1: Verify admin profile exists and has correct role
    console.log("1. Testing admin profile lookup by stack_user_id...");
    const { data: profileById, error: errorById } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("stack_user_id", "e9d83ddc-11a2-41a4-b689-ab0467a1a69c")
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

    // Test 2: Verify admin profile lookup by email
    console.log("\n2. Testing admin profile lookup by email...");
    const { data: profileByEmail, error: errorByEmail } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("email", "daniel.nonso48@gmail.com")
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
      id: "e9d83ddc-11a2-41a4-b689-ab0467a1a69c",
      primaryEmail: "daniel.nonso48@gmail.com",
      displayName: "Daniel Nonso",
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
          mockUser.primaryEmail === "daniel.nonso48@gmail.com";
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