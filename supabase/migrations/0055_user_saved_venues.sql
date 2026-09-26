-- Migration 0055: User Saved Venues for cross-device personalization & synchronization
-- Description: Establishes a lightweight, RLS-secured table for persisting user-saved venues.

CREATE TABLE IF NOT EXISTS public.user_saved_venues (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, venue_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_saved_venues ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: Users can only read their own saved venues
DROP POLICY IF EXISTS "Users can read own saved venues" ON public.user_saved_venues;
CREATE POLICY "Users can read own saved venues" 
ON public.user_saved_venues FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Insert Policy: Users can only insert their own saved venues
DROP POLICY IF EXISTS "Users can insert own saved venues" ON public.user_saved_venues;
CREATE POLICY "Users can insert own saved venues" 
ON public.user_saved_venues FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Delete Policy: Users can only delete their own saved venues
DROP POLICY IF EXISTS "Users can delete own saved venues" ON public.user_saved_venues;
CREATE POLICY "Users can delete own saved venues" 
ON public.user_saved_venues FOR DELETE 
USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_saved_venues_user ON public.user_saved_venues(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_venues_saved_at ON public.user_saved_venues(user_id, saved_at DESC);
