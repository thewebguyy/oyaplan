-- Operator Listings Table
CREATE TABLE IF NOT EXISTS public.operator_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    area_slug TEXT NOT NULL,
    spot_category TEXT NOT NULL,
    price_per_person_range TEXT NOT NULL,
    listing_tier TEXT NOT NULL CHECK (listing_tier IN ('Basic', 'Featured', 'Premium')),
    monthly_budget_ngn INTEGER,
    how_they_heard TEXT,
    additional_notes TEXT,
    contacted BOOLEAN DEFAULT false,
    converted BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.operator_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" ON public.operator_inquiries 
    FOR INSERT WITH CHECK (true);

-- No public selects
CREATE POLICY "No public selects" ON public.operator_inquiries 
    FOR SELECT USING (false);
