-- Migration 0016: Phase 3B Trust Intelligence
-- Extends the audit system to track all venue state changes (Confidence, Status, Prices)
-- Introduces scout_id for stable reputation tracking

-- 1. Extend price_audit_logs for generic venue change detection
ALTER TABLE public.price_audit_logs 
  ALTER COLUMN menu_item_id DROP NOT NULL,
  ADD COLUMN venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  ADD COLUMN event_type TEXT NOT NULL DEFAULT 'menu_price',
  ADD COLUMN previous_value JSONB,
  ADD COLUMN new_value JSONB;

-- Backfill venue_id from menu_item_id for existing price records
UPDATE public.price_audit_logs pal
SET venue_id = mi.venue_id,
    previous_value = to_jsonb(pal.previous_price),
    new_value = to_jsonb(pal.new_price)
FROM public.menu_items mi
WHERE pal.menu_item_id = mi.id;

-- Now that data is migrated, drop legacy integer columns
ALTER TABLE public.price_audit_logs
  DROP COLUMN previous_price,
  DROP COLUMN new_price;

-- Index for timeline queries
CREATE INDEX IF NOT EXISTS idx_price_audit_logs_venue ON public.price_audit_logs(venue_id, created_at DESC);

-- 2. Scout Reputation tracking
ALTER TABLE public.price_evidence
  ADD COLUMN scout_id UUID; -- Can be null for legacy anonymous, but new submissions will attempt to track this

-- 3. Automatic Venue Change Detection Trigger
CREATE OR REPLACE FUNCTION public.trig_venue_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    -- Detect Confidence Score Changes
    IF OLD.computed_confidence_score IS DISTINCT FROM NEW.computed_confidence_score THEN
        INSERT INTO public.price_audit_logs (
            venue_id,
            changed_by,
            action_type,
            event_type,
            previous_value,
            new_value,
            reason
        ) VALUES (
            NEW.id,
            'system',
            'update',
            'confidence_change',
            jsonb_build_object('score', OLD.computed_confidence_score),
            jsonb_build_object('score', NEW.computed_confidence_score),
            'Automatic recalculation'
        );
    END IF;

    -- Detect Operational Status Changes
    IF OLD.operational_status IS DISTINCT FROM NEW.operational_status THEN
        INSERT INTO public.price_audit_logs (
            venue_id,
            changed_by,
            action_type,
            event_type,
            previous_value,
            new_value,
            reason
        ) VALUES (
            NEW.id,
            'system',
            'update',
            'status_change',
            jsonb_build_object('status', OLD.operational_status),
            jsonb_build_object('status', NEW.operational_status),
            'Operational status updated'
        );
    END IF;

    -- Detect Transport/Matrix Overrides or Global Price Tier shifts
    IF OLD.derived_typical_cost IS DISTINCT FROM NEW.derived_typical_cost THEN
         INSERT INTO public.price_audit_logs (
            venue_id,
            changed_by,
            action_type,
            event_type,
            previous_value,
            new_value,
            reason
        ) VALUES (
            NEW.id,
            'system',
            'update',
            'typical_cost_change',
            jsonb_build_object('cost', OLD.derived_typical_cost),
            jsonb_build_object('cost', NEW.derived_typical_cost),
            'Typical cost recomputed'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS venue_audit_trigger ON public.venues;
CREATE TRIGGER venue_audit_trigger
AFTER UPDATE ON public.venues
FOR EACH ROW EXECUTE FUNCTION public.trig_venue_audit_log();

-- 4. RLS Policy for Timeline (Public read for history)
DROP POLICY IF EXISTS "Public read timeline events" ON public.price_audit_logs;
CREATE POLICY "Public read timeline events"
  ON public.price_audit_logs FOR SELECT TO anon, authenticated
  USING (event_type IN ('confidence_change', 'status_change', 'typical_cost_change'));
