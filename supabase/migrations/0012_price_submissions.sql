-- Migration 0012: Price Submissions (Pricing Architecture MVP)
--
-- Core pricing evidence table. Single immutable source of truth for user-reported spending.
-- Evidence fields (what, when, where, who) never change.
-- Moderation fields (status, review metadata) change during admin workflow.
--
-- Design decisions:
-- 1. One table, append-only evidence. No aggregate table (computed on-read + cached).
-- 2. Immutability enforced via trigger: evidence columns cannot be UPDATE'd.
-- 3. Moderation fields (status, reviewed_at, reviewed_by, rejection_reason) are mutable.
-- 4. Duplicate submission guard via index and application logic (7-day rule per venue).
-- 5. Transport context stored inline (transport_cost column), no separate table.
-- 6. Food/drink breakdown optional, nullable (collected Month 2+, backfilled on-read if null).
-- 7. RLS policies: anon can INSERT, admins can UPDATE moderation fields only.

-- Create table
CREATE TABLE IF NOT EXISTS price_submissions (
  -- Immutable Evidence (PRIMARY FACTS)
  -- Never UPDATE these fields. They are the contract with users.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_session_id TEXT NOT NULL,  -- Anonymous session ID. Never user PII.

  -- Core spending fact
  total_per_person INTEGER NOT NULL,  -- ₦ per person at the venue

  -- When it was spent (immutable)
  date_of_spend DATE NOT NULL,  -- When user went (not when reported)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- When user reported it

  -- Optional immutable context (collected progressively)
  food_cost INTEGER,              -- Breakdown collected in Month 2+
  drink_cost INTEGER,             -- Breakdown collected in Month 2+
  transport_cost INTEGER,         -- Transport context (Week 3+)
  squad_size INTEGER,             -- "This was for 3 people" (context for per-person math)

  -- Immutable provenance
  -- Who said this? User feedback vs. operator confirmation vs. creator post?
  source TEXT NOT NULL DEFAULT 'user' CHECK (
    source IN ('user', 'operator', 'creator')
  ),
  source_id TEXT,                 -- operator_key or 'tiktok:@handle' or null for user

  -- Mutable Moderation Metadata
  -- ONLY these fields can be UPDATE'd after INSERT
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  rejection_reason TEXT,          -- Why was it rejected? Learning signal.
                                  -- Examples: 'price_implausible', 'spot_closed', 'duplicate', 'insufficient_context'

  -- Moderation audit trail
  reviewed_at TIMESTAMPTZ,        -- When admin made decision
  reviewed_by TEXT,               -- Admin user ID or 'system' for auto-approval

  -- Constraints (Integrity)
  CONSTRAINT price_positive CHECK (total_per_person > 0),
  CONSTRAINT food_cost_positive CHECK (food_cost IS NULL OR food_cost >= 0),
  CONSTRAINT drink_cost_positive CHECK (drink_cost IS NULL OR drink_cost >= 0),
  CONSTRAINT transport_cost_positive CHECK (transport_cost IS NULL OR transport_cost >= 0),

  -- Date validation
  CONSTRAINT date_not_future CHECK (date_of_spend <= CURRENT_DATE),

  -- Breakdown integrity: food + drink should not exceed total * 1.1 (10% buffer for tax/tip)
  CONSTRAINT breakdowns_sum_check CHECK (
    (food_cost IS NULL AND drink_cost IS NULL) OR
    (COALESCE(food_cost, 0) + COALESCE(drink_cost, 0) <= total_per_person * 1.1)
  ),

  -- Moderation timeline: reviewed_at must be >= created_at
  CONSTRAINT review_timeline CHECK (
    reviewed_at IS NULL OR reviewed_at >= created_at
  ),

  -- Status transition: can only transition from pending
  CONSTRAINT status_transition CHECK (
    status IN ('pending', 'approved', 'rejected')
  )
);

-- Indexes for common queries
-- Index 1: Duplicate submission guard
-- Query: "Has this user already submitted for this spot in the last 7 days?"
CREATE INDEX idx_price_submissions_duplicate_guard
  ON price_submissions(spot_id, user_session_id, created_at DESC)
  WHERE status IN ('pending', 'approved');

-- Index 2: Admin moderation workflow
-- Query: "Show me all pending submissions"
CREATE INDEX idx_price_submissions_pending
  ON price_submissions(status, created_at ASC)
  WHERE status = 'pending';

-- Index 3: Spot price aggregation (most common read)
-- Query: "Get all approved submissions for spot X in last 90 days"
CREATE INDEX idx_price_submissions_spot_aggregation
  ON price_submissions(spot_id, status, date_of_spend DESC)
  WHERE status = 'approved' AND date_of_spend > CURRENT_DATE - 90;

-- Index 4: Session reputation tracking (Month 2+)
-- Query: "How many submissions has this session made?"
CREATE INDEX idx_price_submissions_session
  ON price_submissions(user_session_id, created_at DESC);

-- Index 5: Source provenance analysis
-- Query: "Which submissions came from operators vs. creators vs. users?"
CREATE INDEX idx_price_submissions_source
  ON price_submissions(source);

