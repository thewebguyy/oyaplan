-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Countries
CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    iso_code VARCHAR(2) UNIQUE NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    currency_symbol VARCHAR(5) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Cities
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Districts (Replacing Areas)
CREATE TABLE IF NOT EXISTS public.districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (city_id, slug)
);

-- 4. Venues (Replacing Spots)
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID NOT NULL REFERENCES public.districts(id),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    vibe_tags TEXT[] NOT NULL DEFAULT '{}',
    category TEXT NOT NULL CHECK (category IN ('restaurant', 'bar', 'activity', 'nature', 'entertainment', 'beach', 'cafe', 'experience')),
    subcategory TEXT,
    typical_duration_hours NUMERIC(4, 2) DEFAULT 2.00,
    instagram_handle TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    
    -- Taxing & Spend Rules
    vat_pct NUMERIC(5, 2) NOT NULL DEFAULT 7.50,
    service_charge_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    minimum_spend INTEGER NOT NULL DEFAULT 0,
    
    -- Operational Status Model
    operational_status TEXT NOT NULL DEFAULT 'verified' CHECK (operational_status IN ('fresh', 'stale', 'needs_review', 'verified', 'community_verified')),
    
    -- Materialized Derived Fields
    derived_typical_cost INTEGER NOT NULL DEFAULT 0,
    derived_price_tier INTEGER NOT NULL DEFAULT 2,
    computed_confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    confidence_reasons TEXT[] NOT NULL DEFAULT '{}',
    
    -- Performance: Materialized timestamps and sources
    last_price_updated_at TIMESTAMP WITH TIME ZONE,
    last_price_source TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_district ON public.venues(district_id);
CREATE INDEX IF NOT EXISTS idx_venues_category ON public.venues(category);
CREATE INDEX IF NOT EXISTS idx_venues_active ON public.venues(active);
CREATE INDEX IF NOT EXISTS idx_venues_operational_status ON public.venues(operational_status);

-- 5. Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('starter', 'main', 'dessert', 'cocktail', 'wine', 'beer', 'spirits', 'soft_drink', 'activity_fee', 'other')),
    price INTEGER NOT NULL, -- Stored in local minor units
    is_available BOOLEAN NOT NULL DEFAULT true,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_venue ON public.menu_items(venue_id);

-- 6. Price Evidence
CREATE TABLE IF NOT EXISTS public.price_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('receipt_upload', 'owner_submission', 'social_media', 'official_website', 'manual_verification', 'web_scraping', 'historical_estimate')),
    submitted_by TEXT NOT NULL,
    recorded_price INTEGER NOT NULL,
    evidence_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    confidence_weight NUMERIC(3, 2) NOT NULL DEFAULT 0.50,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_evidence_venue ON public.price_evidence(venue_id);

-- 7. Price Audit Logs
CREATE TABLE IF NOT EXISTS public.price_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    changed_by TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete')),
    previous_price INTEGER,
    new_price INTEGER,
    evidence_id UUID REFERENCES public.price_evidence(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 8. City Transport Rates
CREATE TABLE IF NOT EXISTS public.city_transport_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,
    mode_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    base_fare INTEGER NOT NULL,
    per_km_rate INTEGER NOT NULL,
    per_minute_rate INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Transport Route Overrides
CREATE TABLE IF NOT EXISTS public.transport_route_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    destination_district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    mode_slug TEXT NOT NULL,
    fixed_cost_low INTEGER NOT NULL,
    fixed_cost_high INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (origin_district_id, destination_district_id, mode_slug)
);

-- Rename legacy tables safely (Idempotent block)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'spots') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'spots_old') THEN
        ALTER TABLE public.spots RENAME TO spots_old;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'areas') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'areas_old') THEN
        ALTER TABLE public.areas RENAME TO areas_old;
    END IF;
END $$;

