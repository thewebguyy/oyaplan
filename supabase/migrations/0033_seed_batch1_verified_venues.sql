-- Migration 0033: Seed Batch 1 — 10 Verified Lagos Venues
-- Coverage: Victoria Island, Lekki Phase 1, Ikoyi, Ikeja, Yaba,
--           Surulere, Maryland, Ajah, Chevron, Festac
--
-- Data confidence: High (7/10) or Medium (3/10) as noted per venue.
-- All prices in NGN (kobo-free integer units).
-- Category CHECK values: restaurant, bar, cafe, activity, nature,
--   entertainment, beach, experience.
-- menu_items.category CHECK values: starter, main, dessert, cocktail,
--   wine, beer, spirits, soft_drink, activity_fee, other.
--
-- District IDs are resolved at runtime via slug — no hardcoded UUIDs.
-- sync_menu_items_trigger fires automatically after each menu_item insert,
-- computing derived_typical_cost, confidence score, and price tier.

DO $$
DECLARE
    v_city_id     UUID;
    -- District IDs
    d_vi          UUID;
    d_lekki1      UUID;
    d_ikoyi       UUID;
    d_ikeja       UUID;
    d_yaba        UUID;
    d_surulere    UUID;
    d_maryland    UUID;
    d_ajah        UUID;
    d_chevron     UUID;
    d_festac      UUID;
    -- Venue IDs
    v_slow        UUID;
    v_circa       UUID;
    v_danfo       UUID;
    v_yellow      UUID;
    v_whitehouse  UUID;
    v_bukka       UUID;
    v_orchid      UUID;
    v_mega        UUID;
    v_ocean       UUID;
    v_theplace    UUID;
