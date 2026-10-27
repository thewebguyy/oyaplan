-- Migration 0061: Add slug column to public.venues and create unique index
-- Enables canonical slug-based lookups for venues (e.g. /venue/100-hours, /business/100-hours)
-- Safe, backward-compatible, and additive.

DO $$
BEGIN
  -- 1. Add slug column if it does not exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'venues') THEN
    ALTER TABLE public.venues
      ADD COLUMN IF NOT EXISTS slug TEXT;

    -- 2. Populate slug from name where null
    UPDATE public.venues
    SET slug = lower(regexp_replace(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'))
    WHERE slug IS NULL;

    -- Ensure fallback for empty slugs
    UPDATE public.venues
    SET slug = 'venue-' || substr(id::text, 1, 8)
    WHERE slug IS NULL OR slug = '';

    -- 3. Create unique index
    CREATE UNIQUE INDEX IF NOT EXISTS idx_venues_slug ON public.venues(slug);
  END IF;
END $$;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
