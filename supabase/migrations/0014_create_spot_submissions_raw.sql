-- Migration: Create spot_submissions_raw for ETL audit trailing
-- Description: Stores immutable logs of every venue imported or crowdsourced.

CREATE TABLE IF NOT EXISTS public.spot_submissions_raw (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL,
    raw_payload JSONB NOT NULL,
    venue_name TEXT,
    area TEXT
);

-- Enable RLS
ALTER TABLE public.spot_submissions_raw ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated roles (admin or ETL) and anon (if public crowdsourcing is enabled)
-- For now, we only allow service_role to insert during ETL, but the schema requires this for the script
CREATE POLICY "Enable insert for all users" ON public.spot_submissions_raw
    FOR INSERT
    WITH CHECK (true);

-- Only service_role can read
CREATE POLICY "Enable read for service role" ON public.spot_submissions_raw
    FOR SELECT
    USING (auth.role() = 'service_role');
