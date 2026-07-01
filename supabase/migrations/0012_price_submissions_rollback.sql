-- Rollback 0012: Price Submissions
--
-- This rollback removes all components added in migration 0012.
-- It is safe to run multiple times (uses IF EXISTS).
--
-- WARNING: This will delete all price submission data.
-- Use only if you need to completely remove the pricing architecture.

-- Drop the immutability trigger
DROP TRIGGER IF EXISTS price_submissions_immutability ON price_submissions;

-- Drop the immutability enforcement function
DROP FUNCTION IF EXISTS check_price_evidence_immutability();

-- Drop the price_submissions table (cascades to all indexes and foreign keys)
DROP TABLE IF EXISTS price_submissions CASCADE;

-- Confirm rollback
SELECT 'Rollback complete: price_submissions removed' AS result;
