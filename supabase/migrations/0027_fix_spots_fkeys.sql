-- Migration 0027: Fix Phase 1 foreign keys still pointing to spots_old
-- When spots was renamed to spots_old in migration 0012, PostgreSQL automatically
-- updated the foreign key references from shared_plans and plan_requests to point
-- to spots_old. Since new venues are inserted into venues, saving a plan with a new
-- venue throws a foreign key constraint violation.

DO $$
DECLARE
    constraint_name_shared text;
    constraint_name_requests text;
BEGIN
    -- Find and drop FK from shared_plans
    SELECT conname INTO constraint_name_shared
    FROM pg_constraint
    WHERE conrelid = 'public.shared_plans'::regclass
      AND confrelid = 'public.spots_old'::regclass;

    IF constraint_name_shared IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.shared_plans DROP CONSTRAINT ' || constraint_name_shared;
    END IF;

    -- Find and drop FK from plan_requests
    SELECT conname INTO constraint_name_requests
    FROM pg_constraint
    WHERE conrelid = 'public.plan_requests'::regclass
      AND confrelid = 'public.spots_old'::regclass;

    IF constraint_name_requests IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.plan_requests DROP CONSTRAINT ' || constraint_name_requests;
    END IF;
    
    -- Fallback: drop standard default constraint names
    ALTER TABLE public.shared_plans DROP CONSTRAINT IF EXISTS shared_plans_spot_id_fkey;
    ALTER TABLE public.plan_requests DROP CONSTRAINT IF EXISTS plan_requests_top_spot_id_fkey;
END $$;

-- Point them to venues instead
ALTER TABLE public.shared_plans ADD CONSTRAINT shared_plans_spot_id_fkey FOREIGN KEY (spot_id) REFERENCES public.venues(id) ON DELETE CASCADE;
ALTER TABLE public.plan_requests ADD CONSTRAINT plan_requests_top_spot_id_fkey FOREIGN KEY (top_spot_id) REFERENCES public.venues(id) ON DELETE SET NULL;
