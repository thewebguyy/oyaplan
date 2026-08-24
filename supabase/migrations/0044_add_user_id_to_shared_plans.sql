-- Migration 0044: Add user_id and session_id to shared_plans for user attribution
ALTER TABLE public.shared_plans 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS session_id UUID DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_shared_plans_user ON public.shared_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_plans_session ON public.shared_plans(session_id);
