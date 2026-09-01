-- Migration 0051: OyaSquad Reusable Planning Groups
-- Allows users to save recurring groups of people they plan outings with.

-- 1. planning_groups: Reusable group planning context
CREATE TABLE IF NOT EXISTS public.planning_groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    emoji       TEXT DEFAULT '⚡',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_group_name_length CHECK (char_length(name) BETWEEN 1 AND 60)
);

-- 2. planning_group_members: Lightweight member references
CREATE TABLE IF NOT EXISTS public.planning_group_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    UUID NOT NULL REFERENCES public.planning_groups(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    display_name TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_member_name_length CHECK (char_length(display_name) BETWEEN 1 AND 60)
);

-- 3. Link shared_plans to planning_groups
ALTER TABLE public.shared_plans 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.planning_groups(id) ON DELETE SET NULL;

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_shared_plans_group ON public.shared_plans(group_id);
CREATE INDEX IF NOT EXISTS idx_planning_groups_owner ON public.planning_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_planning_group_members_group ON public.planning_group_members(group_id);

-- 5. Row Level Security (RLS)
ALTER TABLE public.planning_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_group_members ENABLE ROW LEVEL SECURITY;

-- Owner-only access to planning_groups
DROP POLICY IF EXISTS "Owner can manage planning_groups" ON public.planning_groups;
CREATE POLICY "Owner can manage planning_groups" ON public.planning_groups
    FOR ALL TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Group owner can manage group members
DROP POLICY IF EXISTS "Group owner can manage members" ON public.planning_group_members;
CREATE POLICY "Group owner can manage members" ON public.planning_group_members
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.planning_groups WHERE id = group_id AND owner_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.planning_groups WHERE id = group_id AND owner_id = auth.uid()));
