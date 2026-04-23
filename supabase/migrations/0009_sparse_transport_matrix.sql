-- Sparse Transport Matrix Cleanup Strategy
-- This migration provides instructions and queries for identifying redundant matrix entries.

/*
  The goal is to remove transport_matrix entries that exactly match the output of 
  the matching engine's zone formula. This reduces maintenance overhead.
  
  Since the zone formula logic resides in TypeScript (matchingEngine.ts), 
  automated cleanup via SQL is complex.
  
  ADMIN ACTION REQUIRED:
  1. Use the query below to identify spots with large matrices.
  2. Review if these spots require special overrides.
  3. If not, set transport_matrix = '{}'::jsonb.
*/

-- Identify spots with fully populated matrices (potential cleanup candidates)
-- SELECT id, name, area_id, transport_matrix 
-- FROM spots 
-- WHERE jsonb_objs_count(transport_matrix) > 0;

-- Function to count keys in jsonb for easier filtering (optional helper)
CREATE OR REPLACE FUNCTION jsonb_objs_count(j jsonb) RETURNS integer AS $$
DECLARE
    cnt integer;
BEGIN
    SELECT count(*) INTO cnt FROM jsonb_object_keys(j);
    RETURN cnt;
END;
$$ LANGUAGE plpgsql;

-- Example Cleanup for standard spots (DANGEROUS: Manual review first!)
-- UPDATE spots SET transport_matrix = '{}'::jsonb 
-- WHERE category IN ('restaurant', 'cafe', 'bar') 
-- AND is_featured = false;