BEGIN
    -- ----------------------------------------------------------------
    -- 0. Resolve city_id (Lagos)
    -- ----------------------------------------------------------------
    SELECT id INTO v_city_id FROM public.cities WHERE slug = 'lagos' LIMIT 1;
    IF v_city_id IS NULL THEN
        -- Fallback: take the first city (safe for single-city deployments)
        SELECT id INTO v_city_id FROM public.cities LIMIT 1;
    END IF;

    IF v_city_id IS NULL THEN
        RAISE EXCEPTION 'No city record found. Ensure 0012 migration has run.';
    END IF;

    -- ----------------------------------------------------------------
    -- 1. Ensure all required districts exist (idempotent upsert by slug)
    -- ----------------------------------------------------------------
    INSERT INTO public.districts (city_id, name, slug)
    VALUES
        (v_city_id, 'Victoria Island', 'vi'),
        (v_city_id, 'Lekki Phase 1',   'lekki-phase-1'),
        (v_city_id, 'Ikoyi',           'ikoyi'),
        (v_city_id, 'Ikeja',           'ikeja'),
        (v_city_id, 'Yaba',            'yaba'),
        (v_city_id, 'Surulere',        'surulere'),
        (v_city_id, 'Maryland',        'maryland'),
        (v_city_id, 'Ajah',            'ajah'),
        (v_city_id, 'Chevron',         'chevron'),
        (v_city_id, 'Festac',          'festac')
    ON CONFLICT (city_id, slug) DO NOTHING;

    -- Resolve district IDs by slug
    SELECT id INTO d_vi        FROM public.districts WHERE city_id = v_city_id AND slug = 'vi';
    SELECT id INTO d_lekki1    FROM public.districts WHERE city_id = v_city_id AND slug = 'lekki-phase-1';
    SELECT id INTO d_ikoyi     FROM public.districts WHERE city_id = v_city_id AND slug = 'ikoyi';
    SELECT id INTO d_ikeja     FROM public.districts WHERE city_id = v_city_id AND slug = 'ikeja';
    SELECT id INTO d_yaba      FROM public.districts WHERE city_id = v_city_id AND slug = 'yaba';
    SELECT id INTO d_surulere  FROM public.districts WHERE city_id = v_city_id AND slug = 'surulere';
    SELECT id INTO d_maryland  FROM public.districts WHERE city_id = v_city_id AND slug = 'maryland';
    SELECT id INTO d_ajah      FROM public.districts WHERE city_id = v_city_id AND slug = 'ajah';
    SELECT id INTO d_chevron   FROM public.districts WHERE city_id = v_city_id AND slug = 'chevron';
    SELECT id INTO d_festac    FROM public.districts WHERE city_id = v_city_id AND slug = 'festac';

    -- ----------------------------------------------------------------
    -- 2. Insert Venues
    --    operational_status = 'verified' (data confidence: High)
    --                       = 'community_verified' (data confidence: Medium)
    --    active = false — venues go live after an operator/admin review pass.
    --    vat_pct / service_charge_pct from the provided data.
    --    minimum_spend in NGN; 0 where "Unknown" was specified.
    -- ----------------------------------------------------------------

    -- 2.1  Slow Lagos — Victoria Island
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_vi,
        'Slow Lagos',
        '2 Musa Yar''Adua St, Victoria Island, Lagos',
        'restaurant',
        'Fine Dining / Brasserie',
        ARRAY['upscale','date-night','brasserie','cocktails','lagos-island'],
        'slowlagos',
        7.50, 10.00, 0,
        'verified', false,
        'official_website', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_slow;

    IF v_slow IS NULL THEN
        SELECT id INTO v_slow FROM public.venues WHERE name = 'Slow Lagos' AND district_id = d_vi;
    END IF;

    -- 2.2  Circa Non Pareil — Lekki Phase 1
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_lekki1,
        'Circa Non Pareil',
        '12E Admiralty Way, Lekki Phase 1, Lagos',
        'restaurant',
        'Contemporary Restaurant / Lounge',
        ARRAY['rooftop','lounge','upscale','lekki','date-night','nightlife'],
        'circanonpareil',
        7.50, 10.00, 50000,
        'verified', false,
        'social_media', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_circa;

    IF v_circa IS NULL THEN
        SELECT id INTO v_circa FROM public.venues WHERE name = 'Circa Non Pareil' AND district_id = d_lekki1;
    END IF;

    -- 2.3  Danfo Bistro — Ikoyi
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_ikoyi,
        'Danfo Bistro',
        '2 Alexander Rd, Ikoyi, Lagos',
        'restaurant',
        'Casual Dining',
        ARRAY['afro-fusion','casual','ikoyi','brunch','cocktails'],
        'danfobistro',
        7.50, 10.00, 0,
        'verified', false,
        'social_media', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_danfo;

    IF v_danfo IS NULL THEN
        SELECT id INTO v_danfo FROM public.venues WHERE name = 'Danfo Bistro' AND district_id = d_ikoyi;
    END IF;

    -- 2.4  Yellow Chilli — Ikeja GRA
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_ikeja,
        'Yellow Chilli',
        '35 Joel Ogunnaike Street, GRA Ikeja, Lagos',
        'restaurant',
        'African Contemporary Dining',
        ARRAY['african','nigerian-cuisine','ikeja','family-friendly','institution'],
        'yellowchilling',
        7.50, 10.00, 0,
        'verified', false,
        'official_website', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_yellow;

    IF v_yellow IS NULL THEN
        SELECT id INTO v_yellow FROM public.venues WHERE name = 'Yellow Chilli' AND district_id = d_ikeja;
    END IF;

    -- 2.5  White House Restaurant — Yaba (Medium confidence — local buka)
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_yaba,
        'White House Restaurant',
        '9 Chapel St, Sabo, Yaba, Lagos',
        'restaurant',
        'Local / Buka',
        ARRAY['buka','local','budget','yaba','student','swallows'],
        0.00, 0.00, 0,
        'community_verified', false,
        'historical_estimate', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_whitehouse;

    IF v_whitehouse IS NULL THEN
        SELECT id INTO v_whitehouse FROM public.venues WHERE name = 'White House Restaurant' AND district_id = d_yaba;
    END IF;

    -- 2.6  Bukka Hut — Surulere
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_surulere,
        'Bukka Hut',
        '69 Adeniran Ogunsanya St, Surulere, Lagos',
        'restaurant',
        'Quick Service Restaurant',
        ARRAY['qsr','nigerian-cuisine','surulere','affordable','family-friendly'],
        'bukkahut',
        7.50, 0.00, 0,
        'verified', false,
        'official_website', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_bukka;

    IF v_bukka IS NULL THEN
        SELECT id INTO v_bukka FROM public.venues WHERE name = 'Bukka Hut' AND district_id = d_surulere;
    END IF;

    -- 2.7  The Orchid Bistro Express — Maryland (Medium confidence)
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_maryland,
        'The Orchid Bistro Express',
        'Maryland Mall, 350-360 Ikorodu Rd, Maryland, Lagos',
        'cafe',
        'Cafe / Casual Dining',
        ARRAY['cafe','casual','maryland','brunch','coffee','lunch'],
        'theorchidbistro',
        7.50, 10.00, 0,
        'community_verified', false,
        'social_media', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_orchid;

    IF v_orchid IS NULL THEN
        SELECT id INTO v_orchid FROM public.venues WHERE name = 'The Orchid Bistro Express' AND district_id = d_maryland;
    END IF;

    -- 2.8  Mega Chicken — Ajah
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_ajah,
        'Mega Chicken',
        'Kilometre 14, Lekki-Epe Expressway, Ajah, Lagos',
        'restaurant',
        'Quick Service Restaurant',
        ARRAY['qsr','ajah','affordable','family-friendly','chicken','lekki-epe'],
        'megachickenng',
        7.50, 0.00, 0,
        'verified', false,
        'official_website', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_mega;

    IF v_mega IS NULL THEN
        SELECT id INTO v_mega FROM public.venues WHERE name = 'Mega Chicken' AND district_id = d_ajah;
    END IF;

    -- 2.9  Ocean Basket — Chevron
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_chevron,
        'Ocean Basket',
        'Atlantic Center, Chevron Dr, Lekki Peninsula II, Lagos',
        'restaurant',
        'Seafood / Casual Dining',
        ARRAY['seafood','chevron','date-night','family-friendly','sushi','franchise'],
        'oceanbasketnigeria',
        7.50, 10.00, 0,
        'verified', false,
        'official_website', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_ocean;

    IF v_ocean IS NULL THEN
        SELECT id INTO v_ocean FROM public.venues WHERE name = 'Ocean Basket' AND district_id = d_chevron;
    END IF;

    -- 2.10 The Place Restaurant — Festac
    INSERT INTO public.venues (
        district_id, name, address, category, subcategory,
        vibe_tags, instagram_handle,
        vat_pct, service_charge_pct, minimum_spend,
        operational_status, active, last_price_source, last_price_updated_at
    ) VALUES (
        d_festac,
        'The Place Restaurant',
        '1st Avenue, By 21 Road, Festac Town, Lagos',
        'restaurant',
        'Quick Service Restaurant',
        ARRAY['qsr','festac','nigerian-cuisine','affordable','family-friendly'],
        'theplace_festac',
        7.50, 0.00, 0,
        'verified', false,
        'official_website', NOW()
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_theplace;

    IF v_theplace IS NULL THEN
        SELECT id INTO v_theplace FROM public.venues WHERE name = 'The Place Restaurant' AND district_id = d_festac;
    END IF;

    -- ----------------------------------------------------------------
    -- 3. Insert Menu Items
    --    Prices in NGN integers. Categories mapped to CHECK constraint:
    --    starter | main | dessert | cocktail | wine | beer | spirits |
    --    soft_drink | activity_fee | other
    -- ----------------------------------------------------------------

    -- === Slow Lagos ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_slow, 'Tacos de Asada',      'starter',  14500),
        (v_slow, 'Ceviche Peruano',     'starter',  16000),
        (v_slow, 'Slow Burger',         'main',     22000),
        (v_slow, 'Ribeye Steak',        'main',     48000),
        (v_slow, 'Grilled Salmon',      'main',     35000),
        (v_slow, 'Chicken Milanese',    'main',     24000),
        (v_slow, 'Truffle Fries',       'other',     9500),
        (v_slow, 'Charred Broccolini',  'other',     8000),
        (v_slow, 'Tres Leches Cake',    'dessert',  12000),
        (v_slow, 'Slow Margarita',      'cocktail', 11000)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- === Circa Non Pareil ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_circa, 'Spicy Chicken Wings',          'starter',  12000),
        (v_circa, 'Seafood Chowder',              'starter',  14000),
        (v_circa, 'Circa Special Jollof Rice',    'main',     18000),
        (v_circa, 'Braised Lamb Shank',           'main',     38000),
        (v_circa, 'Seafood Pasta',                'main',     28000),
        (v_circa, 'Suya Platter',                 'main',     22000),
        (v_circa, 'Sweet Potato Fries',           'other',     5500),
        (v_circa, 'Fried Plantain',               'other',     4000),
        (v_circa, 'Cheesecake',                   'dessert',  11000),
        (v_circa, 'Long Island Iced Tea',         'cocktail', 12000)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- === Danfo Bistro ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_danfo, 'Ewa Agoyin & Agege Bread',  'other',     9500),
        (v_danfo, 'Asun Tacos',               'starter',  12000),
        (v_danfo, 'Danfo Suya Burger',         'main',     16500),
        (v_danfo, 'Seafood Okra',              'main',     24000),
        (v_danfo, 'Jollof Rice & Chicken',     'main',     14000),
        (v_danfo, 'Goat Meat Pepper Soup',     'main',     15000),
        (v_danfo, 'Yam Chips',                 'other',     4500),
        (v_danfo, 'Puff Puff with Caramel',    'dessert',   6000),
        (v_danfo, 'Chapman',                   'soft_drink', 5000),
        (v_danfo, 'Zobo Margarita',            'cocktail',  9500)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- === Yellow Chilli ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_yellow, 'Peppered Snails',            'starter',  12000),
        (v_yellow, 'Isi Ewu',                    'starter',  14500),
        (v_yellow, 'Seafood Okra',               'main',     26000),
        (v_yellow, 'Jollof Fiesta',              'main',     18000),
        (v_yellow, 'Pounded Yam & Egusi',        'main',     15000),
        (v_yellow, 'Asun',                       'main',     11000),
        (v_yellow, 'Fried Plantain',             'other',     4000),
        (v_yellow, 'Moi Moi',                    'other',     3500),
        (v_yellow, 'Ice Cream',                  'dessert',   5500),
        (v_yellow, 'Chapman',                    'soft_drink', 4500)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- === White House Restaurant (Buka — per-portion pricing) ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_whitehouse, 'Amala (Per Wrap)',         'other',  500),
        (v_whitehouse, 'Pounded Yam (Per Wrap)',   'other',  800),
        (v_whitehouse, 'Ewedu / Gbegiri',          'other', 1000),
        (v_whitehouse, 'Egusi Soup',               'other', 1500),
        (v_whitehouse, 'Assorted Meat (Per Piece)','other', 1500),
        (v_whitehouse, 'Beef (Per Piece)',         'other', 1000),
        (v_whitehouse, 'Fried Fish',               'other', 2500),
        (v_whitehouse, 'Jollof Rice (Per Portion)','main',  1500),
        (v_whitehouse, 'Fried Rice (Per Portion)', 'main',  1500),
        (v_whitehouse, 'Bottled Water',            'soft_drink', 500)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- === Bukka Hut ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_bukka, 'Buka Stew',       'other',  1200),
        (v_bukka, 'Afang Soup',      'other',  2000),
        (v_bukka, 'Edikaikong Soup', 'other',  2000),
        (v_bukka, 'Jollof Rice',     'main',   1800),
        (v_bukka, 'Village Rice',    'main',   2200),
        (v_bukka, 'Eba',             'other',   500),
        (v_bukka, 'Semo',            'other',   800),
        (v_bukka, 'Goat Meat',       'other',  2500),
        (v_bukka, 'Fried Turkey',    'other',  3500),
        (v_bukka, 'Suya (Beef)',     'other',  2500)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- === The Orchid Bistro Express ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_orchid, 'English Breakfast',         'main',    12000),
        (v_orchid, 'Club Sandwich',             'main',     9500),
        (v_orchid, 'Spicy Chicken Wrap',        'main',     8000),
        (v_orchid, 'Bistro Burger',             'main',    11500),
        (v_orchid, 'Spaghetti Bolognese',       'main',    13000),
        (v_orchid, 'Chicken Salad',             'other',    9000),
        (v_orchid, 'Red Velvet Cake (Slice)',   'dessert',  6500),
        (v_orchid, 'Carrot Cake (Slice)',       'dessert',  6000),
        (v_orchid, 'Iced Latte',               'other',    4500),
        (v_orchid, 'Fresh Orange Juice',        'soft_drink', 4000)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- === Mega Chicken ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_mega, 'Fried Rice',              'main',   1800),
        (v_mega, 'Chinese Rice',            'main',   2500),
        (v_mega, 'Fried Chicken (Quarter)', 'other',  3000),
        (v_mega, 'Crispy Chicken Wings',    'other',  2500),
        (v_mega, 'Beef Sausage Roll',       'other',  1000),
        (v_mega, 'Meat Pie',               'other',  1200),
        (v_mega, 'Pounded Yam',            'other',   800),
        (v_mega, 'Fisherman Soup',         'other',  3500),
        (v_mega, 'Moi Moi',               'other',  1000),
        (v_mega, 'Coleslaw',              'other',   800)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- === Ocean Basket ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_ocean, 'Calamari Heads',             'starter',  7500),
        (v_ocean, '6 Mussels in Lemon Garlic',  'starter',  8000),
        (v_ocean, 'Fish and Chips',             'main',    14500),
        (v_ocean, 'Prawns (10 Prince)',          'main',    18000),
        (v_ocean, 'Seafood Platter for 1',       'main',    22000),
        (v_ocean, 'Family Platter',              'main',    65000),
        (v_ocean, 'Sushi - Crunch Roll',         'other',    9500),
        (v_ocean, 'Sushi - Salmon Roses',        'other',   11000),
        (v_ocean, 'Greek Salad',                'other',    6500),
        (v_ocean, 'Mud Pie',                    'dessert',  7000)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- === The Place Restaurant ===
    INSERT INTO public.menu_items (venue_id, name, category, price) VALUES
        (v_theplace, 'Asun Rice',            'main',  2000),
        (v_theplace, 'Special Fried Rice',   'main',  1800),
        (v_theplace, 'Ofada Rice',           'main',  1500),
        (v_theplace, 'Ofada Sauce',          'other', 2500),
        (v_theplace, 'Grilled BBQ Chicken',  'other', 3200),
        (v_theplace, 'Croaker Fish',         'other', 4500),
        (v_theplace, 'Amala',               'other',  600),
        (v_theplace, 'Efo Riro',            'other', 1800),
        (v_theplace, 'Plantain (Dodo)',      'other',  800),
        (v_theplace, 'Sausage Roll',         'other', 1000)
    ON CONFLICT ON CONSTRAINT uidx_menu_items_venue_name DO NOTHING;

    -- ----------------------------------------------------------------
    -- 4. Insert price_evidence records for audit trail
    --    source_type reflects how pricing was verified per venue.
    --    confidence_weight: 0.80 = High, 0.55 = Medium.
    -- ----------------------------------------------------------------
    INSERT INTO public.price_evidence (
        venue_id, source_type, submitted_by,
        recorded_price, evidence_url,
        verification_status, confidence_weight
    )
    SELECT
        v.id,
        s.source_type,
        'admin_seed_batch1',
        v.derived_typical_cost,
        s.evidence_url,
        'approved',
        s.confidence_weight
    FROM (VALUES
        (v_slow,      'official_website',   'https://www.slowlagos.com/',            0.80::NUMERIC),
        (v_circa,     'social_media',       'https://www.instagram.com/circanonpareil/', 0.80::NUMERIC),
        (v_danfo,     'social_media',       'https://www.instagram.com/danfobistro/',    0.80::NUMERIC),
        (v_yellow,    'official_website',   'https://yellowchilling.com/',           0.80::NUMERIC),
        (v_whitehouse,'historical_estimate','https://maps.google.com/?q=White+House+Yaba', 0.55::NUMERIC),
        (v_bukka,     'official_website',   'https://bukkahut.com/menu',             0.80::NUMERIC),
        (v_orchid,    'social_media',       'https://www.instagram.com/theorchidbistro/', 0.55::NUMERIC),
        (v_mega,      'official_website',   'https://megachicken.com.ng/order',      0.80::NUMERIC),
        (v_ocean,     'official_website',   'https://nigeria.oceanbasket.com/menu',  0.80::NUMERIC),
        (v_theplace,  'official_website',   'https://theplace.com.ng/',              0.80::NUMERIC)
    ) AS s(venue_id, source_type, evidence_url, confidence_weight)
    CROSS JOIN public.venues v
    WHERE v.id = s.venue_id
      AND v.derived_typical_cost > 0; -- Only insert if sync_trigger has already fired

END $$;
