-- Shared Plans Table for shareable URLs
CREATE TABLE IF NOT EXISTS public.shared_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_area TEXT NOT NULL,
    squad_size INTEGER NOT NULL,
    budget INTEGER NOT NULL,
    vibe TEXT NOT NULL,
    spot_id UUID NOT NULL REFERENCES public.spots(id),
    food_cost INTEGER NOT NULL,
    transport_cost INTEGER NOT NULL,
    total_cost INTEGER NOT NULL,
    why_it_fits TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.shared_plans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous sharing)
CREATE POLICY "Allow anonymous insert on shared_plans" ON public.shared_plans FOR INSERT WITH CHECK (true);

-- Allow anyone to read (public view)
CREATE POLICY "Allow public read on shared_plans" ON public.shared_plans FOR SELECT USING (true);
