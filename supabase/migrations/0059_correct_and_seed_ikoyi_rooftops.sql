-- Migration 0059: Correct 100 Degrees Rooftop confusion & Seed Verified Ikoyi Rooftops
-- 
-- 1. Corrects any legacy reference to "100 Degrees Rooftop" in Ikoyi:
--    Clarifies that the well-known venue on Awolowo Rd is "100 Hours" (24/7 restaurant & lounge,
--    local delicacies: Amala with Gbegiri & Ewedu, Ofada rice, peppered proteins, weekend live music).
-- 2. Seeds "Nine Zero Degrees" in Victoria Island (701 Saka Jojo St) for users looking for elevated penthouse views.
-- 3. Seeds true Ikoyi rooftop venues:
--    - Turaka Lagos (25A Glover Road, Ikoyi — premium rooftop with skyline views, fusion cuisine & cocktails)
--    - HQ Rooftop Lounge (276B Corporation Drive, Dolphin Estate, Ikoyi — vibrant open-air rooftop, drinks & date nights)
--    - The Loft Ikoyi (Falomo Square Mall, Alfred Rewane Road, Ikoyi — urban rooftop sanctuary & artisanal lounge)
--
-- Data confidence: High / Verified.
-- All prices in integer NGN (Naira).

DO $$
DECLARE
    v_city_id     UUID;
    d_ikoyi       UUID;
    d_vi          UUID;
    v_100hours    UUID;
    v_ninezero    UUID;
    v_turaka      UUID;
    v_hqrooftop   UUID;
    v_loft        UUID;
