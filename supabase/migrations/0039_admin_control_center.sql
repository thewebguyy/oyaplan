-- Migration 0039: OyaPlan Control Center (Admin V1)

-- 1. admin_users Access Control Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin_users" ON public.admin_users
    FOR SELECT TO authenticated
    USING (true);

-- Seed initial admin users
INSERT INTO public.admin_users (email, role)
VALUES
    ('pstmax@gmail.com', 'owner'),
    ('temi@oyaplan.com', 'admin'),
    ('coo@oyaplan.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 2. admin_activity Audit Log Table
CREATE TABLE IF NOT EXISTS public.admin_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view and insert activity" ON public.admin_activity
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. sponsored_campaigns Table
CREATE TABLE IF NOT EXISTS public.sponsored_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('basic', 'featured', 'premium')),
    placement TEXT NOT NULL DEFAULT 'explore' CHECK (placement IN ('homepage', 'explore', 'search', 'category')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'ended', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sponsored_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on sponsored_campaigns" ON public.sponsored_campaigns
    FOR SELECT USING (true);

CREATE POLICY "Allow admin write on sponsored_campaigns" ON public.sponsored_campaigns
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);
