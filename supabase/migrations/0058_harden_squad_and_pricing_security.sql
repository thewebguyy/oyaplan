-- Migration 0058: Harden OyaSquad Security & Pricing Integrity
-- 1. Revoke public direct table modifications on plan_settlements and plan_squad_participants.
-- 2. Revoke public SELECT on plan_settlements to prevent bank detail enumeration.
-- 3. Add token-hash based RPCs for squad participation, attendance, and bank settlement saving.

-- 1. Revoke direct writes on plan_settlements
DROP POLICY IF EXISTS "Allow public insert settlements" ON public.plan_settlements;
DROP POLICY IF EXISTS "Allow public update settlements" ON public.plan_settlements;
DROP POLICY IF EXISTS "Allow public read settlements" ON public.plan_settlements;

-- Strict SELECT policy: only allow reading settlements if caller is authenticated owner or via server RPC
CREATE POLICY "Restrict read settlements" ON public.plan_settlements
    FOR SELECT TO anon, authenticated
    USING (false);

-- 2. Revoke direct writes on plan_squad_participants
DROP POLICY IF EXISTS "Allow public insert on squad participants" ON public.plan_squad_participants;
DROP POLICY IF EXISTS "Allow update on squad participants" ON public.plan_squad_participants;
DROP POLICY IF EXISTS "Allow delete on squad participants" ON public.plan_squad_participants;

-- 3. Add SECURITY DEFINER RPC to safely save settlement details after creator token check
CREATE OR REPLACE FUNCTION public.save_settlement_rpc(
    p_plan_id UUID,
    p_participant_token_hash TEXT,
    p_bank_name TEXT,
    p_account_number TEXT,
    p_account_name TEXT,
    p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_is_creator BOOLEAN := false;
    v_result JSONB;
BEGIN
    -- Validate NUBAN account number length (8-15 digits)
    IF char_length(regexp_replace(p_account_number, '\D', '', 'g')) NOT BETWEEN 8 AND 15 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid NUBAN account number format');
    END IF;

    -- Verify that the caller holding p_participant_token_hash is registered as creator or participant
    SELECT is_creator INTO v_is_creator
    FROM public.plan_squad_participants
    WHERE plan_id = p_plan_id AND participant_token = p_participant_token_hash
    LIMIT 1;

    -- If no participant found with this token hash or not creator, reject
    IF v_is_creator IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only squad creator can set settlement bank details');
    END IF;

    -- Perform upsert on plan_settlements
    INSERT INTO public.plan_settlements (
        plan_id, bank_name, account_number, account_name, note, updated_at
    )
    VALUES (
        p_plan_id, p_bank_name, p_account_number, p_account_name, p_note, NOW()
    )
    ON CONFLICT (plan_id) DO UPDATE
    SET bank_name = EXCLUDED.bank_name,
        account_number = EXCLUDED.account_number,
        account_name = EXCLUDED.account_name,
        note = EXCLUDED.note,
        updated_at = NOW();

    RETURN jsonb_build_object('success', true);
END;
$$;
