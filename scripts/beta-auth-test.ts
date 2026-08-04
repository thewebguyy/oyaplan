import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
  console.error("❌ Missing environment variables.");
  if (!supabaseUrl) console.error("   - NEXT_PUBLIC_SUPABASE_URL is missing.");
  if (!supabaseAnonKey) console.error("   - NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  if (!serviceRoleKey) console.error("   - SUPABASE_SERVICE_ROLE_KEY is missing in .env.local.");
  console.error("\nPlease add SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret> to your .env.local file and re-run.");
  process.exit(1);
}

// Admin client to list users from auth.users
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Public client to trigger production auth emails (signInWithOtp triggers Supabase -> Resend email dispatch)
const publicClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oyaplan.app";
const redirectTo = `${appUrl}/api/auth/callback`;

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🚀 Starting Automated Beta Auth Pipeline Test...");
  console.log(`Target URL: ${supabaseUrl}`);
  console.log(`Redirect Callback: ${redirectTo}\n`);

  // 1. Fetch all users via Supabase Admin API
  const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError || !usersData?.users) {
    console.error("❌ Failed to fetch user list from Supabase Admin API:", listError?.message || "No data");
    process.exit(1);
  }

  const allUsers = usersData.users;
  console.log(`Found ${allUsers.length} total user account(s) in auth.users.`);

  // 2. Filter for users with confirmed emails
  const confirmedUsers = allUsers.filter(
    (u) => u.email && Boolean(u.email_confirmed_at)
  );

  console.log(`Filtered to ${confirmedUsers.length} user(s) with confirmed emails.\n`);

  if (confirmedUsers.length === 0) {
    console.log("⚠️ No confirmed email users found to process.");
    process.exit(0);
  }

  let successCount = 0;
  let failureCount = 0;
  const failureDetails: Array<{ email: string; error: string }> = [];

  // 3. Process each confirmed user idempotently
  for (let i = 0; i < confirmedUsers.length; i++) {
    const user = confirmedUsers[i];
    const email = user.email!;

    console.log(`[${i + 1}/${confirmedUsers.length}] Processing ${email}...`);

    try {
      const { error: otpError } = await publicClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (otpError) {
        console.error(`  ❌ Failed: ${otpError.message}`);
        failureCount++;
        failureDetails.push({ email, error: otpError.message });
      } else {
        console.log(`  ✅ Auth email triggered for ${email}`);
        successCount++;
      }
    } catch (err: any) {
      const msg = err.message || "Unknown error";
      console.error(`  ❌ Exception: ${msg}`);
      failureCount++;
      failureDetails.push({ email, error: msg });
    }

    // 1 second delay between requests to avoid rate limits
    if (i < confirmedUsers.length - 1) {
      await delay(1000);
    }
  }

  // 4. Print Summary Report
  console.log("\n========================================");
  console.log("📊 BETA AUTH EMAIL TEST SUMMARY");
  console.log("========================================");
  console.log(`Total users in database : ${allUsers.length}`);
  console.log(`Confirmed email users   : ${confirmedUsers.length}`);
  console.log(`Successfully sent       : ${successCount}`);
  console.log(`Failed                  : ${failureCount}`);

  if (failureDetails.length > 0) {
    console.log("\nFailure Breakdown:");
    failureDetails.forEach((f) => {
      console.log(`  - ${f.email}: ${f.error}`);
    });
  }

  console.log("========================================\n");
}

main().catch((err) => {
  console.error("💥 Fatal script error:", err);
  process.exit(1);
});
