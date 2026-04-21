# OyaPlan Deployment Checklist

Follow these steps to deploy OyaPlan to production on Vercel.

## 1. Supabase Setup
- Create a new Supabase project.
- Go to the **SQL Editor** in the Supabase dashboard.
- Run all migrations found in the `supabase/migrations/` directory in order:
  1. `0001_initial_schema.sql`
  2. `0002_plan_requests.sql`
  3. `0003_shared_plans.sql`
  4. `0004_tester_feedback.sql`
  5. Apply any additional RLS hardening (refer to Phase 6 notes if not already in migrations).
- Ensure **Row Level Security (RLS)** is enabled on all tables.

## 2. GitHub Connection
- Push your code to a GitHub repository.
- Connect the repository to a new project on **Vercel**.

## 3. Environment Variables
Add the following keys to your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Project Anon Key.
- `ADMIN_KEY`: A secret string of your choice (e.g., a UUID or long random string) to access the `/admin` dashboard.

## 4. Vercel Configuration
- Framework Preset: **Next.js**.
- Build Command: `npm run build`.
- Root Directory: `./`.
- Ensure `vercel.json` exists in your root with `cleanUrls: true`.

## 5. Final Verification
- Deploy the project.
- Visit the production URL.
- Run one plan from the landing page to verify the **Matching Engine**.
- Share a plan to verify the **WhatsApp Deep Link**.
- Check the `/admin?key=YOUR_ADMIN_KEY` page to ensure data is logging correctly.

**OyaPlan is now live. Stop the group chat wahala!**