-- 10. Centralized Pricing & Confidence Recalculation Service (PL/pgSQL Trigger)
CREATE OR REPLACE FUNCTION public.sync_venue_pricing_stats(p_venue_id UUID)
RETURNS VOID AS $$
DECLARE
    v_category TEXT;
    v_vat_pct NUMERIC(5, 2);
    v_service_charge_pct NUMERIC(5, 2);
    v_minimum_spend INTEGER;
    v_typical_cost INTEGER := 0;
    v_price_tier INTEGER := 2;
    
    -- Pricing calculation variables
    v_median_main NUMERIC;
    v_median_drink NUMERIC;
    v_median_starter NUMERIC;
    v_median_fee NUMERIC;
    v_median_all NUMERIC;
    
    -- Confidence score calculation variables
    v_days_since_update DOUBLE PRECISION;
    v_freshness_score DOUBLE PRECISION := 0;
    v_source_score DOUBLE PRECISION := 0;
    v_confirmation_score DOUBLE PRECISION := 0;
    v_completeness_score DOUBLE PRECISION := 0;
    v_conflict_penalty DOUBLE PRECISION := 0;
    v_final_confidence DOUBLE PRECISION := 50.00;
    v_reasons TEXT[] := '{}';
    
    v_has_admin BOOLEAN := false;
    v_has_receipts BOOLEAN := false;
    v_unique_submitters INTEGER := 0;
    v_operational_status TEXT := 'verified';
    
    -- Expected categories completeness
    v_expected_count INTEGER := 1;
    v_present_count INTEGER := 0;
    
    -- Performance columns
    v_last_price_updated_at TIMESTAMP WITH TIME ZONE;
    v_last_price_source TEXT;
