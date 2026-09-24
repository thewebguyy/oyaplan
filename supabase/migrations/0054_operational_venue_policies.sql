-- Migration 0054: Operational Venue Policies, Trust-Aware Rules & Plan Code
-- 1. Introduces dedicated public plan_code on shared_plans (server-generated, unique, backfilled)
-- 2. Adds versioned table_policies JSONB to venues
-- 3. Adds nullable celebration & corkage rules (NULL = not provided, 0 = free, >0 = fee)
-- 4. Establishes idempotent venue_attributed_visits tracking table
-- 5. Updates spots compatibility view with time-aware closure metadata

-- ============================================================
-- 1. Helper function to generate unique human-readable plan code
-- Crockford Base32 alphabet: 30 chars (no 0, 1, I, O, L to prevent human transcription errors)
-- Format: OYA-XXXXXX (e.g. OYA-7K4M2P)
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_unique_plan_code()
RETURNS TEXT AS $$
DECLARE
  v_chars TEXT := '23456789ABCDEFGHJKMNPQRSTVWXYZ';
  v_code TEXT;
  v_exists BOOLEAN;
  v_i INT;
BEGIN
  LOOP
    v_code := 'OYA-';
    FOR v_i IN 1..6 LOOP
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::INT, 1);
    END LOOP;
    
    SELECT EXISTS (SELECT 1 FROM public.shared_plans WHERE plan_code = v_code) INTO v_exists;
    IF NOT v_exists THEN
      RETURN v_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================================
-- 2. Add plan_code to shared_plans with safe backfill
-- ============================================================
ALTER TABLE public.shared_plans
  ADD COLUMN IF NOT EXISTS plan_code TEXT;

-- Backfill existing rows that have NULL plan_code
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.shared_plans WHERE plan_code IS NULL LOOP
    UPDATE public.shared_plans
    SET plan_code = public.generate_unique_plan_code()
    WHERE id = r.id;
  END LOOP;
END $$;

-- Enforce default generator and uniqueness constraint
ALTER TABLE public.shared_plans
  ALTER COLUMN plan_code SET DEFAULT public.generate_unique_plan_code();

CREATE UNIQUE INDEX IF NOT EXISTS idx_shared_plans_plan_code ON public.shared_plans(plan_code);

-- ============================================================
-- 3. Venues Table Extensions: Table Policies & Celebration Rules
-- ============================================================
ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS table_policies JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS table_policies_updated_at TIMESTAMPTZ DEFAULT NULL,
  -- Nullable celebration fees (NULL = unknown, 0 = free, >0 = fee)
  ADD COLUMN IF NOT EXISTS cake_fee INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS spirit_corkage_fee INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS decor_fee INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS photo_shoot_fee INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS celebration_notes TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS celebration_rules_status TEXT DEFAULT 'unverified'
    CHECK (celebration_rules_status IN ('unverified', 'owner_submitted', 'verified')),
  ADD COLUMN IF NOT EXISTS celebration_rules_updated_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================================
-- 4. Idempotent Attributed Visits Table
-- Tracks squads who presented an OyaPlan code and were confirmed by the venue operator.
-- UNIQUE (venue_id, shared_plan_id) guarantees idempotency (cannot confirm duplicate visits).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.venue_attributed_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  shared_plan_id UUID NOT NULL REFERENCES public.shared_plans(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL,
  squad_size INTEGER NOT NULL CHECK (squad_size > 0),
  estimated_total_cost INTEGER CHECK (estimated_total_cost >= 0),
  confirmed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_venue_plan_visit UNIQUE (venue_id, shared_plan_id)
);

CREATE INDEX IF NOT EXISTS idx_attributed_visits_venue ON public.venue_attributed_visits(venue_id);
CREATE INDEX IF NOT EXISTS idx_attributed_visits_plan ON public.venue_attributed_visits(shared_plan_id);

ALTER TABLE public.venue_attributed_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Venue partners can view their visits" ON public.venue_attributed_visits;
CREATE POLICY "Venue partners can view their visits"
  ON public.venue_attributed_visits FOR SELECT TO authenticated
  USING (public.is_venue_partner(venue_id) OR public.is_admin());

DROP POLICY IF EXISTS "Venue partners can confirm visits" ON public.venue_attributed_visits;
CREATE POLICY "Venue partners can confirm visits"
  ON public.venue_attributed_visits FOR INSERT TO authenticated
  WITH CHECK (public.is_venue_partner(venue_id) OR public.is_admin());

-- ============================================================
-- 5. Refresh spots view with time-aware closure metadata
-- ============================================================
CREATE OR REPLACE VIEW public.spots AS
SELECT 
    v.id,
    v.name,
    v.address,
    v.district_id AS area_id,
    v.vibe_tags,
    v.derived_typical_cost AS price_per_person,
    v.last_price_updated_at AS price_updated_at,
    v.last_price_source AS price_source,
    COALESCE(
        (
            SELECT jsonb_object_agg(d.slug, tro.fixed_cost_low)
            FROM public.transport_route_overrides tro
            JOIN public.districts d ON tro.origin_district_id = d.id
            WHERE tro.destination_district_id = v.district_id AND tro.mode_slug = 'uber-x'
        ), '{}'::jsonb
    ) AS transport_matrix,
    v.is_featured,
    v.active,
    v.category,
    v.subcategory,
    v.typical_duration_hours,
    v.instagram_handle,
    v.derived_price_tier AS price_tier,
    NULL::TEXT AS crowd_type,
    NULL::TEXT AS best_daypart,
    '{"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"}'::TEXT[] AS days_open,
    0::INTEGER AS trending_score,
    v.operational_status AS verified_by,
    'mainland'::TEXT AS zone,
    v.computed_confidence_score AS computed_confidence_score,
    v.confidence_reasons AS confidence_reasons,
    v.cover_url AS cover_url,
    v.cover_url AS image_url,
    v.logo_url AS logo_url,
    v.is_temporarily_closed,
    v.temporary_closure_start,
    v.temporary_closure_end,
    v.temporary_closure_reason
FROM public.venues v;
