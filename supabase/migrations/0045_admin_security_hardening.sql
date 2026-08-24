-- Migration 0045: Security Hardening for OyaPlan Control Center (Admin RLS)

-- 1. Create is_admin SQL function for database-level authorization
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. Restrict public.admin_users RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users" ON public.admin_users
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- 3. Restrict public.admin_activity RLS
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view and insert activity" ON public.admin_activity;
CREATE POLICY "Admins can view and insert activity" ON public.admin_activity
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Restrict public.sponsored_campaigns write RLS
ALTER TABLE public.sponsored_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin write on sponsored_campaigns" ON public.sponsored_campaigns;
CREATE POLICY "Allow admin write on sponsored_campaigns" ON public.sponsored_campaigns
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