BEGIN
    -- Fetch Venue configuration details
    SELECT category, vat_pct, service_charge_pct, minimum_spend
    INTO v_category, v_vat_pct, v_service_charge_pct, v_minimum_spend
    FROM public.venues WHERE id = p_venue_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- A. Calculate Outing Budgets (Typical Cost)
    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY price) INTO v_median_main 
    FROM public.menu_items WHERE venue_id = p_venue_id AND category = 'main' AND is_available = true;
    
    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY price) INTO v_median_drink 
    FROM public.menu_items WHERE venue_id = p_venue_id AND category IN ('cocktail', 'wine', 'beer', 'spirits', 'soft_drink') AND is_available = true;
    
    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY price) INTO v_median_starter 
    FROM public.menu_items WHERE venue_id = p_venue_id AND category = 'starter' AND is_available = true;

    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY price) INTO v_median_fee 
    FROM public.menu_items WHERE venue_id = p_venue_id AND category = 'activity_fee' AND is_available = true;
    
    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY price) INTO v_median_all 
    FROM public.menu_items WHERE venue_id = p_venue_id AND is_available = true;

    IF v_category = 'restaurant' THEN
        v_typical_cost := COALESCE(v_median_main, v_median_all, 5000) + COALESCE(v_median_drink, 3500);
    ELSIF v_category = 'bar' THEN
        v_typical_cost := 2 * COALESCE(v_median_drink, 4500) + COALESCE(v_median_starter, 4000);
    ELSIF v_category = 'activity' THEN
        v_typical_cost := COALESCE(v_median_fee, v_median_all, 5000) + COALESCE(v_median_drink, 1500);
    ELSE
        v_typical_cost := COALESCE(v_median_all, 5000);
    END IF;

    -- Apply Taxes and Minimum Spend limits
    v_typical_cost := v_typical_cost * (1 + (v_vat_pct + v_service_charge_pct) / 100);
    v_typical_cost := GREATEST(v_typical_cost, v_minimum_spend);
    v_typical_cost := ROUND(v_typical_cost / 100) * 100;

    -- Calculate Price Tier
    IF v_typical_cost < 10000 THEN v_price_tier := 1;
    ELSIF v_typical_cost < 25000 THEN v_price_tier := 2;
    ELSIF v_typical_cost < 55000 THEN v_price_tier := 3;
    ELSE v_price_tier := 4;
    END IF;

    -- B. Compute Confidence Score
    -- 1. Freshness Score (35% weight)
    SELECT MAX(created_at), EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 86400 INTO v_last_price_updated_at, v_days_since_update
    FROM public.price_evidence WHERE venue_id = p_venue_id AND verification_status = 'approved';
    
    IF v_days_since_update IS NULL THEN
        v_days_since_update := 365;
    END IF;
    
    v_freshness_score := EXP(-0.015 * v_days_since_update) * 100;
    
    IF v_days_since_update <= 7 THEN
        v_reasons := array_append(v_reasons, '✓ Prices verified within the last 7 days');
    ELSIF v_days_since_update <= 30 THEN
        v_reasons := array_append(v_reasons, '✓ Verified ' || FLOOR(v_days_since_update)::text || ' days ago');
    ELSE
        v_reasons := array_append(v_reasons, '⚠ Pricing is aging (last verified ' || FLOOR(v_days_since_update)::text || ' days ago)');
    END IF;

    -- 2. Trust weight score (30% weight)
    SELECT COALESCE(MAX(confidence_weight), 0.50) INTO v_source_score
    FROM public.price_evidence WHERE venue_id = p_venue_id AND verification_status = 'approved';
    v_source_score := v_source_score * 100;
    
    SELECT EXISTS (
        SELECT 1 FROM public.price_evidence 
        WHERE venue_id = p_venue_id AND verification_status = 'approved' AND source_type IN ('owner_submission', 'manual_verification')
    ) INTO v_has_admin;
    
    SELECT EXISTS (
        SELECT 1 FROM public.price_evidence 
        WHERE venue_id = p_venue_id AND verification_status = 'approved' AND source_type = 'receipt_upload'
    ) INTO v_has_receipts;

    IF v_has_admin THEN
        v_reasons := array_append(v_reasons, '✓ Verified by venue owner or admin team');
        v_last_price_source := 'manual';
    ELSIF v_has_receipts THEN
        v_reasons := array_append(v_reasons, '✓ Backed by customer receipt uploads');
        v_last_price_source := 'crowd';
    ELSE
        v_reasons := array_append(v_reasons, '⚠ Prices based on social media or scraping');
        v_last_price_source := 'scraping';
    END IF;

    -- 3. Confirmations (20% weight)
    SELECT COUNT(DISTINCT submitted_by) INTO v_unique_submitters
    FROM public.price_evidence WHERE venue_id = p_venue_id AND verification_status = 'approved';
    
    v_confirmation_score := LEAST(v_unique_submitters * 25, 100);
    IF v_unique_submitters >= 3 THEN
        v_reasons := array_append(v_reasons, '✓ Confirmed by ' || v_unique_submitters::text || ' independent sources');
    ELSIF v_unique_submitters > 1 THEN
        v_reasons := array_append(v_reasons, '✓ Cross-referenced with ' || v_unique_submitters::text || ' sources');
    END IF;

    -- 4. Completeness (15% weight)
    IF v_category = 'restaurant' THEN
        v_expected_count := 3;
        SELECT COUNT(DISTINCT category) INTO v_present_count FROM public.menu_items 
        WHERE venue_id = p_venue_id AND category IN ('starter', 'main', 'soft_drink') AND is_available = true;
    ELSIF v_category = 'bar' THEN
        v_expected_count := 3;
        SELECT COUNT(DISTINCT category) INTO v_present_count FROM public.menu_items 
        WHERE venue_id = p_venue_id AND category IN ('cocktail', 'beer', 'starter') AND is_available = true;
    ELSIF v_category = 'cafe' THEN
        v_expected_count := 2;
        SELECT COUNT(DISTINCT category) INTO v_present_count FROM public.menu_items 
        WHERE venue_id = p_venue_id AND category IN ('main', 'soft_drink') AND is_available = true;
    ELSIF v_category = 'activity' THEN
        v_expected_count := 2;
        SELECT COUNT(DISTINCT category) INTO v_present_count FROM public.menu_items 
        WHERE venue_id = p_venue_id AND category IN ('activity_fee', 'soft_drink') AND is_available = true;
    ELSE
        v_expected_count := 1;
        v_present_count := 1;
    END IF;

    v_completeness_score := (v_present_count::double precision / v_expected_count::double precision) * 100;
    IF v_completeness_score = 100 THEN
        v_reasons := array_append(v_reasons, '✓ Full menu completeness across standard categories');
    ELSE
        v_reasons := array_append(v_reasons, '⚠ Menu incomplete');
    END IF;

    -- 5. Outlier Penalty from user flags
    DECLARE
        v_up_flags INTEGER := 0;
    BEGIN
        SELECT COUNT(*) INTO v_up_flags FROM public.price_flags 
        WHERE spot_id = p_venue_id AND created_at >= (NOW() - INTERVAL '14 days');
        
        IF v_up_flags >= 3 THEN
            v_conflict_penalty := v_conflict_penalty + 20;
            v_reasons := array_append(v_reasons, '✖ Alert: ' || v_up_flags::text || ' users flagged prices as higher recently');
        END IF;
    END;

    v_final_confidence := (v_freshness_score * 0.35) + (v_source_score * 0.30) + (v_confirmation_score * 0.20) + (v_completeness_score * 0.15);
    v_final_confidence := GREATEST(0.00, LEAST(100.00, v_final_confidence - v_conflict_penalty));

    -- Determine status
    IF v_final_confidence < 40 THEN
        v_operational_status := 'needs_review';
    ELSIF v_days_since_update > 90 THEN
        v_operational_status := 'stale';
    ELSIF v_days_since_update <= 30 AND v_final_confidence >= 85 THEN
        v_operational_status := 'fresh';
    ELSIF v_unique_submitters >= 3 THEN
        v_operational_status := 'community_verified';
    ELSE
        v_operational_status := 'verified';
    END IF;

    -- Sync back to Venue record
    UPDATE public.venues SET
        derived_typical_cost = v_typical_cost,
        derived_price_tier = v_price_tier,
        computed_confidence_score = ROUND(v_final_confidence::numeric, 2),
        confidence_reasons = v_reasons,
        operational_status = v_operational_status,
        last_price_updated_at = COALESCE(v_last_price_updated_at, created_at),
        last_price_source = COALESCE(v_last_price_source, 'historical_estimate')
    WHERE id = p_venue_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Sync Triggers
