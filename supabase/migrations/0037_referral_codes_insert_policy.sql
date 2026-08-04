-- Migration 0037: Add INSERT policy for referral_codes

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own referral codes" ON public.referral_codes;
CREATE POLICY "Users can insert own referral codes" 
  ON public.referral_codes 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);
