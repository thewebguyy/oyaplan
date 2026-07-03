-- Migration 0014: Row Level Security for Phase 2 tables
-- All new tables created in 0012 require explicit RLS policies.
-- Without these, the anon key exposes all venue pricing data.
-- Rule: public read for catalog data; insert-only anon for evidence submissions;
--       admin (authenticated) for sensitive pricing audit data.

-- ============================================================
-- 1. venues (public read catalog)
-- ============================================================
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active venues" ON public.venues;
CREATE POLICY "Public read active venues"
  ON public.venues FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Authenticated read all venues" ON public.venues;
CREATE POLICY "Authenticated read all venues"
  ON public.venues FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated update venues" ON public.venues;
CREATE POLICY "Authenticated update venues"
  ON public.venues FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated insert venues" ON public.venues;
CREATE POLICY "Authenticated insert venues"
  ON public.venues FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 2. menu_items (public read; admin write)
-- ============================================================
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read available menu items" ON public.menu_items;
CREATE POLICY "Public read available menu items"
  ON public.menu_items FOR SELECT TO anon, authenticated
  USING (is_available = true);

DROP POLICY IF EXISTS "Authenticated read all menu items" ON public.menu_items;
CREATE POLICY "Authenticated read all menu items"
  ON public.menu_items FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated write menu items" ON public.menu_items;
CREATE POLICY "Authenticated write menu items"
  ON public.menu_items FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. price_evidence (anon insert pending; admin read all + update)
-- ============================================================
ALTER TABLE public.price_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert pending evidence" ON public.price_evidence;
CREATE POLICY "Anon insert pending evidence"
  ON public.price_evidence FOR INSERT TO anon
  WITH CHECK (verification_status = 'pending');

DROP POLICY IF EXISTS "Authenticated read all evidence" ON public.price_evidence;
CREATE POLICY "Authenticated read all evidence"
  ON public.price_evidence FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated update evidence" ON public.price_evidence;
CREATE POLICY "Authenticated update evidence"
  ON public.price_evidence FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated insert evidence" ON public.price_evidence;
CREATE POLICY "Authenticated insert evidence"
  ON public.price_evidence FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 4. price_audit_logs (admin read; no public access)
-- ============================================================
ALTER TABLE public.price_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read audit logs" ON public.price_audit_logs;
CREATE POLICY "Authenticated read audit logs"
  ON public.price_audit_logs FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated insert audit logs" ON public.price_audit_logs;
CREATE POLICY "Authenticated insert audit logs"
  ON public.price_audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 5. city_transport_rates (public read; admin write)
-- ============================================================
ALTER TABLE public.city_transport_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read transport rates" ON public.city_transport_rates;
CREATE POLICY "Public read transport rates"
  ON public.city_transport_rates FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated write transport rates" ON public.city_transport_rates;
CREATE POLICY "Authenticated write transport rates"
  ON public.city_transport_rates FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 6. transport_route_overrides (public read; admin write)
-- ============================================================
ALTER TABLE public.transport_route_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read transport overrides" ON public.transport_route_overrides;
CREATE POLICY "Public read transport overrides"
  ON public.transport_route_overrides FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated write transport overrides" ON public.transport_route_overrides;
CREATE POLICY "Authenticated write transport overrides"
  ON public.transport_route_overrides FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 7. countries / cities / districts (public read catalog)
-- ============================================================
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read countries" ON public.countries;
CREATE POLICY "Public read countries"
  ON public.countries FOR SELECT TO anon, authenticated
  USING (true);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read cities" ON public.cities;
CREATE POLICY "Public read cities"
  ON public.cities FOR SELECT TO anon, authenticated
  USING (true);

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read districts" ON public.districts;
CREATE POLICY "Public read districts"
  ON public.districts FOR SELECT TO anon, authenticated
  USING (true);
