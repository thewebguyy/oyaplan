-- Accelerates the active-spot base query as the catalog grows.
CREATE INDEX IF NOT EXISTS spots_active_idx ON spots (active);

-- Accelerates the category SQL pre-filter (Strategy A) added in app/forge/page.tsx.
-- Composite index covers the combined .eq("active", true).in("category", [...]) query.
CREATE INDEX IF NOT EXISTS spots_active_category_idx ON spots (active, category);

-- Positions future vibe_tags SQL pre-filter (Strategy C, deferred).
-- GIN index required for array containment queries (@> operator).
CREATE INDEX IF NOT EXISTS spots_vibe_tags_gin_idx ON spots USING GIN (vibe_tags);
