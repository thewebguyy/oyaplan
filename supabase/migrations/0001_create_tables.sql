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
    price_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    price_source TEXT NOT NULL DEFAULT 'manual',
    transport_matrix JSONB NOT NULL, -- { area_slug: cost }
    is_featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true
);

-- Create Price Flags Table
CREATE TABLE price_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id UUID REFERENCES spots(id),
    flag_type TEXT NOT NULL CHECK (flag_type IN ('up', 'down')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
