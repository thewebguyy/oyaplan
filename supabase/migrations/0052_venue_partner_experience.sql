-- Migration 0052: Venue Partner Experience (Supply-Side Relationship Layer)
-- Adds explicit partner states, structured fees, temporary closures,
-- enhanced claim records with claimant contact/role, change requests queue,
-- and venue photos moderation.

-- ============================================================
-- 1. Venues Schema Extensions
-- ============================================================
ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS partner_state TEXT NOT NULL DEFAULT 'unclaimed'
    CHECK (partner_state IN ('unclaimed', 'claim_pending', 'claimed', 'onboarding', 'verification_pending', 'verified_partner', 'strategic_partner')),
  ADD COLUMN IF NOT EXISTS corkage_fee INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS entrance_fee INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reservation_fee INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekend_pricing_notes TEXT,
  ADD COLUMN IF NOT EXISTS is_temporarily_closed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS temporary_closure_start DATE,
  ADD COLUMN IF NOT EXISTS temporary_closure_end DATE,
  ADD COLUMN IF NOT EXISTS temporary_closure_reason TEXT,
  ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_venues_partner_state ON public.venues(partner_state);
CREATE INDEX IF NOT EXISTS idx_venues_claimed_by ON public.venues(claimed_by);

-- ============================================================
-- 2. Upgrade Venue Claims (Adding PII comments per charter)
-- PII note: claimant_name, claimant_phone, claimant_email stored for verification outreach.
-- ============================================================
ALTER TABLE public.venue_claims
  ADD COLUMN IF NOT EXISTS claimant_name TEXT,
  ADD COLUMN IF NOT EXISTS claimant_role TEXT CHECK (claimant_role IN ('owner', 'manager', 'marketing', 'operations', 'other')),
  ADD COLUMN IF NOT EXISTS claimant_phone TEXT,
  ADD COLUMN IF NOT EXISTS claimant_email TEXT,
  ADD COLUMN IF NOT EXISTS relationship_notes TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Make verification_method have a sensible default if not explicitly provided
ALTER TABLE public.venue_claims
  ALTER COLUMN verification_method SET DEFAULT 'manual';

-- Relax or update status check constraint to include needs_more_information
DO $$
BEGIN
  ALTER TABLE public.venue_claims DROP CONSTRAINT IF EXISTS venue_claims_status_check;
  ALTER TABLE public.venue_claims ADD CONSTRAINT venue_claims_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'needs_more_information'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- 3. Venue Change Requests ("Something incorrect?" feedback loop)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.venue_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_phone TEXT,
  category TEXT NOT NULL CHECK (category IN ('wrong_price', 'wrong_hours', 'wrong_location', 'wrong_photo', 'wrong_category', 'wrong_description', 'closed_temporarily', 'permanently_closed', 'other')),
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_change_requests_venue ON public.venue_change_requests(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_change_requests_status ON public.venue_change_requests(status);

-- ============================================================
-- 4. Venue Photos Moderation Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.venue_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  photo_type TEXT NOT NULL DEFAULT 'interior' CHECK (photo_type IN ('cover', 'interior', 'food', 'experience', 'exterior')),
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_photos_venue ON public.venue_photos(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_photos_status ON public.venue_photos(status);

-- ============================================================
-- 5. Helper Function: Check Venue Partner
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_venue_partner(p_venue_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.venue_roles
    WHERE venue_id = p_venue_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ============================================================
-- 6. Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.venue_change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit change requests" ON public.venue_change_requests;
CREATE POLICY "Anyone can submit change requests"
  ON public.venue_change_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Submitter can view own change requests" ON public.venue_change_requests;
CREATE POLICY "Submitter can view own change requests"
  ON public.venue_change_requests FOR SELECT TO authenticated
  USING (auth.uid() = submitter_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage change requests" ON public.venue_change_requests;
CREATE POLICY "Admins can manage change requests"
  ON public.venue_change_requests FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.venue_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved photos" ON public.venue_photos;
CREATE POLICY "Public can view approved photos"
  ON public.venue_photos FOR SELECT
  USING (status = 'approved' OR public.is_venue_partner(venue_id) OR public.is_admin());

DROP POLICY IF EXISTS "Partners can insert photos" ON public.venue_photos;
CREATE POLICY "Partners can insert photos"
  ON public.venue_photos FOR INSERT TO authenticated
  WITH CHECK (public.is_venue_partner(venue_id) OR public.is_admin());

DROP POLICY IF EXISTS "Partners and admins can update photos" ON public.venue_photos;
CREATE POLICY "Partners and admins can update photos"
  ON public.venue_photos FOR UPDATE TO authenticated
  USING (public.is_venue_partner(venue_id) OR public.is_admin())
  WITH CHECK (public.is_venue_partner(venue_id) OR public.is_admin());

-- Venue Claims RLS updates:
DROP POLICY IF EXISTS "Users can view their own claims" ON public.venue_claims;
CREATE POLICY "Users can view their own claims"
  ON public.venue_claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all claims" ON public.venue_claims;
CREATE POLICY "Admins can manage all claims"
  ON public.venue_claims FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