CREATE OR REPLACE FUNCTION public.trig_sync_menu_items()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.sync_venue_pricing_stats(OLD.venue_id);
        RETURN OLD;
    ELSE
        PERFORM public.sync_venue_pricing_stats(NEW.venue_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trig_sync_price_evidence()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.sync_venue_pricing_stats(OLD.venue_id);
        RETURN OLD;
    ELSE
        PERFORM public.sync_venue_pricing_stats(NEW.venue_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trig_sync_price_flags()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.sync_venue_pricing_stats(OLD.spot_id);
        RETURN OLD;
    ELSE
        PERFORM public.sync_venue_pricing_stats(NEW.spot_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_menu_items_trigger ON public.menu_items;
CREATE TRIGGER sync_menu_items_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.trig_sync_menu_items();

DROP TRIGGER IF EXISTS sync_price_evidence_trigger ON public.price_evidence;
CREATE TRIGGER sync_price_evidence_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.price_evidence
FOR EACH ROW EXECUTE FUNCTION public.trig_sync_price_evidence();

DROP TRIGGER IF EXISTS sync_price_flags_trigger ON public.price_flags;
CREATE TRIGGER sync_price_flags_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.price_flags
FOR EACH ROW EXECUTE FUNCTION public.trig_sync_price_flags();

-- 12. Create Backwards-Compatible VIEW for spots
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
    v.confidence_reasons AS confidence_reasons
FROM public.venues v;

-- 13. Create Backwards-Compatible VIEW for areas
CREATE OR REPLACE VIEW public.areas AS
SELECT 
    d.id,
    d.name,
    d.slug
FROM public.districts d;

-- 14. Write-capable INSTEAD OF triggers for compatibility views
CREATE OR REPLACE FUNCTION public.trig_spots_insert()
RETURNS TRIGGER AS $$
DECLARE
    new_venue_id UUID;
    new_menu_item_id UUID;
    start_slug TEXT;
    cost_val TEXT;
BEGIN
    INSERT INTO public.venues (
        id,
        district_id,
        name,
        address,
        vibe_tags,
        category,
        subcategory,
        typical_duration_hours,
        instagram_handle,
        is_featured,
        active
    ) VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.area_id,
        NEW.name,
        NEW.address,
        NEW.vibe_tags,
        NEW.category,
        NEW.subcategory,
        COALESCE(NEW.typical_duration_hours, 2.00),
        NEW.instagram_handle,
        COALESCE(NEW.is_featured, false),
        COALESCE(NEW.active, true)
    ) RETURNING id INTO new_venue_id;

    -- Add default menu item representing price_per_person
    IF NEW.price_per_person > 0 THEN
        INSERT INTO public.menu_items (
            venue_id,
            name,
            category,
            price,
            is_available
        ) VALUES (
            new_venue_id,
            'Typical Spend Item',
            CASE 
                WHEN NEW.category = 'activity' THEN 'activity_fee'::text
                WHEN NEW.category = 'bar' THEN 'cocktail'::text
                ELSE 'main'::text
            END,
            NEW.price_per_person,
            true
        ) RETURNING id INTO new_menu_item_id;

        INSERT INTO public.price_evidence (
            menu_item_id,
            venue_id,
            source_type,
            submitted_by,
            recorded_price,
            verification_status,
            confidence_weight
        ) VALUES (
            new_menu_item_id,
            new_venue_id,
            'historical_estimate',
            'seeding_trigger',
            NEW.price_per_person,
            'approved',
            0.80
        );
    END IF;

    -- Parse transport overrides
    IF NEW.transport_matrix IS NOT NULL AND NEW.transport_matrix <> '{}'::jsonb THEN
        FOR start_slug, cost_val IN SELECT key, value FROM jsonb_each_text(NEW.transport_matrix) LOOP
            INSERT INTO public.transport_route_overrides (
                origin_district_id,
                destination_district_id,
                mode_slug,
                fixed_cost_low,
                fixed_cost_high
            )
            SELECT 
                d.id,
                NEW.area_id, -- destination_district_id is spots' area_id
                'uber-x',
                cost_val::integer,
                round(cost_val::integer * 1.30)::integer
            FROM public.districts d
            WHERE d.slug = start_slug
            ON CONFLICT (origin_district_id, destination_district_id, mode_slug) DO NOTHING;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trig_spots_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.venues SET
        name = NEW.name,
        address = NEW.address,
        district_id = NEW.area_id,
        vibe_tags = NEW.vibe_tags,
        category = NEW.category,
        subcategory = NEW.subcategory,
        typical_duration_hours = NEW.typical_duration_hours,
        instagram_handle = NEW.instagram_handle,
        is_featured = NEW.is_featured,
        active = NEW.active
    WHERE id = OLD.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trig_spots_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.venues WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS spots_insert_trigger ON public.spots;
CREATE TRIGGER spots_insert_trigger
INSTEAD OF INSERT ON public.spots
FOR EACH ROW EXECUTE FUNCTION public.trig_spots_insert();

DROP TRIGGER IF EXISTS spots_update_trigger ON public.spots;
CREATE TRIGGER spots_update_trigger
INSTEAD OF UPDATE ON public.spots
FOR EACH ROW EXECUTE FUNCTION public.trig_spots_update();

DROP TRIGGER IF EXISTS spots_delete_trigger ON public.spots;
CREATE TRIGGER spots_delete_trigger
INSTEAD OF DELETE ON public.spots
FOR EACH ROW EXECUTE FUNCTION public.trig_spots_delete();

-- Trigger functions for areas view
CREATE OR REPLACE FUNCTION public.trig_areas_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.districts (
        id,
        city_id,
        name,
        slug
    ) VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        (SELECT id FROM public.cities LIMIT 1),
        NEW.name,
        NEW.slug
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS areas_insert_trigger ON public.areas;
CREATE TRIGGER areas_insert_trigger
INSTEAD OF INSERT ON public.areas
FOR EACH ROW EXECUTE FUNCTION public.trig_areas_insert();
