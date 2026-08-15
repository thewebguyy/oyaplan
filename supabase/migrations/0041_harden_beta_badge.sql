-- Migration 0041: Harden beta badge assignment
-- Removes the fail-open fallback that would grant every new signup a badge
-- if the approved_beta_users table were empty. No approval record → no badge.

CREATE OR REPLACE FUNCTION public.assign_beta_badge(p_user_id UUID, p_email TEXT)
RETURNS VOID AS $$
DECLARE
    v_approved BOOLEAN := FALSE;
BEGIN
    -- Check if user's email is in approved_beta_users
    SELECT EXISTS (
        SELECT 1 FROM public.approved_beta_users WHERE LOWER(email) = LOWER(p_email)
    ) INTO v_approved;

    -- Only assign badge if explicitly approved — no fail-open fallback
    IF v_approved THEN
        UPDATE public.profiles
        SET 
            profile_badge = COALESCE(profile_badge, 'founding_beta'),
            beta_joined_at = COALESCE(beta_joined_at, NOW())
        WHERE id = p_user_id AND profile_badge IS NULL;

        -- Record accepted_at once (idempotent) in approved_beta_users
        UPDATE public.approved_beta_users
        SET accepted_at = COALESCE(accepted_at, NOW())
        WHERE LOWER(email) = LOWER(p_email);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
