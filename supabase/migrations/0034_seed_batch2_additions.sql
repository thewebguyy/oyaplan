-- Migration 0034: Seed Batch 2 Additions — 2 Net-New Verified Lagos Venues
-- RSVP Lagos (Victoria Island) and Rhapsody's (Ikeja) replace Slow Lagos and
-- Yellow Chilli respectively from Batch 1. All other Batch 2 venues are
-- identical to 0033 and are skipped here (ON CONFLICT DO NOTHING applied
-- on venue name + district wherever they are referenced).
--
-- Data confidence: High (RSVP Lagos, Rhapsody's marked Medium per notes below).
-- Prices in NGN integers. No lat/lon stored — not in the venues schema.
-- sync_menu_items_trigger fires automatically on menu_item insert.

DO $$
DECLARE
    v_city_id    UUID;
    d_vi         UUID;
    d_ikeja      UUID;
    v_rsvp       UUID;
    v_rhapsodys  UUID;
BEGIN
    -- ----------------------------------------------------------------
    -- 0. Resolve city_id
    -- ----------------------------------------------------------------
    SELECT id INTO v_city_id FROM public.cities WHERE slug = 'lagos' LIMIT 1;
    IF v_city_id IS NULL THEN
        SELECT id INTO v_city_id FROM public.cities LIMIT 1;
    END IF;
    IF v_city_id IS NULL THEN
        RAISE EXCEPTION 'No city record found. Ensure migration 0012 has run.';
    END IF;

    -- ----------------------------------------------------------------
    -- 1. Ensure districts exist (idempotent — already seeded by 0033)
    -- ----------------------------------------------------------------
    INSERT INTO public.districts (city_id, name, slug)
    VALUES
        (v_city_id, 'Victoria Island', 'vi'),
        (v_city_id, 'Ikeja',           'ikeja')
    ON CONFLICT (city_id, slug) DO NOTHING;

    SELECT id INTO d_vi    FROM public.districts WHERE city_id = v_city_id AND slug = 'vi';
    SELECT id INTO d_ikeja FROM public.districts WHERE city_id = v_city_id AND slug = 'ikeja';

    -- ----------------------------------------------------------------
    -- 2. RSVP Lagos — Victoria Island
    --    Confidence: High (Google Maps + Instagram + Q1 2025 review photos)
    -- ----------------------------------------------------------------
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_vi,
        'RSVP Lagos',
        '9 Eletu Ogabi St, Victoria Island, Lagos',
        'restaurant',
        'Fine Dining',
        ARRAY['fine-dining','date-night','upscale','lagos-island','cocktails','vi'],
        'rsvplagos',
        7.50, 10.00, 0,
        'verified', false,
        'social_media', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_rsvp;

    IF v_rsvp IS NULL THEN
        SELECT id INTO v_rsvp FROM public.venues
        WHERE name = 'RSVP Lagos' AND district_id = d_vi;
    END IF;

    -- ----------------------------------------------------------------
    -- 3. Rhapsody's — Ikeja City Mall
    --    Confidence: Medium (chain; mall pricing fluctuates)
    -- ----------------------------------------------------------------
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_ikeja,
        'Rhapsody''s',
        'Ikeja City Mall, Obafemi Awolowo Way, Alausa, Ikeja, Lagos',
        'restaurant',
        'Casual Dining / Lounge',
        ARRAY['casual','lounge','ikeja','mall','date-night','franchise'],
        'rhapsodys_ikeja',
        7.50, 10.00, 0,
        'community_verified', false,
        'social_media', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_rhapsodys;

    IF v_rhapsodys IS NULL THEN
        SELECT id INTO v_rhapsodys FROM public.venues
        WHERE name = 'Rhapsody''s' AND district_id = d_ikeja;
    END IF;

    -- ----------------------------------------------------------------
    -- 4. Menu Items
    -- ----------------------------------------------------------------

    -- === RSVP Lagos ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_rsvp, 'Chicken Truffle Roll',   'starter',   15000),
        (v_rsvp, 'Crispy Squid',           'starter',   14500),
        (v_rsvp, 'RSVP Burger',            'main',      22000),
        (v_rsvp, 'Prawn Linguine',         'main',      26000),
        (v_rsvp, 'Grilled Salmon',         'main',      35000),
        (v_rsvp, 'Ribeye Steak',           'main',      48000),
        (v_rsvp, 'Parmesan Truffle Fries', 'other',      8000),
        (v_rsvp, 'Mac and Cheese',         'other',      9500),
        (v_rsvp, 'Tiramisu',              'dessert',    12000),
        (v_rsvp, 'Lagos Mule',            'cocktail',   10000)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- === Rhapsody's ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_rhapsodys, 'Spring Rolls',           'starter',   8000),
        (v_rhapsodys, 'Spicy Buffalo Wings',    'starter',  11500),
        (v_rhapsodys, 'Rhapsody''s Burger',     'main',     15000),
        (v_rhapsodys, 'Chicken Alfredo',        'main',     18500),
        (v_rhapsodys, 'T-Bone Steak (500g)',    'main',     42000),
        (v_rhapsodys, 'Grilled Tilapia',        'main',     25000),
        (v_rhapsodys, 'Mashed Potatoes',        'other',     5500),
        (v_rhapsodys, 'French Fries',           'other',     4500),
        (v_rhapsodys, 'Chocolate Brownie',      'dessert',   9000),
        (v_rhapsodys, 'Strawberry Daiquiri',    'cocktail', 10500)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- ----------------------------------------------------------------
    -- 5. Price evidence audit rows
    -- ----------------------------------------------------------------
    INSERT INTO public.price_evidence (
        venue_id, source_type, submitted_by,
        recorded_price, evidence_url,
        verification_status, confidence_weight
    )
    SELECT
        s.venue_id,
        s.source_type,
        'admin_seed_batch2',
        v.derived_typical_cost,
        s.evidence_url,
        'approved',
        s.confidence_weight
    FROM (VALUES
        (v_rsvp,      'social_media'::TEXT, 'https://www.instagram.com/rsvplagos/',      0.80::NUMERIC),
        (v_rhapsodys, 'social_media'::TEXT, 'https://www.instagram.com/rhapsodys_ikeja/', 0.55::NUMERIC)
    ) AS s(venue_id, source_type, evidence_url, confidence_weight)
    JOIN public.venues v ON v.id = s.venue_id
    WHERE v.derived_typical_cost > 0;

END $$;
