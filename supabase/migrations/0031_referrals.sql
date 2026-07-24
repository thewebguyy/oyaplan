-- Migration 0031: Referral System for Viral Loop
-- Tracks referrals between users and stores credits/incentives.

CREATE TABLE IF NOT EXISTS public.referrals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id    UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referral_credits (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_ngn          INTEGER NOT NULL DEFAULT 2000, -- e.g. ₦2,000 credit
    expires_at          TIMESTAMPTZ,
    used                BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_credits_user ON public.referral_credits(user_id);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY "Users can view their own referrals" ON public.referrals
    FOR SELECT TO authenticated USING (auth.uid() = referrer_user_id);

CREATE POLICY "Users can view their own credits" ON public.referral_credits
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Insert policies
CREATE POLICY "Allow authenticated inserts for referrals" ON public.referrals
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = referred_user_id OR auth.uid() = referrer_user_id);

CREATE POLICY "Allow authenticated inserts for credits" ON public.referral_credits
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
