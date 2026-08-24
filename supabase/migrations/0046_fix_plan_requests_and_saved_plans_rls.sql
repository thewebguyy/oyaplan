-- Migration 0046: Fix RLS policies on plan_requests and user_saved_plans
-- Allows plan generation logging and saved plans persistence to register in usage metrics.

-- 1. Enable RLS on plan_requests
ALTER TABLE public.plan_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow anonymous insert on plan_requests" ON public.plan_requests;
DROP POLICY IF EXISTS "Allow authenticated reads on plan_requests" ON public.plan_requests;
DROP POLICY IF EXISTS "Allow plan_requests insert" ON public.plan_requests;
DROP POLICY IF EXISTS "Allow plan_requests select" ON public.plan_requests;
DROP POLICY IF EXISTS "Allow plan_requests update" ON public.plan_requests;

-- Permissive Insert Policy for both anonymous and authenticated users
CREATE POLICY "Allow plan_requests insert" 
ON public.plan_requests 
FOR INSERT 
WITH CHECK (true);

-- Permissive Select Policy for authenticated/admin users
CREATE POLICY "Allow plan_requests select" 
ON public.plan_requests 
FOR SELECT 
USING (true);

-- Permissive Update Policy for identity merging
CREATE POLICY "Allow plan_requests update" 
ON public.plan_requests 
FOR UPDATE 
USING (true);

-- 2. Enable RLS on user_saved_plans
ALTER TABLE public.user_saved_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own saved plans" ON public.user_saved_plans;
DROP POLICY IF EXISTS "Users can insert own saved plans" ON public.user_saved_plans;
DROP POLICY IF EXISTS "Users can update own saved plans" ON public.user_saved_plans;
DROP POLICY IF EXISTS "Users can delete own saved plans" ON public.user_saved_plans;

CREATE POLICY "Users can read own saved plans" 
ON public.user_saved_plans 
FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.admin_users WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')));

CREATE POLICY "Users can insert own saved plans" 
ON public.user_saved_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.admin_users WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')));

CREATE POLICY "Users can update own saved plans" 
ON public.user_saved_plans 
FOR UPDATE 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.admin_users WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')));

CREATE POLICY "Users can delete own saved plans" 
ON public.user_saved_plans 
FOR DELETE 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.admin_users WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')));
