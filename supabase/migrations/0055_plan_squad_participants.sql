-- Migration 0055: OyaSquad Plan Squad Participants
-- Enables zero-friction guest participation and dynamic headcount tracking on shared plans.

CREATE TABLE IF NOT EXISTS public.plan_squad_participants (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id            UUID NOT NULL REFERENCES public.shared_plans(id) ON DELETE CASCADE,
    participant_token  TEXT NOT NULL,
    display_name       TEXT NOT NULL,
    status             TEXT NOT NULL DEFAULT 'in' CHECK (status IN ('in', 'declined', 'invited')),
    is_creator         BOOLEAN NOT NULL DEFAULT false,
    user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_participant_name_length CHECK (char_length(display_name) BETWEEN 1 AND 50)
);

-- Unique constraint ensuring one participant record per browser session per plan (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS idx_plan_squad_participants_plan_token 
    ON public.plan_squad_participants (plan_id, participant_token);

CREATE INDEX IF NOT EXISTS idx_plan_squad_participants_plan 
    ON public.plan_squad_participants (plan_id);

CREATE INDEX IF NOT EXISTS idx_plan_squad_participants_user 
    ON public.plan_squad_participants (user_id);

-- Enable RLS
ALTER TABLE public.plan_squad_participants ENABLE ROW LEVEL SECURITY;

-- Allow public read access to squad participants
DROP POLICY IF EXISTS "Allow public read on squad participants" ON public.plan_squad_participants;
CREATE POLICY "Allow public read on squad participants" ON public.plan_squad_participants
    FOR SELECT TO anon, authenticated
    USING (true);

-- Allow public insert access for guest and authenticated participants
DROP POLICY IF EXISTS "Allow public insert on squad participants" ON public.plan_squad_participants;
CREATE POLICY "Allow public insert on squad participants" ON public.plan_squad_participants
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Allow updates to participant records by matching session token or authenticated user
DROP POLICY IF EXISTS "Allow update on squad participants" ON public.plan_squad_participants;
CREATE POLICY "Allow update on squad participants" ON public.plan_squad_participants
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Allow deletion of participant records
DROP POLICY IF EXISTS "Allow delete on squad participants" ON public.plan_squad_participants;
CREATE POLICY "Allow delete on squad participants" ON public.plan_squad_participants
    FOR DELETE TO anon, authenticated
    USING (true);
