-- Migration: 0025_venue_intelligence_schema
-- Implements ADR-0005: Venue Intelligence Schema (Accepted)
-- Extends public.venues with semantic classification fields to support
-- richer Forge matching: audience demographics, activity types, layout
-- environment, dress code, date suitability, and group capacity constraints.
--
-- NULL-safety contract (see ADR-0005 Consequences):
--   group_suitability_min / group_suitability_max default to NULL.
--   forgeMatcher.ts MUST treat NULL as "no constraint — do not exclude."
--   NULL must never be coerced to 0 or treated as a failed truthy check.
--   Consistent with existing ?? null-coalescing (e.g. transport_matrix fallback).
--
-- Indexing decision:
--   GIN indexes added on audience_tags and activity_tags (array columns).
--   B-Tree indexes on indoor_outdoor and dress_code are intentionally deferred
--   until real query patterns from Forge v2 justify the write overhead.
--   See ADR-0002 (boring, proven tech) — do not add indexes speculatively.

-- ============================================================
-- 1. Demographic & Intent Filters
-- ============================================================
ALTER TABLE public.venues
  -- Audience demographic tags (e.g. 'squads', 'couples', 'families', 'solo')
  ADD COLUMN IF NOT EXISTS audience_tags  TEXT[] NOT NULL DEFAULT '{}',
  -- Activity type tags (e.g. 'dining', 'dancing', 'board_games', 'live_music')
  ADD COLUMN IF NOT EXISTS activity_tags  TEXT[] NOT NULL DEFAULT '{}';

-- ============================================================
-- 2. Layout & Environmental Classification
-- ============================================================
ALTER TABLE public.venues
  -- Nullable: unclassified until venue is enriched via admin or data pipeline.
  -- NULL means "not yet assessed" — must not be treated as a constraint by forgeMatcher.ts.
  ADD COLUMN IF NOT EXISTS indoor_outdoor TEXT
    CHECK (indoor_outdoor IN ('indoor', 'outdoor', 'mixed'));

-- ============================================================
-- 3. Style & Vibe Boundary
-- ============================================================
ALTER TABLE public.venues
  -- Nullable: unclassified until enriched.
  ADD COLUMN IF NOT EXISTS dress_code TEXT
    CHECK (dress_code IN ('casual', 'smart_casual', 'formal', 'nightlife'));

-- ============================================================
-- 4. Contextual Suitability
-- ============================================================
ALTER TABLE public.venues
  -- BOOLEAN NOT NULL DEFAULT FALSE: fails safe by exclusion (opt-in).
  -- A venue is not date-suitable until explicitly marked so.
  -- Approved as-is per ADR-0005 — no change needed to this default.
  ADD COLUMN IF NOT EXISTS date_suitability      BOOLEAN NOT NULL DEFAULT FALSE,

  -- NULL defaults: no capacity data collected yet.
  -- forgeMatcher.ts must skip group-size filtering when either is NULL.
  -- See ADR-0005 NULL-safety contract above.
  ADD COLUMN IF NOT EXISTS group_suitability_min INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS group_suitability_max INT DEFAULT NULL;

-- ============================================================
-- 5. Indexes
-- GIN indexes on array columns for efficient @> (contains) queries.
-- B-Tree indexes on indoor_outdoor / dress_code are deferred — see header.
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_venues_audience_tags
  ON public.venues USING GIN (audience_tags);

CREATE INDEX IF NOT EXISTS idx_venues_activity_tags
  ON public.venues USING GIN (activity_tags);
