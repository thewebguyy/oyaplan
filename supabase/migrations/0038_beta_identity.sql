-- Migration 0038: Beta Identity Infrastructure
-- Pre-September launch identity, access control, badge assignment, and invitation tracking.

-- 1. Extend profiles table with beta identity attributes
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_badge TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS beta_joined_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS beta_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE;

-- Add check constraint to enforce valid profile badge values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_profiles_profile_badge'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT check_profiles_profile_badge
        CHECK (profile_badge IS NULL OR profile_badge IN ('founding_beta', 'founding_contributor', 'ambassador', 'staff'));
    END IF;
END $$;

-- 2. Create approved_beta_users table
CREATE TABLE IF NOT EXISTS public.approved_beta_users (
    email TEXT PRIMARY KEY,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by TEXT DEFAULT 'admin',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    notes TEXT
);

-- Enable RLS on approved_beta_users
ALTER TABLE public.approved_beta_users ENABLE ROW LEVEL SECURITY;

-- Service role / admins can view approved_beta_users
CREATE POLICY "Admins can view approved_beta_users" ON public.approved_beta_users
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 3. Idempotent Beta Badge Assignment Function
CREATE OR REPLACE FUNCTION public.assign_beta_badge(p_user_id UUID, p_email TEXT)
RETURNS VOID AS $$
DECLARE
    v_approved BOOLEAN := FALSE;
BEGIN
    -- Check if user's email is in approved_beta_users
    SELECT EXISTS (
        SELECT 1 FROM public.approved_beta_users WHERE LOWER(email) = LOWER(p_email)
    ) INTO v_approved;

    -- If email matches or approved_beta_users table is empty (beta launch mode):
    IF v_approved OR NOT EXISTS (SELECT 1 FROM public.approved_beta_users) THEN
        -- Only assign badge if profile_badge is currently NULL (idempotent)
        UPDATE public.profiles
        SET 
            profile_badge = COALESCE(profile_badge, 'founding_beta'),
            beta_joined_at = COALESCE(beta_joined_at, NOW())
        WHERE id = p_user_id AND profile_badge IS NULL;

        -- Record accepted_at once (idempotent) in approved_beta_users if present
        UPDATE public.approved_beta_users
        SET accepted_at = COALESCE(accepted_at, NOW())
        WHERE LOWER(email) = LOWER(p_email);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update handle_new_user() trigger function to call assign_beta_badge()
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- Insert base profile & reputation
    INSERT INTO public.profiles (id, display_name)
    VALUES (new.id, 'Explorer')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_reputation (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Assign beta badge idempotently if approved
    IF new.email IS NOT NULL THEN
        PERFORM public.assign_beta_badge(new.id, new.email);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
