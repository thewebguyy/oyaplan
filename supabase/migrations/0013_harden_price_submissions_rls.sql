-- Migration 0013: Harden price_submissions RLS policies
--
-- Previous policy allowed ANY authenticated user to UPDATE price_submissions.
-- This migration restricts UPDATE to service_role only (admin operations).
--
-- Security: Only the application backend (via supabase-js server client with auth)
-- can update moderation fields. Verified via serverClient.auth.getUser().

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Admins can review submissions" ON price_submissions;

-- New policy: Only service role can update (enforced via app-layer identity check)
-- The application layer (moderatePriceSubmission.ts) verifies the user is authenticated
-- and extracts their ID server-side. RLS here just enforces the blanket rule.
CREATE POLICY "Only service role can update moderation fields"
  ON price_submissions
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Note: The public/authenticated role cannot UPDATE at all now.
-- Moderation only happens through Server Actions that use createServerClient(),
-- which uses the service_role key with explicit admin identity verification.
