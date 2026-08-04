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
  global: {
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
  },
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

  let confirmedEmails: string[] = [];

  // 1. Primary strategy: Supabase GoTrue Admin API
  const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();

  if (!listError && usersData?.users) {
    const allUsers = usersData.users;
    console.log(`Found ${allUsers.length} total user account(s) via GoTrue Admin API.`);
    confirmedEmails = allUsers
      .filter((u) => u.email && Boolean(u.email_confirmed_at))
      .map((u) => u.email!);
  } else {
    console.warn("⚠️ GoTrue Admin API unavailable. Falling back to DB RPC (get_beta_tester_emails)...");
    const { data: rpcData, error: rpcError } = await adminClient.rpc('get_beta_tester_emails');

    if (rpcError || !rpcData) {
      console.error("❌ Failed to fetch user emails via RPC fallback:", rpcError?.message || "No data");
      process.exit(1);
    }

    confirmedEmails = (rpcData as Array<{ email: string }>).map((row) => row.email);
  }

  console.log(`Found ${confirmedEmails.length} user(s) with confirmed emails.\n`);

  if (confirmedEmails.length === 0) {
    console.log("⚠️ No confirmed email users found to process.");
    process.exit(0);
  }

  let successCount = 0;
  let failureCount = 0;
  const failureDetails: Array<{ email: string; error: string }> = [];

  // 3. Process each confirmed user idempotently
  for (let i = 0; i < confirmedEmails.length; i++) {
    const email = confirmedEmails[i];

    console.log(`[${i + 1}/${confirmedEmails.length}] Processing ${email}...`);

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
    if (i < confirmedEmails.length - 1) {
      await delay(1000);
    }
  }

  // 4. Print Summary Report
  console.log("\n========================================");
  console.log("📊 BETA AUTH EMAIL TEST SUMMARY");
  console.log("========================================");
  console.log(`Confirmed email users   : ${confirmedEmails.length}`);
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
