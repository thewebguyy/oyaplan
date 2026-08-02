-- Migration 0036: Beta Database Readiness Fixes
-- Addresses critical privacy leaks and missing constraints for the beta launch.

-- 1. Fix Critical Privacy Leak in Profiles
-- Drop the policy that allowed anyone to read all user emails.
DROP POLICY IF EXISTS "Public can read profiles (limited)" ON public.profiles;

-- 2. Update the new user trigger to stop leaking emails into display_name
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Replaced new.email with a neutral default to prevent PII leaks
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, 'Explorer');
  
  INSERT INTO public.user_reputation (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Retroactively scrub any emails that already leaked into display_name
UPDATE public.profiles
SET display_name = 'Explorer'
WHERE display_name LIKE '%@%';

-- 4. Add Database-Level CHECK Constraints for Reliability

-- shared_plans
ALTER TABLE public.shared_plans
ADD CONSTRAINT check_shared_plans_budget CHECK (budget >= 0),
ADD CONSTRAINT check_shared_plans_squad CHECK (squad_size > 0);

-- user_preferences
ALTER TABLE public.user_preferences
ADD CONSTRAINT check_user_preferences_budget CHECK (default_budget >= 0),
ADD CONSTRAINT check_user_preferences_squad CHECK (default_squad_size > 0);

-- referral_credits
ALTER TABLE public.referral_credits
ADD CONSTRAINT check_referral_credits_amount CHECK (amount_ngn >= 0);

-- plan_requests
ALTER TABLE public.plan_requests
ADD CONSTRAINT check_plan_requests_budget CHECK (budget >= 0),
ADD CONSTRAINT check_plan_requests_squad CHECK (squad_size > 0);

-- NOTE: Foreign key cascading was intentionally omitted based on product review.
-- Deleting a venue should NOT cascade and destroy a user's historical shared plans.
-- The default RESTRICT behavior is correct.
