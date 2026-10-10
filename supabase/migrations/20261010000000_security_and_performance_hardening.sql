-- Migration 0059: Database Security & Performance Hardening
-- Resolves function search path vulnerabilities, revokes unnecessary RPC execution grants,
-- consolidates over-permissive RLS policies, optimizes RLS subqueries, and adds missing FK indexes.

-- ============================================================================
-- 1. HARDEN FUNCTION SEARCH PATHS & SECURITY DEFINER PRIVILEGES
-- ============================================================================

-- 1.1 jsonb_objs_count
CREATE OR REPLACE FUNCTION public.jsonb_objs_count(j jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
    cnt integer;
BEGIN
    SELECT count(*) INTO cnt FROM jsonb_object_keys(j);
    RETURN cnt;
END;
$function$;

-- 1.2 calculate_zone_fare_sql
CREATE OR REPLACE FUNCTION public.calculate_zone_fare_sql(origin_slug text, dest_slug text)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  zone1 TEXT;
  zone2 TEXT;
  non_other TEXT;
  base_one_way INTEGER := 0;
  round_trip INTEGER;
BEGIN
  IF origin_slug = dest_slug THEN
    RETURN 1200;
  END IF;

  zone1 := CASE origin_slug
    WHEN 'ikeja' THEN 'mainland'
    WHEN 'gbagada' THEN 'mainland'
    WHEN 'ogudu' THEN 'mainland'
    WHEN 'agege' THEN 'mainland'
    WHEN 'maryland' THEN 'mainland'
    WHEN 'yaba' THEN 'central'
    WHEN 'surulere' THEN 'central'
    WHEN 'ebute-metta' THEN 'central'
    WHEN 'lekki-phase-1' THEN 'island'
    WHEN 'vi' THEN 'island'
    WHEN 'ikoyi' THEN 'island'
    WHEN 'ajah' THEN 'island'
    WHEN 'chevron' THEN 'island'
    WHEN 'apapa' THEN 'other'
    WHEN 'festac' THEN 'other'
    ELSE 'other'
  END;

  zone2 := CASE dest_slug
    WHEN 'ikeja' THEN 'mainland'
    WHEN 'gbagada' THEN 'mainland'
    WHEN 'ogudu' THEN 'mainland'
    WHEN 'agege' THEN 'mainland'
    WHEN 'maryland' THEN 'mainland'
    WHEN 'yaba' THEN 'central'
    WHEN 'surulere' THEN 'central'
    WHEN 'ebute-metta' THEN 'central'
    WHEN 'lekki-phase-1' THEN 'island'
    WHEN 'vi' THEN 'island'
    WHEN 'ikoyi' THEN 'island'
    WHEN 'ajah' THEN 'island'
    WHEN 'chevron' THEN 'island'
    WHEN 'apapa' THEN 'other'
    WHEN 'festac' THEN 'other'
    ELSE 'other'
  END;

  IF zone1 = 'other' OR zone2 = 'other' THEN
    non_other := CASE WHEN zone1 = 'other' THEN zone2 ELSE zone1 END;
    base_one_way := CASE non_other
      WHEN 'other' THEN 2500
      WHEN 'central' THEN 2500
      WHEN 'mainland' THEN 3500
      WHEN 'island' THEN 4500
      ELSE 2500
    END;
    base_one_way := base_one_way + 1500;
  ELSIF zone1 = zone2 THEN
    base_one_way := 2500;
  ELSIF (zone1 = 'mainland' AND zone2 = 'central')
     OR (zone1 = 'central' AND zone2 = 'mainland') THEN
    base_one_way := 3500;
  ELSIF (zone1 = 'central' AND zone2 = 'island')
     OR (zone1 = 'island' AND zone2 = 'central') THEN
    base_one_way := 4500;
  ELSIF (zone1 = 'mainland' AND zone2 = 'island')
     OR (zone1 = 'island' AND zone2 = 'mainland') THEN
    base_one_way := 8000;
  END IF;

  round_trip := base_one_way * 2;
  RETURN (ROUND(round_trip::NUMERIC / 500) * 500)::INTEGER;
END;
$function$;

-- 1.3 assign_beta_badge
CREATE OR REPLACE FUNCTION public.assign_beta_badge(p_user_id uuid, p_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
    v_approved BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.approved_beta_users WHERE LOWER(email) = LOWER(p_email)
    ) INTO v_approved;

    IF v_approved THEN
        UPDATE public.profiles
        SET profile_badge = COALESCE(profile_badge, 'founding_beta'),
            beta_joined_at = COALESCE(beta_joined_at, NOW())
        WHERE id = p_user_id AND profile_badge IS NULL;

        UPDATE public.approved_beta_users
        SET accepted_at = COALESCE(accepted_at, NOW())
        WHERE LOWER(email) = LOWER(p_email);
    END IF;
END;
$function$;

-- 1.4 handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', new.email, 'Explorer'))
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_reputation (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  IF new.email IS NOT NULL THEN
    PERFORM public.assign_beta_badge(new.id, new.email);
  END IF;
  
  RETURN new;
END;
$function$;

-- 1.5 Revoke RPC execution privileges on internal-only functions
REVOKE EXECUTE ON FUNCTION public.assign_beta_badge(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_beta_tester_emails() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- Restore execution grants for service_role and postgres on internal functions
GRANT EXECUTE ON FUNCTION public.assign_beta_badge(uuid, text) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.get_beta_tester_emails() TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role, postgres;

-- ============================================================================
-- 2. RLS POLICY CONSOLIDATION & SECURITY CORRECTIONS
-- ============================================================================

-- 2.1 approved_beta_users: Revoke public read; restrict SELECT to admins
DROP POLICY IF EXISTS "Allow public read on approved_beta_users" ON public.approved_beta_users;
DROP POLICY IF EXISTS "Allow authenticated access on approved_beta_users" ON public.approved_beta_users;
DROP POLICY IF EXISTS "Admins can view approved_beta_users" ON public.approved_beta_users;

CREATE POLICY "Admins can view approved_beta_users" ON public.approved_beta_users
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        )
    );

-- 2.2 spots: Restrict UPDATE/ALL policy so authenticated users cannot overwrite spots
DROP POLICY IF EXISTS "Allow authenticated update on spots" ON public.spots;
CREATE POLICY "Admins can update spots" ON public.spots
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        )
    );

