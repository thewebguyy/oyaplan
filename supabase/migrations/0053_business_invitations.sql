-- Migration 0053: Business Invitations & Secure Claim Tokens
-- Establishes primitives for OyaPlan for Business claim invitations.
-- Implements hashed single-use tokens, explicit expiration, ops funnel tracking,
-- and safe non-privileged invitation preview lookups.

-- ============================================================
-- 1. Make user_id nullable on venue_claims
-- (Allows OyaPlan operations to create an invitation before the operator registers)
-- ============================================================
ALTER TABLE public.venue_claims 
  ALTER COLUMN user_id DROP NOT NULL;

-- ============================================================
-- 2. Add cryptographic invitation token columns & funnel tracking
-- ============================================================
ALTER TABLE public.venue_claims
  ADD COLUMN IF NOT EXISTS invitation_token_hash TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invitation_opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consumed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_venue_claims_token_hash 
  ON public.venue_claims(invitation_token_hash);

-- ============================================================
-- 3. Extend status check constraint preserving all existing statuses
-- Lifecycle: invited -> opened -> authenticated -> pending -> approved / rejected / needs_more_information
-- Invalidated states: revoked, expired
-- ============================================================
DO $$
BEGIN
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
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- 4. Secure Helper Functions for Token Lookup & Funnel Tracking
-- (SECURITY DEFINER functions with search_path = public to safely
-- allow token lookup without exposing privileged user records)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_invitation_by_token_hash(p_token_hash TEXT)
RETURNS TABLE (
  claim_id UUID,
  venue_id UUID,
  status TEXT,
  token_expires_at TIMESTAMPTZ,
  claimant_email TEXT,
  claimant_role TEXT,
  venue_name TEXT,
  venue_address TEXT,
  venue_category TEXT,
  has_cover BOOLEAN,
  menu_item_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vc.id AS claim_id,
    vc.venue_id,
    vc.status,
    vc.token_expires_at,
    vc.claimant_email,
    vc.claimant_role,
    v.name AS venue_name,
    v.address AS venue_address,
    v.category::TEXT AS venue_category,
    (v.cover_url IS NOT NULL AND length(v.cover_url) > 0) AS has_cover,
    COALESCE(
      (SELECT count(*) FROM public.menu_items mi WHERE mi.venue_id = v.id),
      0::BIGINT
    ) AS menu_item_count
  FROM public.venue_claims vc
  JOIN public.venues v ON v.id = vc.venue_id
  WHERE vc.invitation_token_hash = p_token_hash
    AND vc.status IN ('invited', 'opened', 'authenticated')
    AND (vc.token_expires_at IS NULL OR vc.token_expires_at > NOW())
    AND vc.consumed_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_invitation_opened(p_token_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.venue_claims
  SET 
    status = CASE WHEN status = 'invited' THEN 'opened' ELSE status END,
    invitation_opened_at = COALESCE(invitation_opened_at, NOW())
  WHERE invitation_token_hash = p_token_hash
    AND status IN ('invited', 'opened')
    AND (token_expires_at IS NULL OR token_expires_at > NOW())
    AND consumed_at IS NULL;
  
  RETURN FOUND;
END;
$$;
