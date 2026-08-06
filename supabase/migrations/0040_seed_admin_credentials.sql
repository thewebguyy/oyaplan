-- Migration 0040: Seed Admin Accounts & Passwords in Supabase Auth

INSERT INTO public.admin_users (email, role)
VALUES
    ('pstmax@gmail.com', 'owner'),
    ('temi@oyaplan.com', 'admin')
ON CONFLICT (email) DO NOTHING;

DO $$
DECLARE
  v_cto_id UUID;
  v_coo_id UUID;
BEGIN
  -- 1. CTO Account: pstmax@gmail.com
  SELECT id INTO v_cto_id FROM auth.users WHERE LOWER(email) = 'pstmax@gmail.com';
  
  IF v_cto_id IS NULL THEN
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
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'pstmax@gmail.com',
      crypt('OyaPlan#Admin2026!Cto', gen_salt('bf', 10)),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('OyaPlan#Admin2026!Cto', gen_salt('bf', 10)),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmation_token = '',
        recovery_token = '',
        email_change_token_new = '',
        email_change = '',
        email_change_token_current = '',
        phone_change = '',
        phone_change_token = '',
        reauthentication_token = '',
        is_anonymous = false,
        raw_user_meta_data = jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false)
    WHERE id = v_cto_id;
  END IF;

  -- 2. COO Account: temi@oyaplan.com
  SELECT id INTO v_coo_id FROM auth.users WHERE LOWER(email) = 'temi@oyaplan.com';
  
  IF v_coo_id IS NULL THEN
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
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'temi@oyaplan.com',
      crypt('OyaPlan#Admin2026!Coo', gen_salt('bf', 10)),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('email', 'temi@oyaplan.com', 'email_verified', true, 'phone_verified', false),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('OyaPlan#Admin2026!Coo', gen_salt('bf', 10)),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmation_token = '',
        recovery_token = '',
        email_change_token_new = '',
        email_change = '',
        email_change_token_current = '',
        phone_change = '',
        phone_change_token = '',
        reauthentication_token = '',
        is_anonymous = false,
        raw_user_meta_data = jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false)
    WHERE id = v_coo_id;
  END IF;
END $$;
