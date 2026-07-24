-- Migration 0032: Fix User Saved Plans Upsert RLS Policy
-- Adds the missing UPDATE policy so that users can safely invoke upsert.

DROP POLICY IF EXISTS "Users can update own saved plans" ON public.user_saved_plans;
CREATE POLICY "Users can update own saved plans" 
  ON public.user_saved_plans FOR UPDATE 
  USING (auth.uid() = user_id);
