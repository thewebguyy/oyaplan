-- Migration 0029: Post-Outing Notification Log
-- Tracks which notifications have been sent to prevent duplicates.
-- A unique constraint on (plan_id, type) ensures idempotency —
-- the cron job can safely run multiple times without double-sending.

CREATE TABLE IF NOT EXISTS public.notification_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- The plan this notification was sent about
    plan_id         UUID NOT NULL REFERENCES public.shared_plans(id) ON DELETE CASCADE,
    -- user_id nullable: notification could be sent to anon (email from plan context)
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    -- Type of notification (e.g. 'post_outing_spend_request')
    type            TEXT NOT NULL,
    -- The email address the notification was sent to
    sent_to         TEXT,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One notification per (plan, type) pair — prevents double-sending
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_log_plan_type
    ON public.notification_log (plan_id, type);

CREATE INDEX IF NOT EXISTS idx_notification_log_user ON public.notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent ON public.notification_log(sent_at);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Only the service role (cron job) can insert notification logs
-- Regular users cannot read or write notification logs
CREATE POLICY "No public access to notification log"
    ON public.notification_log FOR ALL TO anon
    USING (false);
