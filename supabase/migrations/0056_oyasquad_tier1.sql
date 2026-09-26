-- Migration 0056: OyaSquad Tier 1 Features
-- 1. Non-Custodial Split & Settle Bank Info
-- 2. Multi-Option Showdown Voting & Candidates

-- 1. plan_settlements: Host bank account details for 1-tap copy
CREATE TABLE IF NOT EXISTS public.plan_settlements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES public.shared_plans(id) ON DELETE CASCADE,
    bank_name       TEXT NOT NULL,
    account_number  TEXT NOT NULL,
    account_name    TEXT NOT NULL,
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_plan_settlement UNIQUE (plan_id),
    CONSTRAINT check_account_number_length CHECK (char_length(account_number) BETWEEN 8 AND 15)
);

-- 2. squad_options: Itinerary candidates for showdown voting
CREATE TABLE IF NOT EXISTS public.squad_options (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id            UUID NOT NULL REFERENCES public.shared_plans(id) ON DELETE CASCADE,
    spot_id            UUID REFERENCES public.spots(id) ON DELETE SET NULL,
    option_label       TEXT NOT NULL DEFAULT 'Option A',
    title              TEXT NOT NULL,
    category           TEXT DEFAULT 'Dining',
    estimated_per_person INTEGER NOT NULL,
    address            TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. squad_option_votes: 1-tap blind vote per participant token
CREATE TABLE IF NOT EXISTS public.squad_option_votes (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id            UUID NOT NULL REFERENCES public.shared_plans(id) ON DELETE CASCADE,
    option_id          UUID NOT NULL REFERENCES public.squad_options(id) ON DELETE CASCADE,
    participant_token  TEXT NOT NULL,
    voted_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_plan_participant_vote UNIQUE (plan_id, participant_token)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plan_settlements_plan ON public.plan_settlements(plan_id);
CREATE INDEX IF NOT EXISTS idx_squad_options_plan ON public.squad_options(plan_id);
CREATE INDEX IF NOT EXISTS idx_squad_option_votes_option ON public.squad_option_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_squad_option_votes_plan ON public.squad_option_votes(plan_id);

-- Enable RLS
ALTER TABLE public.plan_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_option_votes ENABLE ROW LEVEL SECURITY;

-- Settlements RLS: Public read, public upsert (tied to plan)
DROP POLICY IF EXISTS "Allow public read settlements" ON public.plan_settlements;
CREATE POLICY "Allow public read settlements" ON public.plan_settlements
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert settlements" ON public.plan_settlements;
CREATE POLICY "Allow public insert settlements" ON public.plan_settlements
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update settlements" ON public.plan_settlements;
CREATE POLICY "Allow public update settlements" ON public.plan_settlements
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Options RLS
DROP POLICY IF EXISTS "Allow public read squad options" ON public.squad_options;
CREATE POLICY "Allow public read squad options" ON public.squad_options
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert squad options" ON public.squad_options;
CREATE POLICY "Allow public insert squad options" ON public.squad_options
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Votes RLS
DROP POLICY IF EXISTS "Allow public read squad votes" ON public.squad_option_votes;
CREATE POLICY "Allow public read squad votes" ON public.squad_option_votes
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert squad votes" ON public.squad_option_votes;
CREATE POLICY "Allow public insert squad votes" ON public.squad_option_votes
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update squad votes" ON public.squad_option_votes;
CREATE POLICY "Allow public update squad votes" ON public.squad_option_votes
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);
