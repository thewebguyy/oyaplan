-- Create Areas Table
CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

-- Create Spots Table
CREATE TABLE spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    area_id UUID REFERENCES areas(id),
    vibe_tags TEXT[] NOT NULL,
    price_per_person INTEGER NOT NULL,
    transport_matrix JSONB NOT NULL, -- { area_slug: cost }
    active BOOLEAN DEFAULT true
);
