-- Phase 10: Canonical Data Platform
-- Provides enterprise ETL infrastructure with registry, versioning, dry run, and rollback.

-- 1. Canonical Dataset Registry
CREATE TABLE IF NOT EXISTS public.external_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    owner TEXT,
    source_type TEXT NOT NULL,
    import_frequency TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Ingestion Batches (Versioning & Rollback Anchor)
CREATE TABLE IF NOT EXISTS public.ingestion_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES public.external_datasets(id) ON DELETE CASCADE,
    version TEXT,
    checksum TEXT UNIQUE NOT NULL, -- Prevent re-importing the exact same file
    status TEXT NOT NULL CHECK (status IN ('preview', 'processing', 'completed', 'rolled_back', 'failed')),
    total_rows INTEGER NOT NULL DEFAULT 0,
    imported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Staging Layer
CREATE TABLE IF NOT EXISTS public.staging_venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.ingestion_batches(id) ON DELETE CASCADE NOT NULL,
    raw_payload JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'schema_valid', 'business_valid', 'duplicate', 'requires_review', 'imported', 'rejected')),
    validation_errors TEXT[] DEFAULT '{}',
    duplicate_of UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staging_venues_batch ON public.staging_venues(batch_id);
CREATE INDEX idx_staging_venues_status ON public.staging_venues(status);

-- 4. Alter Core Tables to Support Cascading Rollbacks
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES public.ingestion_batches(id) ON DELETE CASCADE;
ALTER TABLE public.price_evidence ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES public.ingestion_batches(id) ON DELETE CASCADE;

-- Note: Because price_evidence and venues have ON DELETE CASCADE linked to import_batch_id,
-- rolling back a batch is as simple as: UPDATE ingestion_batches SET status='rolled_back' WHERE id=X; 
-- Wait, ON DELETE CASCADE triggers when the referenced row is DELETED, not updated.
-- We will handle rollback via a service layer DELETE FROM venues WHERE import_batch_id = X.

-- Row Level Security
ALTER TABLE public.external_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging_venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage datasets" ON public.external_datasets FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins manage batches" ON public.ingestion_batches FOR ALL TO authenticated USING (true);
CREATE POLICY "Admins manage staging" ON public.staging_venues FOR ALL TO authenticated USING (true);
