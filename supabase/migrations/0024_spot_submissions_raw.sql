-- Migration: 0024_spot_submissions_raw
-- Creates a simplified audit table for verifying venue data ingestion

CREATE TABLE spot_submissions_raw (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    raw_payload JSONB NOT NULL,
    venue_name TEXT,
    area TEXT,
    source_tweet_url TEXT,
    tweet_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE spot_submissions_raw ENABLE ROW LEVEL SECURITY;

-- Deny anon access
CREATE POLICY "Deny anon access to spot_submissions_raw"
    ON spot_submissions_raw
    FOR ALL
    TO anon
    USING (false);

-- Service role bypasses RLS automatically, which the import script will use.
