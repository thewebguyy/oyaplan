-- Phase 9: Growth Platform
-- Provides universal attribution, referral tracking, and global leaderboards.

-- 1. Campaign Attribution (Stitching)
CREATE TABLE IF NOT EXISTS public.attribution_sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referrer_code TEXT,
    utm_source TEXT, 
    utm_medium TEXT, 
    utm_campaign TEXT, 
    utm_content TEXT, 
    utm_term TEXT,
    landing_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    converted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_attribution_session ON public.attribution_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_attribution_utm ON public.attribution_sessions(utm_campaign, utm_source);

-- 2. Referral Ledger (Milestone & Fraud Tracking)
CREATE TABLE IF NOT EXISTS public.referral_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone TEXT NOT NULL CHECK (milestone IN ('invite_opened', 'signup', 'profile_created', 'first_forge', 'first_share', 'spend_submitted', 'retained_30d')),
    fraud_score TEXT NOT NULL DEFAULT 'safe' CHECK (fraud_score IN ('safe', 'low', 'medium', 'high', 'critical')),
    fraud_flags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(referrer_id, referee_id) -- Prevent duplicate ledgers for the same pair
);

CREATE INDEX IF NOT EXISTS idx_referral_ledger_milestone ON public.referral_ledger(milestone);
CREATE INDEX IF NOT EXISTS idx_referral_ledger_fraud ON public.referral_ledger(fraud_score);

-- 3. Referral Codes
CREATE TABLE IF NOT EXISTS public.referral_codes (
    code TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Global Leaderboards
CREATE TABLE IF NOT EXISTS public.global_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_type TEXT NOT NULL CHECK (board_type IN ('top_scouts', 'top_referrers', 'top_contributors', 'top_venues')),
    entity_id UUID NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    rank_position INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(board_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_global_leaderboards_rank ON public.global_leaderboards(board_type, rank_position);

-- 5. Row Level Security
ALTER TABLE public.attribution_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referral codes" ON public.referral_codes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public can read leaderboards" ON public.global_leaderboards FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins read attribution" ON public.attribution_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins read ledger" ON public.referral_ledger FOR SELECT TO authenticated USING (true);
