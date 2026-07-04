-- Phase 11: Identity Platform

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'planner' CHECK (role IN ('planner', 'scout', 'venue_operator', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Preferences
CREATE TYPE public.transport_preference AS ENUM ('uber', 'danfo', 'driving', 'any');

CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    default_budget INTEGER,
    default_squad_size INTEGER,
    default_transport public.transport_preference,
    favourite_vibes TEXT[] DEFAULT '{}',
    favourite_districts TEXT[] DEFAULT '{}',
    dietary_restrictions TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. OyaScore Foundation (Reputation)
CREATE TABLE IF NOT EXISTS public.user_reputation (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    planner_score INTEGER DEFAULT 0,
    scout_score INTEGER DEFAULT 0,
    venue_score INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reputation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    points_awarded INTEGER NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Saved Plans
CREATE TABLE IF NOT EXISTS public.user_saved_plans (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    shared_plan_id UUID REFERENCES public.shared_plans(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, shared_plan_id)
);

-- 5. Extend existing tables for Identity tracking (if missing)
-- plan_requests is essentially an analytics table, so we track session/user
ALTER TABLE public.plan_requests 
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_plan_requests_session ON public.plan_requests(session_id);
CREATE INDEX IF NOT EXISTS idx_plan_requests_user ON public.plan_requests(user_id);

-- 6. Row Level Security

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_plans ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile. Public can read display names for scouts/venues.
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Public can read profiles (limited)" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Preferences: Only the owner can read/write
CREATE POLICY "Users can read own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- User Reputation: Public can view scores, only system (service role) can write
CREATE POLICY "Public can read reputation" ON public.user_reputation FOR SELECT USING (true);
CREATE POLICY "Public can read reputation events" ON public.reputation_events FOR SELECT USING (true);

-- User Saved Plans: Only the owner can read/write
CREATE POLICY "Users can read own saved plans" ON public.user_saved_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved plans" ON public.user_saved_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved plans" ON public.user_saved_plans FOR DELETE USING (auth.uid() = user_id);

-- Profile Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.email);
  
  INSERT INTO public.user_reputation (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
