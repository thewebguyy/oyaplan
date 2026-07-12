-- Migration: 0028_menu_items_unique_constraint.sql
-- Adds a unique index on (venue_id, name) for menu_items so that
-- processRawEvidence can safely maybeSingle() and not create duplicates.
-- The normalization layer already normalises names to Title Case before querying;
-- this constraint enforces the invariant at the DB level.

CREATE UNIQUE INDEX IF NOT EXISTS uidx_menu_items_venue_name
  ON public.menu_items (venue_id, name);
