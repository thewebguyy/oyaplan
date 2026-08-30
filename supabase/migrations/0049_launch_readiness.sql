-- 0049_launch_readiness.sql
-- 1. Drop the legacy transport_route_overrides table which fabricates fake transport precision
DROP TABLE IF EXISTS public.transport_route_overrides CASCADE;

-- 2. Add gallery_urls to venues for robust visual confidence
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}'::TEXT[];

-- 3. Expose gallery_urls in the spots view
DROP VIEW IF EXISTS public.spots;
CREATE VIEW public.spots AS
SELECT 
    v.id,
    v.name,
    v.address,
    v.vibe_tags,
    v.category,
    v.subcategory,
    v.typical_duration_hours,
    v.is_featured,
    v.active,
    v.district_id,
    d.slug AS address_slug,
    d.area_id,
    a.slug AS area_slug,
    a.zone,
    a.coordinates,
    v.derived_typical_cost AS price_per_person,
    v.derived_price_tier AS price_tier,
    v.operational_status,
    v.last_price_source AS price_source,
    v.last_price_updated_at AS price_updated_at,
    v.cover_url AS cover_url,
    v.cover_url AS image_url, -- Alias for backward compatibility
    v.gallery_urls AS gallery_urls,
    
    -- Expose the new trust dimension fields from 0016
    v.computed_confidence_score,
    v.confidence_reasons,
    
    -- We assume standard transport rates unless overridden in the materialized view.
    -- Phase 2 defaults to empty object, allowing TransportPricingProvider to use global model.
    '{}'::jsonb AS transport_matrix
FROM public.venues v
JOIN public.districts d ON v.district_id = d.id
JOIN public.areas a ON d.area_id = a.id;

-- 4. Preserve Beta User Lifecycle (Soft Delete)
ALTER TABLE public.approved_beta_users ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
