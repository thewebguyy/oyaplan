-- Migration 0057: Ensure Venue Claims Columns & Schema Cache Reload
-- Guarantees that public.venue_claims has all required verification and identity columns:
-- claimant_name, claimant_role, claimant_phone, claimant_email, relationship_notes, admin_notes, rejection_reason, reviewed_by, reviewed_at.
-- Emits PostgREST schema cache reload notification.

DO $$
BEGIN
  -- Add columns if they do not exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'venue_claims') THEN
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

    -- Ensure verification_method has sensible default
    ALTER TABLE public.venue_claims
      ALTER COLUMN verification_method SET DEFAULT 'manual';

    -- Ensure status check constraint covers all valid lifecycle states
    ALTER TABLE public.venue_claims DROP CONSTRAINT IF EXISTS venue_claims_status_check;
    ALTER TABLE public.venue_claims ADD CONSTRAINT venue_claims_status_check
      CHECK (status IN (
        'invited',
        'opened',
        'authenticated',
        'pending',
        'approved',
        'rejected',
        'needs_more_information',
        'revoked',
        'expired'
      ));
  END IF;
END $$;

-- Reload PostgREST schema cache to ensure claimant_email and adjacent columns are visible immediately
NOTIFY pgrst, 'reload schema';
