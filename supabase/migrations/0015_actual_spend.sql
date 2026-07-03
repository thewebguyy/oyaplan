-- Migration 0015: Actual Spend Foundation
-- Prepares the backend model for the future post-outing feedback flow.
-- No UI is wired to this yet — this exists so the schema is ready
-- when the feature is implemented without requiring another migration.
-- 
-- Design: Users can optionally submit what they actually spent after an outing.
-- This data feeds back into pricing confidence via the moderation pipeline.
-- PII note: no phone numbers or names stored here. Only amounts and plan FK.

CREATE TABLE IF NOT EXISTS public.actual_spend_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- FK to shared_plans. Nullable: plan may be deleted, report should persist.
    shared_plan_id  UUID REFERENCES public.shared_plans(id) ON DELETE SET NULL,
    -- The spot this report is about (denormalized for query convenience)
    spot_id         UUID,
    -- What OyaPlan estimated (captured at submission time for variance tracking)
    estimated_total INTEGER NOT NULL,
    -- What the squad actually spent in NGN
    actual_total    INTEGER NOT NULL CHECK (actual_total > 0 AND actual_total <= 10000000),
    -- Free-form context (optional, capped length)
    notes           TEXT CHECK (char_length(notes) <= 500),
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actual_spend_spot ON public.actual_spend_reports(spot_id);
CREATE INDEX IF NOT EXISTS idx_actual_spend_plan ON public.actual_spend_reports(shared_plan_id);

ALTER TABLE public.actual_spend_reports ENABLE ROW LEVEL SECURITY;

-- Anon users can submit spend reports (no auth required — anonymous-first principle)
DROP POLICY IF EXISTS "Anon insert actual spend" ON public.actual_spend_reports;
CREATE POLICY "Anon insert actual spend"
  ON public.actual_spend_reports FOR INSERT TO anon
  WITH CHECK (
    actual_total > 0
    AND actual_total <= 10000000
    AND estimated_total > 0
  );

-- Admin can read all spend reports for intelligence analysis
DROP POLICY IF EXISTS "Authenticated read actual spend" ON public.actual_spend_reports;
CREATE POLICY "Authenticated read actual spend"
  ON public.actual_spend_reports FOR SELECT TO authenticated
  USING (true);
