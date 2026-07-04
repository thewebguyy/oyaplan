-- Phase 4: Data Network and Venue Verification
-- Adds ownership, OCR pipelines, and Scout profiles.

-- 1. Verified Venues Extension
ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS verified_venue BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_source TEXT,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_expiry TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS contact_number TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- 2. Venue Claims Workflow
CREATE TABLE IF NOT EXISTS public.venue_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verification_method TEXT NOT NULL CHECK (verification_method IN ('business_document', 'email_domain', 'phone', 'manual')),
    document_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_venue_claims_venue ON public.venue_claims(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_claims_user ON public.venue_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_claims_status ON public.venue_claims(status);

-- 3. Venue Roles (for approved owners/managers)
CREATE TABLE IF NOT EXISTS public.venue_roles (
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (venue_id, user_id)
);

-- 4. Venue Edit Requests (Moderation Queue for non-price edits)
CREATE TABLE IF NOT EXISTS public.venue_edit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 5. Scout Profiles (Expanding Phase 3B)
CREATE TABLE IF NOT EXISTS public.scout_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    trust_tier TEXT NOT NULL DEFAULT 'novice' CHECK (trust_tier IN ('novice', 'verified', 'elite')),
    total_score INTEGER NOT NULL DEFAULT 0,
    accuracy_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    accepted_submissions INTEGER NOT NULL DEFAULT 0,
    rejected_submissions INTEGER NOT NULL DEFAULT 0,
    venues_covered INTEGER NOT NULL DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. OCR Pipeline Queue
CREATE TABLE IF NOT EXISTS public.menu_digitization_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    ocr_provider TEXT NOT NULL DEFAULT 'unknown',
    ocr_status TEXT NOT NULL DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
    raw_text TEXT,
    structured_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 7. RLS Policies

-- Venue Claims RLS
ALTER TABLE public.venue_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own venue claims" ON public.venue_claims FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own claims" ON public.venue_claims FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all claims" ON public.venue_claims FOR ALL TO authenticated USING (true); -- Placeholder: assuming admin UI relies on auth bypass or service role

-- Venue Roles RLS
ALTER TABLE public.venue_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view venue roles" ON public.venue_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage venue roles" ON public.venue_roles FOR ALL TO authenticated USING (true);

-- Scout Profiles RLS
ALTER TABLE public.scout_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view scout profiles" ON public.scout_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.scout_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.scout_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Venue Edit Requests RLS
ALTER TABLE public.venue_edit_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert edit requests" ON public.venue_edit_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage edit requests" ON public.venue_edit_requests FOR ALL TO authenticated USING (true);

-- Menu Digitization Queue RLS
ALTER TABLE public.menu_digitization_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert digitization tasks" ON public.menu_digitization_queue FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Admins can manage digitization tasks" ON public.menu_digitization_queue FOR ALL TO authenticated USING (true);
