-- Migration 0030: Squad Plan Voting
-- Allows squad members viewing a shared plan link to submit quick feedback.
-- They can choose: 'agree', 'too_expensive', or 'different_vibe'.
-- Unique constraint on (plan_id, voter_session_id) limits voting to one action per session/device.

CREATE TABLE IF NOT EXISTS public.plan_votes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id           UUID NOT NULL REFERENCES public.shared_plans(id) ON DELETE CASCADE,
    -- Unique token stored locally on browser to identify individual voting clients
    voter_session_id  TEXT NOT NULL,
    vote              TEXT NOT NULL CHECK (vote IN ('agree', 'too_expensive', 'different_vibe')),
    voted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint ensuring one vote per plan per session
CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_votes_plan_session 
    ON public.plan_votes (plan_id, voter_session_id);

CREATE INDEX IF NOT EXISTS idx_plan_votes_plan ON public.plan_votes(plan_id);

ALTER TABLE public.plan_votes ENABLE ROW LEVEL SECURITY;

-- Anonymous users (squad members visiting a shared link) can read and write votes.
-- They need SELECT to see the tally and INSERT/UPDATE to register/change their response.
DROP POLICY IF EXISTS "Allow anon insert votes" ON public.plan_votes;
CREATE POLICY "Allow anon insert votes" ON public.plan_votes
    FOR INSERT TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update votes" ON public.plan_votes;
CREATE POLICY "Allow anon update votes" ON public.plan_votes
    FOR UPDATE TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow public read votes" ON public.plan_votes;
CREATE POLICY "Allow public read votes" ON public.plan_votes
    FOR SELECT TO anon, authenticated
    USING (true);