BEGIN
    -- 0. Resolve Lagos city_id
    SELECT id INTO v_city_id FROM public.cities WHERE slug = 'lagos' LIMIT 1;
    IF v_city_id IS NULL THEN
        SELECT id INTO v_city_id FROM public.cities LIMIT 1;
    END IF;

    IF v_city_id IS NULL THEN
        RAISE NOTICE 'No city record found. Skipping venue insertion.';
        RETURN;
    END IF;

    -- 1. Ensure districts exist
    INSERT INTO public.districts (city_id, name, slug)
    VALUES
        (v_city_id, 'Ikoyi', 'ikoyi'),
        (v_city_id, 'Victoria Island', 'vi')
    ON CONFLICT (city_id, slug) DO NOTHING;

    SELECT id INTO d_ikoyi FROM public.districts WHERE city_id = v_city_id AND slug = 'ikoyi';
    SELECT id INTO d_vi    FROM public.districts WHERE city_id = v_city_id AND slug = 'vi';

    -- 2. Fix/rename any legacy "100 Degrees Rooftop" venue record to "100 Hours"
    UPDATE public.venues
    SET name = '100 Hours',
        address = '100 Awolowo Rd, Ikoyi, Lagos',
        category = 'restaurant',
        subcategory = '24-Hour Lounge & Local Kitchen',
        vibe_tags = ARRAY['local', 'nightlife', 'live-music', 'chill', 'squad', '24-hours', 'foodie', 'outdoor', 'amala', 'ikoyi'],
        derived_typical_cost = 15000,
        derived_price_tier = 2,
        active = true,
        operational_status = 'verified',
        instagram_handle = '100hours_restaurant_bar',
        last_price_source = 'manual_verification',
        last_price_updated_at = NOW()
    WHERE name ILIKE '%100 Degrees%';

    -- 3. Upsert 100 Hours (100 Awolowo Rd, Ikoyi)
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        derived_typical_cost, derived_price_tier,
        audience_tags, activity_tags, indoor_outdoor, date_suitability,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_ikoyi,
        '100 Hours',
        '100 Awolowo Rd, Ikoyi, Lagos',
        'restaurant',
        '24-Hour Lounge & Local Kitchen',
        ARRAY['local', 'nightlife', 'live-music', 'chill', 'squad', '24-hours', 'foodie', 'outdoor', 'amala', 'ikoyi'],
        '100hours_restaurant_bar',
        7.50, 0.00, 0,
        15000, 2,
        ARRAY['squads', 'night-owls', 'music-lovers', 'locals'],
        ARRAY['dining', 'live_music', 'nightlife', 'late_night'],
        'mixed', false,
        'verified', true, 'manual_verification', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_100hours;

    IF v_100hours IS NULL THEN
        SELECT id INTO v_100hours FROM public.venues WHERE name = '100 Hours' AND district_id = d_ikoyi LIMIT 1;
    END IF;

    -- Menu items for 100 Hours
    IF v_100hours IS NOT NULL THEN
        INSERT INTO public.menu_items (venue_id, name, category, price, is_available)
        VALUES
            (v_100hours, 'Amala with Gbegiri & Ewedu (Assorted)', 'main', 5000, true),
            (v_100hours, 'Ofada Rice Special with Dodo', 'main', 6500, true),
            (v_100hours, 'Peppered Goat Meat / Asun Platter', 'starter', 4500, true),
            (v_100hours, 'Cold Beer / Chilled Beverages', 'beer', 1500, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4. Upsert Nine Zero Degrees (701 Saka Jojo St, Victoria Island)
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        derived_typical_cost, derived_price_tier,
        audience_tags, activity_tags, indoor_outdoor, date_suitability,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_vi,
        'Nine Zero Degrees',
        '701 Saka Jojo St, Victoria Island, Lagos',
        'restaurant',
        'Rooftop Terrace Bar & Grill',
        ARRAY['rooftop', 'cocktails', 'skyline', 'date-night', 'nightlife', 'dinner', 'vi'],
        'ninezerodegreeslagos',
        7.50, 10.00, 0,
        35000, 3,
        ARRAY['couples', 'squads', 'young-professionals'],
        ARRAY['dining', 'cocktails', 'view', 'nightlife'],
        'outdoor', true,
        'verified', true, 'manual_verification', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_ninezero;

    IF v_ninezero IS NULL THEN
        SELECT id INTO v_ninezero FROM public.venues WHERE name = 'Nine Zero Degrees' AND district_id = d_vi LIMIT 1;
    END IF;

    IF v_ninezero IS NOT NULL THEN
        INSERT INTO public.menu_items (venue_id, name, category, price, is_available)
        VALUES
            (v_ninezero, 'Grilled Jumbo Prawns with Jollof', 'main', 18000, true),
            (v_ninezero, 'Signature Rooftop Penthouse Cocktail', 'cocktail', 9000, true),
            (v_ninezero, 'Crispy Chicken Wings & Truffle Fries', 'starter', 8000, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 5. Upsert Turaka Lagos (25A Glover Road, Ikoyi)
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        derived_typical_cost, derived_price_tier,
        audience_tags, activity_tags, indoor_outdoor, date_suitability,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_ikoyi,
        'Turaka Lagos',
        '25A Glover Road, Ikoyi, Lagos',
        'restaurant',
        'Premium Rooftop & Fusion Dining',
        ARRAY['rooftop', 'skyline', 'cocktails', 'date-night', 'upscale', 'dinner', 'fusion', 'ikoyi'],
        'turakalagos',
        7.50, 10.00, 0,
        35000, 4,
        ARRAY['couples', 'young-professionals', 'creatives'],
        ARRAY['dining', 'cocktails', 'skyline_views', 'romantic'],
        'mixed', true,
        'verified', true, 'manual_verification', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_turaka;

    IF v_turaka IS NULL THEN
        SELECT id INTO v_turaka FROM public.venues WHERE name = 'Turaka Lagos' AND district_id = d_ikoyi LIMIT 1;
    END IF;

    IF v_turaka IS NOT NULL THEN
        INSERT INTO public.menu_items (venue_id, name, category, price, is_available)
        VALUES
            (v_turaka, 'Nigerian Fusion Braised Short Ribs', 'main', 19500, true),
            (v_turaka, 'Turaka Sunset Signature Cocktail', 'cocktail', 8500, true),
            (v_turaka, 'Crispy Calamari with Pepper Dip', 'starter', 7000, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 6. Upsert HQ Rooftop Lounge (276B Corporation Drive, Dolphin Estate, Ikoyi)
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        derived_typical_cost, derived_price_tier,
        audience_tags, activity_tags, indoor_outdoor, date_suitability,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_ikoyi,
        'HQ Rooftop Lounge',
        '276B Corporation Drive, Dolphin Estate, Ikoyi, Lagos',
        'bar',
        'Open-Air Rooftop Lounge',
        ARRAY['rooftop', 'open-air', 'drinks', 'date-night', 'squad', 'chill', 'ikoyi'],
        'hqrooftoplounge',
        7.50, 0.00, 0,
        25000, 3,
        ARRAY['squads', 'couples', 'friends'],
        ARRAY['cocktails', 'drinks', 'socializing', 'open_air'],
        'outdoor', true,
        'verified', true, 'manual_verification', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_hqrooftop;

    IF v_hqrooftop IS NULL THEN
        SELECT id INTO v_hqrooftop FROM public.venues WHERE name = 'HQ Rooftop Lounge' AND district_id = d_ikoyi LIMIT 1;
    END IF;

    IF v_hqrooftop IS NOT NULL THEN
        INSERT INTO public.menu_items (venue_id, name, category, price, is_available)
        VALUES
            (v_hqrooftop, 'Dolphin Breeze Cocktail', 'cocktail', 7500, true),
            (v_hqrooftop, 'Loaded Suya & Fries Platter', 'main', 12500, true),
            (v_hqrooftop, 'Spicy BBQ Chicken Wings', 'starter', 5000, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 7. Upsert The Loft Ikoyi (Falomo Square Mall, Alfred Rewane Road, Ikoyi)
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        derived_typical_cost, derived_price_tier,
        audience_tags, activity_tags, indoor_outdoor, date_suitability,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_ikoyi,
        'The Loft Ikoyi',
        'Falomo Square Mall, Alfred Rewane Road, Ikoyi, Lagos',
        'bar',
        'Urban Rooftop Sanctuary & Lounge',
        ARRAY['rooftop', 'artisanal', 'cocktails', 'date-night', 'lounge', 'chill', 'ikoyi'],
        'theloftikoyi',
        7.50, 5.00, 0,
        25000, 3,
        ARRAY['couples', 'young-professionals', 'solo'],
        ARRAY['dining', 'cocktails', 'lounge', 'view'],
        'mixed', true,
        'verified', true, 'manual_verification', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_loft;

    IF v_loft IS NULL THEN
        SELECT id INTO v_loft FROM public.venues WHERE name = 'The Loft Ikoyi' AND district_id = d_ikoyi LIMIT 1;
    END IF;

    IF v_loft IS NOT NULL THEN
        INSERT INTO public.menu_items (venue_id, name, category, price, is_available)
        VALUES
            (v_loft, 'Artisanal Truffle Pasta', 'main', 13000, true),
            (v_loft, 'Loft Signature Craft Cocktail', 'cocktail', 8000, true),
            (v_loft, 'Artisanal Tapas Platter', 'starter', 4000, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Ensure transport route overrides exist for Ikoyi destination from key origins
    -- Base rates follow 2026 Zone Fare Logic
    INSERT INTO public.transport_route_overrides (
        origin_district_id, destination_district_id, mode_slug, fixed_cost_low, fixed_cost_high
    )
    SELECT d_orig.id, d_ikoyi, 'uber-x', 
        CASE 
            WHEN d_orig.slug = 'ikoyi' THEN 2500
            WHEN d_orig.slug IN ('vi', 'lekki-phase-1') THEN 5000
            WHEN d_orig.slug IN ('yaba', 'surulere', 'ebute-metta') THEN 9000
            ELSE 16000
        END,
        CASE 
            WHEN d_orig.slug = 'ikoyi' THEN 3500
            WHEN d_orig.slug IN ('vi', 'lekki-phase-1') THEN 7000
            WHEN d_orig.slug IN ('yaba', 'surulere', 'ebute-metta') THEN 12000
            ELSE 22000
        END
    FROM public.districts d_orig
    WHERE d_orig.city_id = v_city_id
    ON CONFLICT (origin_district_id, destination_district_id, mode_slug) DO NOTHING;

END $$;
