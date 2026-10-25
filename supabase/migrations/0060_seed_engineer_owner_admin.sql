-- Migration 0060: Add Engineer/Owner Account to admin_users Table

INSERT INTO public.admin_users (email, role)
VALUES
    ('olabodewebdesigns02@gmail.com', 'owner')
ON CONFLICT (email) DO UPDATE
SET role = 'owner';
