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
        updated_at
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
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET encrypted_password = v_encrypted_password,
        email_confirmed_at = COALESCE(auth.users.email_confirmed_at, NOW()),
        updated_at = NOW();

    -- Link email identity provider details in auth.identities
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        v_user_id::text,
        v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', 'admin@oyaplan.app'),
        'email',
        NULL,
        NOW(),
        NOW()
    )
    ON CONFLICT (provider, id) DO NOTHING;

    RAISE NOTICE 'Admin user admin@oyaplan.app successfully seeded.';
END $$;
