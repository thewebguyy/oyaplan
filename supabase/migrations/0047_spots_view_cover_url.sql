-- Migration 0047: Expose cover_url and image_url in spots compatibility view
-- Enables high-value discovery and planning surfaces to render venue imagery
-- without breaking existing queries or requiring downstream schema rewrites.

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
    v.logo_url AS logo_url
FROM public.venues v;
