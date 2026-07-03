-- Create OyaPlan Administrator Account
-- Email: admin@oyaplan.app
-- Password: ChangeMe123!
-- Idempotent setup: safe to run multiple times.

DO $$
DECLARE
    v_user_id UUID := 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'; -- Idempotent fixed UUID
    v_encrypted_password TEXT;
BEGIN
    -- Ensure pgcrypto extension is available for blowfish encryption
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- Encrypt the password hash
    v_encrypted_password := crypt('ChangeMe123!', gen_salt('bf', 10));

    -- Insert or update user details in auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        is_super_admin,
        is_anonymous,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        phone_change,
        phone_change_token,
        email_change_token_current,
        reauthentication_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        'admin@oyaplan.app',
        v_encrypted_password,
        NOW(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{}'::jsonb,
        NOW(),
        NOW(),
        FALSE,
        FALSE,
        '', -- confirmation_token
        '', -- recovery_token
        '', -- email_change_token_new
        '', -- email_change
        '', -- phone_change
        '', -- phone_change_token
        '', -- email_change_token_current
        ''  -- reauthentication_token
    )
    ON CONFLICT (id) DO UPDATE
    SET encrypted_password = v_encrypted_password,
        email_confirmed_at = COALESCE(auth.users.email_confirmed_at, NOW()),
        confirmation_token = '',
        recovery_token = '',
        email_change_token_new = '',
        email_change = '',
        updated_at = NOW();

    -- Link email identity provider details in auth.identities
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', 'admin@oyaplan.app', 'email_verified', true),
        'email',
        v_user_id::text,
        NOW(),
        NOW()
    )
    ON CONFLICT (provider, provider_id) DO NOTHING;

    RAISE NOTICE 'Admin user admin@oyaplan.app successfully seeded.';
END $$;

-- Allow authenticated users (admin role) to read internal monitoring tables
DROP POLICY IF EXISTS "Allow authenticated reads on plan_requests" ON public.plan_requests;
CREATE POLICY "Allow authenticated reads on plan_requests" 
ON public.plan_requests FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated reads on tester_observations" ON public.tester_observations;
CREATE POLICY "Allow authenticated reads on tester_observations" 
ON public.tester_observations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated reads on spot_suggestions" ON public.spot_suggestions;
CREATE POLICY "Allow authenticated reads on spot_suggestions" 
ON public.spot_suggestions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated reads on operator_inquiries" ON public.operator_inquiries;
CREATE POLICY "Allow authenticated reads on operator_inquiries" 
ON public.operator_inquiries FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated reads on price_flags" ON public.price_flags;
CREATE POLICY "Allow authenticated reads on price_flags" 
ON public.price_flags FOR SELECT TO authenticated USING (true);
