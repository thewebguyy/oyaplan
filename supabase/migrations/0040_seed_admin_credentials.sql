-- Migration 0040: Seed Admin Accounts & Passwords in Supabase Auth

-- 1. Ensure admin_users table entries exist
INSERT INTO public.admin_users (email, role)
VALUES
    ('pstmax@gmail.com', 'owner'),
    ('temi@oyaplan.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Create or update CTO account in auth.users
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
  crypt('OyaPlan#Admin2026!Cto', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE
SET encrypted_password = crypt('OyaPlan#Admin2026!Cto', gen_salt('bf'));

-- 3. Create or update COO account in auth.users
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
  crypt('OyaPlan#Admin2026!Coo', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE
SET encrypted_password = crypt('OyaPlan#Admin2026!Coo', gen_salt('bf'));