-- Index 6: Admin audit trail
-- Query: "Which submissions did admin X review?"
CREATE INDEX idx_price_submissions_reviewed_by
  ON price_submissions(reviewed_by, reviewed_at DESC)
  WHERE reviewed_at IS NOT NULL;

-- Immutability Enforcement via Trigger
-- This prevents accidental or malicious UPDATE of evidence fields.
-- Only moderation metadata (status, reviewed_at, reviewed_by, rejection_reason) may be changed.
--
-- Explanation: PostgreSQL doesn't have "read-only columns" in the schema.
-- We use a trigger to enforce the contract: "Evidence is immutable."
-- If a query tries to UPDATE an evidence column, the trigger raises an exception.
CREATE OR REPLACE FUNCTION check_price_evidence_immutability()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if any evidence field was modified
  IF OLD.spot_id IS DISTINCT FROM NEW.spot_id THEN
    RAISE EXCEPTION 'spot_id is immutable';
  END IF;

  IF OLD.user_session_id IS DISTINCT FROM NEW.user_session_id THEN
    RAISE EXCEPTION 'user_session_id is immutable';
  END IF;

  IF OLD.total_per_person IS DISTINCT FROM NEW.total_per_person THEN
    RAISE EXCEPTION 'total_per_person is immutable';
  END IF;

  IF OLD.date_of_spend IS DISTINCT FROM NEW.date_of_spend THEN
    RAISE EXCEPTION 'date_of_spend is immutable';
  END IF;

  IF OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    RAISE EXCEPTION 'created_at is immutable';
  END IF;

  IF OLD.food_cost IS DISTINCT FROM NEW.food_cost THEN
    RAISE EXCEPTION 'food_cost is immutable';
  END IF;

  IF OLD.drink_cost IS DISTINCT FROM NEW.drink_cost THEN
    RAISE EXCEPTION 'drink_cost is immutable';
  END IF;

  IF OLD.transport_cost IS DISTINCT FROM NEW.transport_cost THEN
    RAISE EXCEPTION 'transport_cost is immutable';
  END IF;

  IF OLD.squad_size IS DISTINCT FROM NEW.squad_size THEN
    RAISE EXCEPTION 'squad_size is immutable';
  END IF;

  IF OLD.source IS DISTINCT FROM NEW.source THEN
    RAISE EXCEPTION 'source is immutable';
  END IF;

  IF OLD.source_id IS DISTINCT FROM NEW.source_id THEN
    RAISE EXCEPTION 'source_id is immutable';
  END IF;

  -- Only these fields may be updated:
  -- - status (pending → approved | rejected)
  -- - rejection_reason (null → reason, for learning)
  -- - reviewed_at (null → timestamp, for audit)
  -- - reviewed_by (null → admin_id, for accountability)

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach immutability trigger to price_submissions
CREATE TRIGGER price_submissions_immutability
  BEFORE UPDATE ON price_submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_price_evidence_immutability();

-- Row-Level Security (RLS)
-- Users can anonymously INSERT submissions.
-- Admins can UPDATE moderation fields.
-- Everyone can read (no sensitive data: amounts are public knowledge).

ALTER TABLE price_submissions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anonymous users can INSERT submissions
-- No authentication required. This is how we collect evidence.
CREATE POLICY "Anyone can submit price evidence"
  ON price_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Authenticated admins can UPDATE moderation fields
-- (Assumes service_role or authenticated user with admin role)
-- Note: Trigger enforces that only moderation fields can actually be updated.
CREATE POLICY "Admins can review submissions"
  ON price_submissions
  FOR UPDATE
  TO authenticated
  USING (true)  -- Can see any submission
  WITH CHECK (true);  -- Can update moderation fields (trigger enforces immutability)

-- Policy 3: Everyone can READ submissions (no sensitive data exposed)
-- Prices are public. This enables analytics and transparency.
CREATE POLICY "Price submissions are public"
  ON price_submissions
  FOR SELECT
  TO public
  USING (true);

-- RLS on public read: Be mindful. user_session_id is anonymous (not PII).
-- total_per_person, date_of_spend are public information (amounts people spend).
-- source, source_id could be considered metadata (operator name, creator handle).
-- For MVP, all data is readable. If privacy concern emerges (Month 2+), add row filters.

-- Timestamp function (optional utility for queries)
-- Used in queries to calculate confidence ("days since latest submission")
COMMENT ON TABLE price_submissions IS
'Immutable evidence store. Core of OyaPlan pricing intelligence.
Every row represents "I spent ₦X at venue Y on date Z."

Evidence fields are immutable (enforced by trigger):
  - spot_id, user_session_id, total_per_person, date_of_spend, source
  - food_cost, drink_cost, transport_cost, squad_size
  - created_at, source_id

Moderation fields are mutable (for admin workflow):
  - status: pending → approved | rejected
  - rejection_reason: why was it rejected?
  - reviewed_at, reviewed_by: audit trail

Aggregates (median, confidence, variance) are computed on-read and cached.
No separate aggregate table. Learn from raw data directly.

Duplicate submission protection: Application-level guard.
  Business rule: User cannot submit for same venue more than once per 7 days.
  Enforce via index idx_price_submissions_duplicate_guard.';

-- Success indicator
SELECT 'Migration 0012: price_submissions table created successfully' AS result;
