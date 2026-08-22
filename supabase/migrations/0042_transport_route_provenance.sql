-- Migration 0042: Transport Route Provenance + Backfill
--
-- Adds public.transport_route_overrides table referencing public.areas.
-- Ensures areas exist for Ajah, Chevron, and Festac.
-- Creates a SQL mirror of calculateZoneFare() for migration use.
-- Backfills derived overrides for all spots missing route data.

-- ----------------------------------------------------------------
-- 1. Ensure areas exist for Ajah, Chevron, and Festac
-- ----------------------------------------------------------------
INSERT INTO public.areas (id, name, slug, active)
VALUES
  (gen_random_uuid(), 'Ajah', 'ajah', false),
  (gen_random_uuid(), 'Chevron', 'chevron', false),
  (gen_random_uuid(), 'Festac', 'festac', false)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------
-- 2. Create transport_route_overrides table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transport_route_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  destination_area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  mode_slug TEXT NOT NULL,
  fixed_cost_low INTEGER NOT NULL,
  fixed_cost_high INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'derived' CHECK (source IN ('derived', 'manually_verified', 'crowdsourced')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_method TEXT,
  confidence NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (origin_area_id, destination_area_id, mode_slug)
);

COMMENT ON COLUMN public.transport_route_overrides.source IS
  'derived = inferred from zone formula, manually_verified = Ops-confirmed, crowdsourced = aggregated user reports';

-- Enable RLS
ALTER TABLE public.transport_route_overrides ENABLE ROW LEVEL SECURITY;

-- Allow public read access to transport overrides
DROP POLICY IF EXISTS "Allow public read access on transport overrides" ON public.transport_route_overrides;
CREATE POLICY "Allow public read access on transport overrides" 
  ON public.transport_route_overrides FOR SELECT USING (true);

-- ----------------------------------------------------------------
-- 3. SQL mirror of calculateZoneFare() for migration use
--    Mirrors lib/planning/transport.ts calculateZoneFare() exactly.
--    IMMUTABLE: same inputs always produce same output.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_zone_fare_sql(
  origin_slug TEXT,
  dest_slug TEXT
)
RETURNS INTEGER AS $$
DECLARE
  zone1 TEXT;
  zone2 TEXT;
  non_other TEXT;
  base_one_way INTEGER := 0;
  round_trip INTEGER;
BEGIN
  -- Same-area: flat ₦1,200
  IF origin_slug = dest_slug THEN
    RETURN 1200;
  END IF;

  -- Zone assignment
  -- Fallback pricing buckets only — not geographic identity assertions.
  zone1 := CASE origin_slug
    WHEN 'ikeja' THEN 'mainland'
    WHEN 'gbagada' THEN 'mainland'
    WHEN 'ogudu' THEN 'mainland'
    WHEN 'agege' THEN 'mainland'
    WHEN 'maryland' THEN 'mainland'
    WHEN 'yaba' THEN 'central'
    WHEN 'surulere' THEN 'central'
    WHEN 'ebute-metta' THEN 'central'
    WHEN 'lekki-phase-1' THEN 'island'
    WHEN 'vi' THEN 'island'
    WHEN 'ikoyi' THEN 'island'
    WHEN 'ajah' THEN 'island'
    WHEN 'chevron' THEN 'island'
    WHEN 'apapa' THEN 'other'
    WHEN 'festac' THEN 'other'
    ELSE 'other'
  END;

  zone2 := CASE dest_slug
    WHEN 'ikeja' THEN 'mainland'
    WHEN 'gbagada' THEN 'mainland'
    WHEN 'ogudu' THEN 'mainland'
    WHEN 'agege' THEN 'mainland'
    WHEN 'maryland' THEN 'mainland'
    WHEN 'yaba' THEN 'central'
    WHEN 'surulere' THEN 'central'
    WHEN 'ebute-metta' THEN 'central'
    WHEN 'lekki-phase-1' THEN 'island'
    WHEN 'vi' THEN 'island'
    WHEN 'ikoyi' THEN 'island'
    WHEN 'ajah' THEN 'island'
    WHEN 'chevron' THEN 'island'
    WHEN 'apapa' THEN 'other'
    WHEN 'festac' THEN 'other'
    ELSE 'other'
  END;

  -- Apapa/Festac (other) logic
  IF zone1 = 'other' OR zone2 = 'other' THEN
    non_other := CASE WHEN zone1 = 'other' THEN zone2 ELSE zone1 END;
    base_one_way := CASE non_other
      WHEN 'other' THEN 2500
      WHEN 'central' THEN 2500
      WHEN 'mainland' THEN 3500
      WHEN 'island' THEN 4500
      ELSE 2500
    END;
    base_one_way := base_one_way + 1500; -- Apapa surcharge
  -- Same zone, different area
  ELSIF zone1 = zone2 THEN
    base_one_way := 2500;
  -- Mainland <-> Central
  ELSIF (zone1 = 'mainland' AND zone2 = 'central')
     OR (zone1 = 'central' AND zone2 = 'mainland') THEN
    base_one_way := 3500;
  -- Central <-> Island
  ELSIF (zone1 = 'central' AND zone2 = 'island')
     OR (zone1 = 'island' AND zone2 = 'central') THEN
    base_one_way := 4500;
  -- Mainland <-> Island
  ELSIF (zone1 = 'mainland' AND zone2 = 'island')
     OR (zone1 = 'island' AND zone2 = 'mainland') THEN
    base_one_way := 8000;
  END IF;

  round_trip := base_one_way * 2;
  RETURN (ROUND(round_trip::NUMERIC / 500) * 500)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ----------------------------------------------------------------
-- 4. Backfill derived overrides for all spots missing route data
--    Every inserted row is explicitly source='derived', confidence=50.
-- ----------------------------------------------------------------
INSERT INTO public.transport_route_overrides (
  origin_area_id,
  destination_area_id,
  mode_slug,
  fixed_cost_low,
  fixed_cost_high,
  source,
  confidence
)
SELECT
  origin.id,
  dest.id,
  'uber-x',
  public.calculate_zone_fare_sql(origin.slug, dest.slug),
  (ROUND(public.calculate_zone_fare_sql(origin.slug, dest.slug) * 1.30 / 500) * 500)::INTEGER,
  'derived',
  50.00
FROM public.spots s
JOIN public.areas dest ON dest.id = s.area_id
CROSS JOIN public.areas origin
WHERE s.active = true
  AND public.calculate_zone_fare_sql(origin.slug, dest.slug) > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.transport_route_overrides tro
    WHERE tro.origin_area_id = origin.id
      AND tro.destination_area_id = dest.id
      AND tro.mode_slug = 'uber-x'
  )
ON CONFLICT (origin_area_id, destination_area_id, mode_slug) DO NOTHING;
