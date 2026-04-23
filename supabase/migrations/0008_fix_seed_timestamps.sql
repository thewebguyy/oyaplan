-- Update all spots where verified_by = 'seed' or 'chowdeck' or 'instagram' or 'manual' to set price_updated_at = '2025-01-01' and verified_by = 'seed'
-- This establishes a realistic baseline for pricing staleness.

UPDATE spots 
SET price_updated_at = '2025-01-01',
    verified_by = 'seed'
WHERE verified_by IN ('seed', 'chowdeck', 'instagram', 'manual', 'seed_operator');
