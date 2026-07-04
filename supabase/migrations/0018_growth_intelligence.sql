-- Phase 5: Growth Intelligence Flywheel
-- Implements Scout Missions, Data Health, and Predictive Tracking

-- 1. District Health & Intelligence Tracking
CREATE TABLE IF NOT EXISTS public.district_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
    coverage_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    freshness_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    volatility_index NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    inflation_rate_30d NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_district_health_logs_district ON public.district_health_logs(district_id);
CREATE INDEX IF NOT EXISTS idx_district_health_logs_logged_at ON public.district_health_logs(logged_at);

-- 2. Enhanced Venue Data Tracking (Missing Data Detection)
ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS has_parking BOOLEAN,
ADD COLUMN IF NOT EXISTS menu_completeness_score INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS predicted_price_variance_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00;

-- 3. Scout Missions Engine
CREATE TABLE IF NOT EXISTS public.scout_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    mission_type TEXT NOT NULL CHECK (mission_type IN ('verify_price', 'upload_menu', 'verify_hours', 'check_status', 'detect_parking', 'full_digitization')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'critical')),
    priority_score INTEGER NOT NULL DEFAULT 0,
    base_reward_xp INTEGER NOT NULL DEFAULT 10,
    
    -- Priority Engine Calculation Factors
    factor_popularity INTEGER NOT NULL DEFAULT 0,
    factor_confidence_decay INTEGER NOT NULL DEFAULT 0,
    factor_prediction_variance INTEGER NOT NULL DEFAULT 0,
    factor_freshness INTEGER NOT NULL DEFAULT 0,
    factor_missing_data INTEGER NOT NULL DEFAULT 0,
    
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'completed', 'expired')),
    claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    claimed_at TIMESTAMP WITH TIME ZONE,
    evidence_id UUID REFERENCES public.price_evidence(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scout_missions_venue ON public.scout_missions(venue_id);
CREATE INDEX IF NOT EXISTS idx_scout_missions_status ON public.scout_missions(status);
CREATE INDEX IF NOT EXISTS idx_scout_missions_priority ON public.scout_missions(priority_score DESC);

-- 4. Scout Missions RLS
ALTER TABLE public.scout_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view open missions" ON public.scout_missions FOR SELECT TO authenticated USING (status = 'open' OR auth.uid() = claimed_by);
CREATE POLICY "Users can claim missions" ON public.scout_missions FOR UPDATE TO authenticated USING (status = 'open' OR auth.uid() = claimed_by);
CREATE POLICY "Admins can manage missions" ON public.scout_missions FOR ALL TO authenticated USING (true); -- Placeholder admin bypass

-- 5. District Health Logs RLS
ALTER TABLE public.district_health_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read district health" ON public.district_health_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert district health" ON public.district_health_logs FOR INSERT TO authenticated USING (true);
