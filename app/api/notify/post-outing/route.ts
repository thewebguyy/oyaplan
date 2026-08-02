import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { captureServerException } from "@/lib/sentry";
import { Resend } from "resend";

/**
 * POST-OUTING SPEND NOTIFICATION
 *
 * Cron route: triggers 2–3 days after a shared plan is created.
 * Finds plans where the user is authenticated (has a user_id) and
 * hasn't already been notified, then sends a spend capture email.
 *
 * SECURITY:
 * - Requires CRON_SECRET header to prevent public invocation
 * - Uses SUPABASE_SERVICE_ROLE_KEY to read auth.users email addresses
 *   (the anon key cannot access auth.users)
 *
 * IDEMPOTENCY:
 * - Inserts into notification_log with a unique (plan_id, type) constraint
 * - Safe to run multiple times — duplicate sends are blocked at DB level
 *
 * TO INVOKE:
 *   curl -X POST https://oyaplan.vercel.app/api/notify/post-outing \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 * ADD TO vercel.json:
 *   { "crons": [{ "path": "/api/notify/post-outing", "schedule": "0 10 * * *" }] }
 */

const NOTIFICATION_TYPE = "post_outing_spend_request";

export async function POST(req: NextRequest) {
  // Authenticate the cron caller
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    // In development without CRON_SECRET, allow localhost callers only
    const host = req.headers.get("host") || "";
    if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }
  } else if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // Service role key not configured yet — skip silently in dev
    // Log prominently so we know this needs to be set up
    console.warn(
      "[post-outing] SUPABASE_SERVICE_ROLE_KEY not set — notification skipped. " +
        "Add it to your environment to enable post-outing emails."
    );
    return NextResponse.json(
      { skipped: true, reason: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 200 }
    );
  }

  // Service role client — can read auth.users
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Window: plans created 2–4 days ago (gives overlap so we don't miss the 3-day mark)
  const fourDaysAgo = new Date();
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  try {
    // Find plans in the notification window with an authenticated user
    const { data: plans, error: planError } = await adminClient
      .from("shared_plans")
      .select("id, user_id, spot:spots(name), total_cost")
      .gte("created_at", fourDaysAgo.toISOString())
      .lte("created_at", twoDaysAgo.toISOString())
      .not("user_id", "is", null);

    if (planError) {
      captureServerException(new Error(`post-outing query failed: ${planError.message}`));
      return NextResponse.json({ error: planError.message }, { status: 500 });
    }

    if (!plans || plans.length === 0) {
      return NextResponse.json({ sent: 0, skipped: 0, message: "No plans in window" });
    }

    let sent = 0;
    let skipped = 0;

    for (const plan of plans) {
      try {
        // Check if we already sent this notification (idempotency guard)
        const { data: existing } = await adminClient
          .from("notification_log")
          .select("id")
          .eq("plan_id", plan.id)
          .eq("type", NOTIFICATION_TYPE)
          .maybeSingle();

        if (existing) {
          skipped++;
          continue;
        }

        // Get the user's email from auth.users
        const { data: userData } = await adminClient.auth.admin.getUserById(plan.user_id as string);
        const email = userData?.user?.email;

        if (!email) {
          skipped++;
          continue;
        }

        const spotName =
          plan.spot && !Array.isArray(plan.spot)
            ? (plan.spot as { name: string }).name
            : Array.isArray(plan.spot) && plan.spot.length > 0
            ? (plan.spot[0] as { name: string }).name
            : "your spot";

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oyaplan.vercel.app";
        const feedbackUrl = `${appUrl}/plan/${plan.id}?feedback=true`;

        // Send email via Supabase Edge Function or direct SMTP
        // Using Supabase's built-in email for now (requires Pro plan for custom templates)
        // For a richer email, swap this with Resend/Postmark using RESEND_API_KEY
        const emailBody = buildEmailHtml({
          spotName,
          estimatedTotal: plan.total_cost as number,
          feedbackUrl,
        });

        let emailError = null;

        if (process.env.RESEND_API_KEY) {
          // Send directly via Resend (Production Standard)
          const resend = new Resend(process.env.RESEND_API_KEY);
          const { error } = await resend.emails.send({
            from: 'OyaPlan <notifications@oyaplan.com>',
            to: email,
            subject: `How did ${spotName} go? 🍽️`,
            html: emailBody,
          });
          if (error) {
            emailError = { message: error.message };
          }
        } else {
          // Fallback to Supabase Edge Function to prevent breaking production
          // before RESEND_API_KEY is configured in the environment.
          const { error } = await adminClient.functions.invoke("send-email", {
            body: {
              to: email,
              subject: `How did ${spotName} go? 🍽️`,
              html: emailBody,
            },
          });
          emailError = error;
        }

        if (emailError) {
          // Log but don't fail — still record in notification_log so we don't retry spam
          console.error(`[post-outing] Email send failed for plan ${plan.id}:`, emailError.message);
        }

        // Record in log regardless of email success (prevents retry spam)
        await adminClient.from("notification_log").insert({
          plan_id: plan.id,
          user_id: plan.user_id,
          type: NOTIFICATION_TYPE,
          sent_to: email,
        });

        sent++;
      } catch (planErr) {
        captureServerException(planErr);
        skipped++;
      }
    }

    return NextResponse.json({ sent, skipped, total: plans.length });
  } catch (e) {
    captureServerException(e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

function buildEmailHtml({
  spotName,
  estimatedTotal,
  feedbackUrl,
}: {
  spotName: string;
  estimatedTotal: number;
  feedbackUrl: string;
}): string {
  const estimate = `₦${estimatedTotal.toLocaleString("en-NG")}`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>How was your outing?</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #E5E7EB;">
        <!-- Header -->
        <tr>
          <td style="background:#008751;padding:28px 32px;">
            <p style="margin:0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:2px;">OyaPlan</p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.3;">
              How did ${spotName} go? 🍽️
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
              We estimated <strong>${estimate}</strong> for your squad at ${spotName}. Did we get it right?
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#6B7280;line-height:1.6;">
              Tell us what you actually spent — it takes 10 seconds and makes future estimates better for every Lagos squad. Your number is anonymous.
            </p>
            <a href="${feedbackUrl}" 
               style="display:block;background:#008751;color:#ffffff;text-decoration:none;text-align:center;padding:16px 24px;border-radius:12px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">
              Tell Us What You Spent →
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #F3F4F6;">
            <p style="margin:0;font-size:11px;color:#9CA3AF;">
              This is a one-time email. We will not send you any further notifications unless you plan another outing.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
