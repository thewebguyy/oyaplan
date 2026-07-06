-- Migration: Add missing audit columns to spot_submissions_raw
-- Description: 0024_spot_submissions_raw.sql duplicated table creation for
-- spot_submissions_raw with a non-idempotent CREATE TABLE (no IF NOT EXISTS),
-- a different RLS policy, and two extra columns. 0014_create_spot_submissions_raw.sql
-- is the schema actually depended on: scripts/import-verified-venues.ts writes
-- exactly its column set (source, raw_payload, venue_name, area), and its
-- permissive insert policy is what lets that script's anon-key fallback path
-- (when SUPABASE_SERVICE_ROLE_KEY is unset) succeed. 0024 has been deleted;
-- this migration adds its two columns onto the real schema instead, idempotently.

ALTER TABLE public.spot_submissions_raw
    ADD COLUMN IF NOT EXISTS source_tweet_url TEXT,
    ADD COLUMN IF NOT EXISTS tweet_date DATE;
