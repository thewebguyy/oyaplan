# Pricing Architecture Implementation Guide

**Status:** MVP (Sprint 1, Week 1–2)  
**Migration:** `0012_price_submissions.sql`  
**Schema Files:** `lib/types/priceSubmission.ts`, `schema/priceSubmission.drizzle.ts`  
**Rollback:** `0012_price_submissions_rollback.sql`

---

## Core Design Principles

### 1. Immutable Evidence + Mutable Moderation

**Immutable fields** (never UPDATE after INSERT):
- `spot_id`, `user_session_id`, `total_per_person`
- `date_of_spend`, `created_at`
- `food_cost`, `drink_cost`, `transport_cost`, `squad_size`
- `source`, `source_id`

**Mutable fields** (admin workflow only):
- `status` (pending → approved | rejected)
- `rejection_reason` (null → reason string)
- `reviewed_at` (null → timestamp)
- `reviewed_by` (null → admin_id)

**Enforcement:** PostgreSQL trigger `price_submissions_immutability()` prevents UPDATE of evidence fields. If an application tries to UPDATE an immutable field, the trigger raises `EXCEPTION`.

### 2. No Aggregate Table

All aggregates (median, variance, confidence) are **computed on-read** from raw evidence.

**Why:**
- Single source of truth (price_submissions only)
- No sync bugs between tables
- Learn directly from raw data
- Scales to 5M users without schema change

**Caching:** Application caches computed aggregates with event-driven invalidation (see below).

### 3. Event-Driven Cache Invalidation

Instead of TTL-based caching:
1. Admin approves submission
2. Trigger UPDATE on `price_submissions`
3. Application immediately invalidates cache for that spot
4. Next read computes fresh aggregate

**Implementation:**
```typescript
await db.query(`UPDATE price_submissions SET status='approved' WHERE id=$1`);
await cache.invalidate(`spot:${spotId}`);
```

---

## Schema Design Decisions

### Why `status` is TEXT, not ENUM?

**Decision:** `status TEXT CHECK (status IN (...))`

**Rationale:**
- PostgreSQL ENUM types cannot be altered without `ALTER TYPE` (dangerous in production)
- CHECK constraint allows adding new statuses later if needed
- TEXT is more flexible for application logic
- Performance difference is negligible at 500 users

### Why `rejection_reason` is Nullable?

**Decision:** `rejection_reason TEXT` (nullable)

**Rationale:**
- Approved submissions don't need a reason
- Rejected submissions explain why (learning signal)
- Nullable prevents bloat
- Required in application logic: `if (status === 'rejected') { reason must be present }`

### Why No Separate `user_reputation` Table?

**Deferred to Month 2**

**Current approach (MVP):**
- Track submission count in application code
- Monitor manually for vandalism patterns
- No database table overhead

**Month 2 addition (when patterns emerge):**
```sql
CREATE TABLE user_reputation (
  user_session_id TEXT PRIMARY KEY,
  submissions_count INT DEFAULT 0,
  rejections INT DEFAULT 0,
  reputation_score FLOAT DEFAULT 1.0
);
```

### Why Transport is Inline, Not Separate Table?

**Decision:** `transport_cost INTEGER` in `price_submissions`

