-- Create plan_requests table for anonymous usage data
CREATE TABLE IF NOT EXISTS public.plan_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_area TEXT NOT NULL,
    squad_size INTEGER NOT NULL,
    budget INTEGER NOT NULL,
    vibe TEXT NOT NULL,
    results_count INTEGER NOT NULL,
    top_spot_id UUID REFERENCES public.spots(id)
);

-- Enable RLS (though only service role will typically write here from server actions/components)
ALTER TABLE public.plan_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous logging)
CREATE POLICY "Allow anonymous insert on plan_requests" ON public.plan_requests FOR INSERT WITH CHECK (true);
