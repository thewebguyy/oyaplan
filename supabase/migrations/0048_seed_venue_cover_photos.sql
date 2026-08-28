-- Migration 0048: Populate cover_url for approved launch venues
-- Links verified local static assets to active venues in public.venues.
-- Excluded venues (Slow, Noir, Shiro, Cafe One, Filmhouse, White House)
-- intentionally fallback to the Lagos architectural vector silhouette.

UPDATE public.venues SET cover_url = '/images/venues/02_rsvp_lagos_hero.jpg' WHERE name ILIKE '%RSVP%';
UPDATE public.venues SET cover_url = '/images/venues/05_talindo_steakhouse_hero.jpg' WHERE name ILIKE '%Talindo%';
UPDATE public.venues SET cover_url = '/images/venues/06_danfo_bistro_hero.jpg' WHERE name ILIKE '%Danfo Bistro%';
UPDATE public.venues SET cover_url = '/images/venues/07_circa_non_pareil_hero.jpg' WHERE name ILIKE '%Circa Non Pareil%' OR name ILIKE '%Circa%';
UPDATE public.venues SET cover_url = '/images/venues/09_wave_beach_hero.jpg' WHERE name ILIKE '%Wave Beach%' OR name ILIKE '%Moist Beach%';
UPDATE public.venues SET cover_url = '/images/venues/11_yellow_chilli_hero.jpg' WHERE name ILIKE '%Yellow Chilli%';
UPDATE public.venues SET cover_url = '/images/venues/12_rhapsodys_hero.jpg' WHERE name ILIKE '%Rhapsody%';
UPDATE public.venues SET cover_url = '/images/venues/13_orchid_bistro_hero.jpg' WHERE name ILIKE '%Orchid Bistro%';
UPDATE public.venues SET cover_url = '/images/venues/14_bogobiri_house_hero.jpg' WHERE name ILIKE '%Bogobiri%';