**Rationale:**
- Transport is optional context (nullable), not a separate entity
- Users report: "Total ₦20k, Transport ₦8k"
- One row = one outing = one transport cost
- Separate table implies separate evidence stream (it's not)

**Month 3+ (if transport patterns justify):**
```sql
CREATE MATERIALIZED VIEW transport_evidence AS
  SELECT hour_of_day, day_of_week, MEDIAN(transport_cost)
  FROM price_submissions WHERE transport_cost IS NOT NULL GROUP BY ...;
```

### Why Break Down Constraints?

**Decision:** Separate CHECK constraints instead of combined logic

**Example:**
```sql
CONSTRAINT price_positive CHECK (total_per_person > 0),
CONSTRAINT food_cost_positive CHECK (food_cost IS NULL OR food_cost >= 0),
CONSTRAINT breakdowns_sum_check CHECK (
  (food_cost IS NULL AND drink_cost IS NULL) OR
  (COALESCE(food_cost, 0) + COALESCE(drink_cost, 0) <= total_per_person * 1.1)
),
```

**Rationale:**
- Clear intent: each constraint explains one rule
- Better error messages (database tells you which rule failed)
- Easier to modify later
- Documentation in code

### Why `reviewed_at` Constraint?

**Decision:** `CONSTRAINT review_timeline CHECK (reviewed_at IS NULL OR reviewed_at >= created_at)`

**Rationale:**
- Prevents nonsensical data: submission can't be reviewed before it was created
- Catch bugs early (malformed timestamps in admin code)
- Cost: negligible (one comparison per UPDATE)

### Why Index on `(spot_id, status, date_of_spend DESC)`?

**Most common query:**
```sql
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_per_person)
FROM price_submissions
WHERE spot_id = $1 AND status = 'approved' AND date_of_spend > CURRENT_DATE - 90;
```

**Index covers:** `spot_id` (filter), `status` (filter), `date_of_spend` (order).

**Why DESC on date?** We typically want latest submissions first (freshness matters). DESC in index helps that query naturally.

### Why Partial Index on `status = 'pending'`?

**Decision:** `CREATE INDEX idx_pending ON price_submissions(status, created_at) WHERE status = 'pending'`

**Rationale:**
- Admin queue query: "Show pending submissions"
- Partial index skips approved/rejected rows (the vast majority)
- Smaller index = faster scan
- Partial indexes are a PostgreSQL feature (not in all databases)

### Why `user_session_id`, Not User ID?

**Decision:** Strings like `"sess_abc123"` generated at session start

**Rationale:**
- Anonymous (no PII)
- No authentication required
- Enables reputation tracking (track patterns, not identity)
- Users can submit multiple times without login friction
- Prevents double-counting (one session = one person, approximately)

**Implementation:**
```typescript
// Generate once at session start, store in cookie
const sessionId = crypto.randomUUID();
localStorage.setItem('oyaplan_session_id', sessionId);
```

---

## Duplicate Submission Protection

### Business Rule

**User cannot submit price for same venue more than once per 7 days**

**Why:**
- Prevents spam (same user flooding same venue)
- Encourages variety (submit prices for different venues)
- Data quality (repeated submissions shouldn't skew median)

### Implementation

**No database constraint.** Enforced in application code.

**Why?**
- Business rule is application policy, not schema invariant
- Allows soft-fail (warn user, don't reject)
- Allows future variations (maybe 3 days on weekends, 7 days on weekdays)

**Query (fast due to index):**
```sql
SELECT id FROM price_submissions 
WHERE spot_id = $1 AND user_session_id = $2 AND created_at > NOW() - INTERVAL '7 days'
LIMIT 1;
```

**Application logic:**
```typescript
if (recent.length > 0) {
  throw new DuplicateSubmissionError(spotId, daysSince);
}
```

---

## Row-Level Security (RLS)

### Policy 1: Anonymous Users Can INSERT

```sql
CREATE POLICY "Anyone can submit price evidence" ON price_submissions
  FOR INSERT TO anon WITH CHECK (true);
```

**Why:**
- Core feature: collect evidence without registration
- No authentication barrier
- `anon` role = Supabase anonymous user

### Policy 2: Admins Can UPDATE

```sql
CREATE POLICY "Admins can review submissions" ON price_submissions
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);
```

**Why:**
- Admins (authenticated users with admin role) review submissions
- Trigger (`price_submissions_immutability`) prevents updates to evidence fields
- Even if an admin tries to UPDATE evidence, trigger blocks it

**Note:** In production, add role check:
```sql
USING (auth.jwt() ->> 'role' = 'admin')
```

### Policy 3: Everyone Can SELECT

```sql
CREATE POLICY "Price submissions are public" ON price_submissions
  FOR SELECT TO public USING (true);
```

**Why:**
- Prices are public knowledge (amounts people spend)
- Enables analytics and transparency
- `user_session_id` is anonymous (not PII)

**Consideration (Month 2):** If privacy becomes concern, add row filters:
```sql
USING (status = 'approved')  -- Hide rejected/pending from public
```

---

## PostgreSQL Percentiles

### Query Pattern

Aggregate function: `PERCENTILE_CONT(k) WITHIN GROUP (ORDER BY column)`

**Example:**
```sql
SELECT
  COUNT(*) as count,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_per_person) as median,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_per_person) as p25,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_per_person) as p75,
  STDDEV_POP(total_per_person) as stddev
FROM price_submissions
WHERE spot_id = $1 AND status = 'approved' AND date_of_spend > CURRENT_DATE - 90;
```

### Why PostgreSQL, Not JavaScript?

**Rationale:**
- Percentiles computed once in database (not on every read)
- Faster (uses optimized algorithm)
- Simpler (no data transfer, calculation stays in PG)
- Accurate (full precision in database)

### Variance Calculation

```sql
STDDEV_POP(total_per_person)
```

**Used for confidence:**
```typescript
const coeffVar = stddev / median;  // Coefficient of variation
const spreadPenalty = Math.min(coeffVar / 0.15, 1.0);  // 15% CoV = neutral
const varianceFactor = Math.max(0, 1 - spreadPenalty) * 0.2;
```

**Why:**
- Tight consensus (low variance) = high confidence
- Spread submissions (high variance) = uncertainty
- Coefficient of variation is scale-independent (fair across venues)

---

## Immutability Trigger

### Design

PostgreSQL trigger fires on every UPDATE attempt:

```plpgsql
CREATE FUNCTION check_price_evidence_immutability() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.total_per_person IS DISTINCT FROM NEW.total_per_person THEN
    RAISE EXCEPTION 'total_per_person is immutable';
  END IF;
  -- ... check all other evidence fields ...
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER price_submissions_immutability
  BEFORE UPDATE ON price_submissions
  FOR EACH ROW EXECUTE FUNCTION check_price_evidence_immutability();
```

### Why This Design?

1. **Prevents bugs:** Application bugs can't accidentally UPDATE evidence
2. **Enforces contract:** Database guarantees immutability
3. **Clear intent:** Trigger code documents which fields are immutable
4. **Transparent failure:** If violated, raises clear exception

### Performance Impact

- Minimal: trigger runs once per UPDATE (rare operation)
- Moderation is batch (1–2 times per day, maybe 20 UPDATEs)
- Not a bottleneck at any scale

### Alternative: RLS Policies

Could use RLS to prevent UPDATEs:
```sql
CREATE POLICY "Block evidence updates" ON price_submissions
  FOR UPDATE USING (FALSE);
```

**Problem:** Too restrictive (blocks all UPDATEs, including moderation).

**Our approach:** Allow UPDATEs, but trigger validates which columns changed.

---

## Testing the Migration

### Apply Migration

```bash
supabase migration up
```

Or via Supabase dashboard: Migrations → Apply pending

### Verify Schema

```sql
-- Check table exists
SELECT * FROM information_schema.tables WHERE table_name = 'price_submissions';

-- Check columns
SELECT * FROM information_schema.columns WHERE table_name = 'price_submissions';

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'price_submissions';

-- Check RLS is enabled
SELECT relrowsecurity FROM pg_class WHERE relname = 'price_submissions';
```

### Test Immutability Trigger

```sql
-- Insert a test submission
INSERT INTO price_submissions (spot_id, user_session_id, total_per_person, date_of_spend)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'test-session', 15000, '2026-07-01');

-- Try to UPDATE evidence (should fail)
UPDATE price_submissions SET total_per_person = 20000 WHERE user_session_id = 'test-session';
-- ERROR: total_per_person is immutable

-- Try to UPDATE moderation (should succeed)
UPDATE price_submissions SET status = 'approved', reviewed_by = 'admin1' WHERE user_session_id = 'test-session';
-- UPDATE 1

-- Verify
SELECT status, reviewed_by FROM price_submissions WHERE user_session_id = 'test-session';
-- status='approved', reviewed_by='admin1'
```

### Test Duplicate Guard Index

```sql
-- Verify index exists
SELECT * FROM pg_indexes WHERE indexname = 'idx_price_submissions_duplicate_guard';

-- Test query performance
EXPLAIN ANALYZE
SELECT id FROM price_submissions 
WHERE spot_id = '00000000-0000-0000-0000-000000000001'::uuid 
  AND user_session_id = 'test-session' 
  AND created_at > NOW() - INTERVAL '7 days'
LIMIT 1;
-- Should use idx_price_submissions_duplicate_guard
```

---

## Design Decisions Reference

### Decision 1: One Table vs. Multiple Tables

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| One `price_submissions` | Single source of truth, no sync | Might grow large | ✅ CHOSEN |
| Separate `price_evidence` + `price_aggregates` | Normalized | Sync complexity, premature | ❌ DEFERRED |

### Decision 2: Aggregate Computation

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| Compute on-read + cache | Simple, transparent, learnable | 1ms query latency | ✅ CHOSEN |
| Materialized view (daily refresh) | Pre-computed, fast reads | Added complexity | ❌ MONTH 3+ |
| Materialized table (sync on INSERT) | Always fresh | Sync bugs, maintenance | ❌ MONTH 6+ |

### Decision 3: Immutability Enforcement

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| Trigger (database-level) | Prevents bugs, enforces contract | Minimal overhead | ✅ CHOSEN |
| RLS (prevent all UPDATEs) | Simple policy | Blocks legitimate moderation | ❌ REJECTED |
| Application validation only | No DB overhead | Relies on code discipline | ❌ REJECTED |

### Decision 4: Duplicate Guard

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| Application logic + index | Flexible, soft-fail, learnable | Business logic not in schema | ✅ CHOSEN |
| Database constraint | Enforced at DB level | Inflexible, hard-fail | ❌ DEFERRED |
| No protection | Simple | Spam/vandalism risk | ❌ REJECTED |

### Decision 5: Food/Drink Breakdown

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| Inline, nullable | One table, progressive collection | Nulls in schema | ✅ CHOSEN (MVP) |
| Separate table | Normalized | Sync complexity | ❌ MONTH 3+ |
| Not collected yet | Simpler MVP | Less learning | ❌ REJECTED |

---

## Migration Path

### Sprint 1 (Week 1–2): Foundation
- [x] Create `price_submissions` table
- [x] Enable RLS policies
- [x] Create indexes
- [x] Immutability trigger

### Sprint 2 (Week 3–4): Consumption
- [ ] Implement `lib/actions/submitPriceEvidence.ts`
- [ ] Implement `lib/queries/getSpotPrice.ts` (compute + cache)
- [ ] Implement admin moderation UI
- [ ] Implement price report form

### Sprint 3 (Week 5–6): Learning
- [ ] Admin analytics dashboard
- [ ] Price discrepancy alerts
- [ ] Submission pattern analysis

### Sprint 4 (Week 7+): Operator Loop
- [ ] Operator manual price update form
- [ ] Operator API endpoint

### Month 2: Reputation
- [ ] Create `user_reputation` table
- [ ] Track rejections per user
- [ ] Auto-approve high-reputation submitters

### Month 3: Transport Analysis
- [ ] Create `transport_evidence` view
- [ ] Analyze time-of-day fares

---

## Rollback Plan

If critical issue found:

```bash
# Option 1: Via Supabase CLI
supabase db reset

# Option 2: Via migration
supabase migration down --version 0012

# Option 3: Manual SQL (last resort)
psql -d $DATABASE_URL -f 0012_price_submissions_rollback.sql
```

**Data loss:** Yes (price_submissions table dropped). Acceptable for MVP.

---

## Monitoring

### Queries to Watch

**Duplicate guard latency:**
```sql
EXPLAIN ANALYZE
SELECT COUNT(*) FROM price_submissions
WHERE spot_id = $1 AND user_session_id = $2 AND created_at > NOW() - '7 days'::interval;
-- Target: < 1ms
```

**Aggregate computation latency:**
```sql
EXPLAIN ANALYZE
SELECT
  COUNT(*),
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_per_person),
  STDDEV_POP(total_per_person)
FROM price_submissions
WHERE spot_id = $1 AND status = 'approved' AND date_of_spend > CURRENT_DATE - 90;
-- Target: < 5ms (cached in app, so acceptable)
```

**Table size:**
```sql
SELECT pg_size_pretty(pg_total_relation_size('price_submissions'));
-- Growth: ~150 bytes per submission
-- At 6,000 submissions: ~900KB (negligible)
```

---

## FAQ

**Q: Why not use `GENERATED` columns for aggregates?**  
A: GENERATED columns can't use window functions or aggregate functions like `PERCENTILE_CONT`. Would need triggers anyway.

**Q: Why not partition by date?**  
A: Premature. At 500 users, single table is fast. Partition after 5M users or >100GB.

**Q: What if someone tries to UPDATE total_per_person?**  
A: Trigger raises `EXCEPTION: total_per_person is immutable`. Update fails, logs error.

**Q: Can admins see rejected submissions?**  
A: Yes, current RLS allows SELECT of all rows (including rejected). Month 2: filter to show admins only.

**Q: How do we audit who rejected what?**  
A: `reviewed_by` and `reviewed_at` fields track this. Query:
```sql
SELECT user_session_id, rejection_reason, reviewed_by, reviewed_at
FROM price_submissions WHERE status = 'rejected' ORDER BY reviewed_at DESC;
```

**Q: What if duplicate guard query times out?**  
A: Increase index hint: COLLATE to sort order on created_at.
Or batch duplicate check into moderation (not real-time).

---

## Files Provided

1. **`0012_price_submissions.sql`** — Forward migration with all constraints, indexes, triggers, RLS
2. **`0012_price_submissions_rollback.sql`** — Rollback (drop table + function + trigger)
3. **`lib/types/priceSubmission.ts`** — TypeScript types (current project approach)
4. **`schema/priceSubmission.drizzle.ts`** — Drizzle ORM schema (future reference)
5. **`docs/PRICING_ARCHITECTURE.md`** — This document

---

**Ready to implement? Run migration and proceed to Sprint 1, Week 1 implementation tasks.**
