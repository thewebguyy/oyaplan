-- Phase 8: Product Validation Layer
-- Creates the canonical raw event store and migrates legacy engagement data.

-- 1. Create Raw Product Events (Source of Truth)
CREATE TABLE IF NOT EXISTS public.raw_product_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('Acquisition', 'Activation', 'Engagement', 'Trust', 'Recommendation', 'Sharing', 'Contribution', 'Retention', 'Operations', 'AI')),
    event_name TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
    experiments JSONB NOT NULL DEFAULT '{}'::jsonb,
    client_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Optimize for analytics querying
CREATE INDEX IF NOT EXISTS idx_raw_events_category ON public.raw_product_events(category);
CREATE INDEX IF NOT EXISTS idx_raw_events_name ON public.raw_product_events(event_name);
CREATE INDEX IF NOT EXISTS idx_raw_events_session ON public.raw_product_events(session_id);
CREATE INDEX IF NOT EXISTS idx_raw_events_user ON public.raw_product_events(user_id);
CREATE INDEX IF NOT EXISTS idx_raw_events_time ON public.raw_product_events(created_at);

-- 2. Migrate legacy plan_requests into raw_product_events
INSERT INTO public.raw_product_events (
    session_id, 
    category, 
    event_name, 
    version, 
    properties, 
    created_at
)
SELECT 
    gen_random_uuid() AS session_id, -- Mock session for legacy data
    'Engagement' AS category,
    'forge_completed' AS event_name,
    '0.9' AS version,
    jsonb_build_object(
        'start_area', start_area,
        'squad_size', squad_size,
        'budget', budget,
        'vibe', vibe,
        'results_count', results_count,
        'top_spot_id', top_spot_id
    ) AS properties,
    created_at
FROM public.plan_requests
ON CONFLICT DO NOTHING;

-- 3. Deprecate legacy table
DROP TABLE IF EXISTS public.plan_requests;

-- 4. RLS for raw_product_events
ALTER TABLE public.raw_product_events ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS implicitly. No direct client inserts allowed for security.
-- If we need direct inserts, we would enable it here, but we enforce Server-Side ingestion via /api/v1/analytics/track
CREATE POLICY "Admins can read events" ON public.raw_product_events FOR SELECT TO authenticated USING (true); -- Placeholder admin bypass
