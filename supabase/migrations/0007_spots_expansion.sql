ALTER TABLE spots ADD COLUMN subcategory TEXT;
ALTER TABLE spots ADD COLUMN price_tier INTEGER NOT NULL DEFAULT 2;
ALTER TABLE spots ADD COLUMN crowd_type TEXT;
ALTER TABLE spots ADD COLUMN best_daypart TEXT;
ALTER TABLE spots ADD COLUMN days_open TEXT[] DEFAULT '{"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"}';
ALTER TABLE spots ADD COLUMN instagram_handle TEXT;
ALTER TABLE spots ADD COLUMN trending_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE spots ADD COLUMN verified_by TEXT NOT NULL DEFAULT 'seed';
ALTER TABLE spots ADD COLUMN zone TEXT NOT NULL DEFAULT 'mainland';

CREATE TABLE zones (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  area_count INTEGER DEFAULT 0
);

INSERT INTO zones (id, name, slug, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Lagos Mainland', 'mainland', 'The heart of Lagos hustle, featuring Yaba, Ikeja, and Surulere.'),
('22222222-2222-2222-2222-222222222222', 'Lagos Central', 'central', 'The historic mainland core connecting everything.'),
('33333333-3333-3333-3333-333333333333', 'Lagos Island', 'island', 'Upscale dining, clubs, and premium experiences.'),
('44444444-4444-4444-4444-444444444444', 'Lagos Waterfront', 'waterfront', 'Beaches, resorts, and ocean-facing spots.'),
('55555555-5555-5555-5555-555555555555', 'Lagos Other', 'other', 'Hidden gems further afield.');
