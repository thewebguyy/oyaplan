-- Migration 0053: Business Invitations & Secure Claim Tokens
-- Establishes primitives for OyaPlan for Business claim invitations.
-- Implements hashed single-use tokens, explicit expiration, ops funnel tracking,
-- race-condition-free atomic consumption, and safe non-privileged invitation preview lookups.

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

CREATE OR REPLACE FUNCTION public.mark_invitation_authenticated(p_token_hash TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.venue_claims
  SET 
    status = CASE WHEN status IN ('invited', 'opened') THEN 'authenticated' ELSE status END,
    user_id = COALESCE(user_id, p_user_id)
  WHERE invitation_token_hash = p_token_hash
    AND status IN ('invited', 'opened')
    AND (token_expires_at IS NULL OR token_expires_at > NOW())
    AND consumed_at IS NULL;

  RETURN FOUND;
END;
$$;

-- Atomic, race-condition-free invitation consumption
CREATE OR REPLACE FUNCTION public.consume_invitation_claim(
  p_token_hash TEXT,
  p_user_id UUID,
  p_claimant_name TEXT,
  p_claimant_role TEXT,
  p_claimant_phone TEXT,
  p_claimant_email TEXT,
  p_relationship_notes TEXT
)
RETURNS TABLE (
  claim_id UUID,
  venue_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claim_id UUID;
  v_venue_id UUID;
BEGIN
  -- Row-level locked atomic update:
  -- Only succeeds if matching token hash, unconsumed, unexpired, and in active invitation state
  UPDATE public.venue_claims
  SET 
    user_id = p_user_id,
    status = 'pending',
    claimant_name = trim(p_claimant_name),
    claimant_role = p_claimant_role,
    claimant_phone = trim(p_claimant_phone),
    claimant_email = lower(trim(p_claimant_email)),
    relationship_notes = NULLIF(trim(p_relationship_notes), ''),
    consumed_at = NOW(),
    claimed_at = NOW()
  WHERE invitation_token_hash = p_token_hash
    AND status IN ('invited', 'opened', 'authenticated')
    AND consumed_at IS NULL
    AND (token_expires_at IS NULL OR token_expires_at > NOW())
  RETURNING id, venue_claims.venue_id INTO v_claim_id, v_venue_id;

  -- If 0 rows matched (e.g. concurrent race condition or token expired), abort
  IF v_claim_id IS NULL THEN
    RETURN;
  END IF;

  -- Transition venue to claim_pending if currently unclaimed
  UPDATE public.venues
  SET partner_state = 'claim_pending'
  WHERE id = v_venue_id
    AND partner_state = 'unclaimed';

  RETURN QUERY SELECT v_claim_id, v_venue_id;
END;
$$;

-- ============================================================
-- 5. Least-Privilege EXECUTE Grants
-- ============================================================
REVOKE ALL ON FUNCTION public.get_invitation_by_token_hash(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token_hash(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.mark_invitation_opened(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_invitation_opened(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.mark_invitation_authenticated(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_invitation_authenticated(TEXT, UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.consume_invitation_claim(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_invitation_claim(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
