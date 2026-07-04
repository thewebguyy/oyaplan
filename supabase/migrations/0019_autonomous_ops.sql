-- Phase 7: Autonomous Operations & Intelligence Platform
-- Implements Knowledge Graph telemetry, Operational Alerts, and Platform AI Memory

-- 1. Operational Alerts
CREATE TABLE IF NOT EXISTS public.operational_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('confidence_drop', 'district_stale', 'mission_backlog', 'inflation_spike', 'scout_anomaly')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('venue', 'district', 'scout', 'system')),
    entity_id UUID,
    message TEXT NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operational_alerts_status ON public.operational_alerts(severity) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_operational_alerts_entity ON public.operational_alerts(entity_id);

-- 2. System Telemetry (For AI Orchestrator and Engine Performance)
CREATE TABLE IF NOT EXISTS public.system_telemetry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    execution_ms INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'fallback', 'hallucination_rejected', 'error')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_logs_metric ON public.system_telemetry_logs(metric_name);

-- 3. Scout Profile Expansions
ALTER TABLE public.scout_profiles
ADD COLUMN IF NOT EXISTS average_response_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_districts UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS false_submissions INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS scout_level INTEGER NOT NULL DEFAULT 1;

-- 4. User Preferences (For AI Concierge / Platform)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    favorite_districts UUID[] DEFAULT '{}',
    dietary_restrictions TEXT[] DEFAULT '{}',
    preferred_vibe TEXT,
    typical_budget INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Conversation Memory (For RAG and Session State)
CREATE TABLE IF NOT EXISTS public.conversation_memory (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_intent JSONB,
    suggested_plans JSONB,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_memory_user ON public.conversation_memory(user_id);

-- 6. Row Level Security Updates
ALTER TABLE public.operational_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read alerts" ON public.operational_alerts FOR SELECT TO authenticated USING (true); -- Placeholder admin bypass

ALTER TABLE public.system_telemetry_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read telemetry" ON public.system_telemetry_logs FOR SELECT TO authenticated USING (true);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own preferences" ON public.user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own preferences" ON public.user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own preferences" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own memory" ON public.conversation_memory FOR ALL TO authenticated USING (auth.uid() = user_id);
