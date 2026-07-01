-- Migration 0014: Add database constraint to prevent duplicate submissions
--
-- Previously: Duplicate submission guard was application-level only.
-- Race condition: Two concurrent requests could both pass the check and both insert.
--
-- Now: Database constraint prevents this at the source.
-- Users can only have one submission per spot per 7-day period (one per calendar day, actually).
--
-- The partial unique index only applies to pending/approved submissions,
-- so rejected submissions don't count against the limit (allowing retry after rejection).

CREATE UNIQUE INDEX idx_price_submissions_one_per_day
  ON price_submissions (
    spot_id,
    user_session_id,
    DATE_TRUNC('day', created_at)::date
  )
  WHERE status IN ('pending', 'approved');

-- Note: This uses DATE_TRUNC to create a daily boundary.
-- If user submitted on Monday, they can't submit again on Monday (even at 23:59).
-- They CAN submit on Tuesday at 00:00. This is intentional: simple, predictable rule.
--
-- Concurrent submissions within the same day will get unique_violation from Postgres.
-- Application catches this and converts to DuplicateSubmissionError.