-- 2.3 price_flags: Consolidate duplicate anonymous insert policy
DROP POLICY IF EXISTS "Anyone can insert price flags" ON public.price_flags;

-- 2.4 spot_submissions_raw: Consolidate duplicate policies
DROP POLICY IF EXISTS "Allow authenticated access on spot_submissions_raw" ON public.spot_submissions_raw;

-- ============================================================================
-- 3. RLS EXPRESSION SUBQUERY OPTIMIZATION (auth.uid() -> (SELECT auth.uid()))
-- ============================================================================

-- 3.1 profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles 
    FOR SELECT USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles 
    FOR UPDATE USING ((SELECT auth.uid()) = id);

-- 3.2 user_preferences
DROP POLICY IF EXISTS "Users can read own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;

CREATE POLICY "Users can read own preferences" ON public.user_preferences 
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences 
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences 
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- 3.3 referral_codes
DROP POLICY IF EXISTS "Users can read own referral codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Users can insert own referral codes" ON public.referral_codes;

CREATE POLICY "Users can read own referral codes" ON public.referral_codes 
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own referral codes" ON public.referral_codes 
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

-- 3.4 user_saved_plans
DROP POLICY IF EXISTS "Users can read own saved plans" ON public.user_saved_plans;
DROP POLICY IF EXISTS "Users can insert own saved plans" ON public.user_saved_plans;
DROP POLICY IF EXISTS "Users can update own saved plans" ON public.user_saved_plans;
DROP POLICY IF EXISTS "Users can delete own saved plans" ON public.user_saved_plans;

CREATE POLICY "Users can read own saved plans" ON public.user_saved_plans
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own saved plans" ON public.user_saved_plans
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own saved plans" ON public.user_saved_plans
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own saved plans" ON public.user_saved_plans
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- 4. MISSING FOREIGN KEY COVERING INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_plan_requests_top_spot_id ON public.plan_requests(top_spot_id);
CREATE INDEX IF NOT EXISTS idx_shared_plans_spot_id ON public.shared_plans(spot_id);
CREATE INDEX IF NOT EXISTS idx_spots_area_id ON public.spots(area_id);
CREATE INDEX IF NOT EXISTS idx_attribution_sessions_user_id ON public.attribution_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_digitization_queue_venue_id ON public.menu_digitization_queue(venue_id);
CREATE INDEX IF NOT EXISTS idx_menu_digitization_queue_submitted_by ON public.menu_digitization_queue(submitted_by);
CREATE INDEX IF NOT EXISTS idx_price_flags_spot_id ON public.price_flags(spot_id);
CREATE INDEX IF NOT EXISTS idx_reputation_events_user_id ON public.reputation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_campaigns_venue_id ON public.sponsored_campaigns(venue_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_plans_shared_plan_id ON public.user_saved_plans(shared_plan_id);
CREATE INDEX IF NOT EXISTS idx_venue_edit_requests_venue_id ON public.venue_edit_requests(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_edit_requests_user_id ON public.venue_edit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_roles_user_id ON public.venue_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_planning_group_members_user_id ON public.planning_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_transport_route_overrides_dest ON public.transport_route_overrides(destination_area_id);
CREATE INDEX IF NOT EXISTS idx_referral_ledger_referee ON public.referral_ledger(referee_id);
