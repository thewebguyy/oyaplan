# OyaPlan Deployment Checklist

Follow these steps to deploy OyaPlan to production on Vercel.

## 1. Supabase Setup
- Create a new Supabase project.
- Go to the **SQL Editor** in the Supabase dashboard.
- Run all migrations found in the `supabase/migrations/` directory **in numeric order** (currently `0001` through the highest-numbered file present — check the directory rather than hardcoding a list here, it grows with every schema change).
- Ensure **Row Level Security (RLS)** is enabled on all tables (every migration that creates a table also enables RLS in the same file — see `CLAUDE.md`'s migration rules).
- Create one admin user under **Authentication → Users → Invite user** — this is the account used to sign in at `/admin/login` (see `docs/decisions/0001-standardize-on-supabase-auth.md`).

## 2. GitHub Connection
- Push your code to a GitHub repository.
- Connect the repository to a new project on **Vercel**.

## 3. Environment Variables
Add the following keys to your Vercel project settings (see `.env.example` for the full annotated list):
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Project Anon Key.
- `KV_REST_API_URL` / `KV_REST_API_TOKEN`: Vercel KV credentials backing rate limiting. Rate limiting **fails closed in production** if these are missing — all requests to anonymous-write routes will be blocked.
- Optional: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` for error monitoring.

`ADMIN_KEY` is deprecated and no longer used for authentication — the admin dashboard uses Supabase Auth session cookies via `/admin/login`. Do not set it as a security control.

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
- Sign in at `/admin/login` with the admin user created in Step 1 to confirm data is logging correctly.

**OyaPlan is now live. Stop the group chat wahala!**
