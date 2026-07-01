# Pricing Architecture Implementation Checklist

**Sprint 1 (Week 1–2): Foundation**

## Phase 1A: Database Schema (Day 1)

- [ ] Apply migration `0012_price_submissions.sql`
  ```bash
  supabase migration up
  ```

- [ ] Verify migration applied
  ```sql
  SELECT to_regclass('public.price_submissions');  -- Should return OID
  ```

- [ ] Verify table structure
  ```bash
  psql -d $DATABASE_URL -c "\d price_submissions"
  ```

- [ ] Verify indexes created
  ```sql
  SELECT indexname FROM pg_indexes WHERE tablename = 'price_submissions';
  -- Should list 6 indexes: duplicate_guard, pending, spot_aggregation, session, source, reviewed_by
  ```

- [ ] Verify trigger created
  ```sql
  SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'price_submissions';
  -- Should include: price_submissions_immutability
  ```

- [ ] Verify RLS enabled
  ```sql
  SELECT relrowsecurity FROM pg_class WHERE relname = 'price_submissions';
  -- Should return true
  ```

- [ ] Verify RLS policies created
  ```sql
  SELECT policyname FROM pg_policies WHERE tablename = 'price_submissions';
  -- Should list 3 policies: anyone can insert, admins can review, public read
  ```

---

## Phase 1B: TypeScript Types (Day 1)

- [ ] Add types file: `lib/types/priceSubmission.ts`
  ```typescript
  import type { PriceSubmission, CreatePriceSubmissionInput, PriceConfidence } from '@/lib/types/priceSubmission';
  ```

- [ ] Update `lib/types.ts` to export from price submission module
  ```typescript
  export * from './priceSubmission';
  ```

- [ ] Verify types compile
  ```bash
  tsc --noEmit
  ```

---

## Phase 1C: Query Functions (Day 2)

- [ ] Add query file: `lib/queries/priceAggregation.ts`
  - [ ] `getSpotPrice(spotId)` - main query
  - [ ] `calculateConfidence(data)` - pure function
  - [ ] `confidenceTierFromScore(score)` - pure function
  - [ ] `checkDuplicateSubmission(spotId, sessionId)` - duplicate guard
  - [ ] `getPendingSubmissions(limit, offset)` - admin queue
  - [ ] `invalidatePriceCache(spotId)` - cache invalidation

- [ ] Test query functions with real data
  ```typescript
  import { getSpotPrice } from '@/lib/queries/priceAggregation';
  const price = await getSpotPrice('00000000-0000-0000-0000-000000000001');
  console.log(price);  // Should return PriceConfidence or fallback
  ```

---

## Phase 2A: Submission Endpoint (Day 3)

- [ ] Create `lib/actions/submitPriceEvidence.ts`
  - [ ] Function: `submitPriceEvidence(input: CreatePriceSubmissionInput)`
  - [ ] Validate input (price in range, date not future, etc.)
  - [ ] Duplicate guard check
  - [ ] Rate limiting per session
  - [ ] Insert to `price_submissions` with `status='pending'`
  - [ ] Return `{ id, status: 'submitted' }`

- [ ] Error handling
  - [ ] `DuplicateSubmissionError` if recent submission exists
  - [ ] `PriceSubmissionValidationError` for validation failures
  - [ ] `RateLimitExceededError` for >5 submissions per day
  - [ ] Clear error messages for users

- [ ] Test endpoint
  ```typescript
  import { submitPriceEvidence } from '@/lib/actions/submitPriceEvidence';
  const result = await submitPriceEvidence({
    spotId: '...',
    totalPerPerson: 15000,
    dateOfSpend: '2026-07-01',
    squadSize: 3
  });
  console.log(result);  // { id: UUID, status: 'submitted' }
  ```

---

## Phase 2B: Moderation Endpoint (Day 3)

- [ ] Create `lib/actions/moderatePriceSubmission.ts`
  - [ ] Function: `approvePriceSubmission(submissionId, adminId)`
  - [ ] Function: `rejectPriceSubmission(submissionId, adminId, reason)`
  - [ ] Update only moderation fields (status, reviewed_at, reviewed_by)
  - [ ] Invalidate cache after update
  - [ ] Log moderation action

- [ ] Test immutability trigger
  ```typescript
  // Insert test submission
  const { id } = await submitPriceEvidence({ ... });
  
  // Approve it
  await approvePriceSubmission(id, 'test-admin');
  
  // Verify status updated
  const { data } = await supabase
    .from('price_submissions')
    .select('status, reviewed_at, reviewed_by')
    .eq('id', id)
    .single();
  // status should be 'approved', reviewed_at and reviewed_by should be set
  ```

- [ ] Test immutability protection
  ```typescript
  // Try to update evidence (should fail)
  const { error } = await supabase
    .from('price_submissions')
    .update({ total_per_person: 20000 })
    .eq('id', id);
  // error.message should contain 'total_per_person is immutable'
  ```

---

## Phase 2C: Cache Layer (Day 4)

- [ ] Choose cache backend
  - [ ] Option 1: Vercel KV (`@vercel/kv`)
  - [ ] Option 2: In-memory Map (simple, sufficient for MVP)
  - [ ] Option 3: Redis (if self-hosted)

- [ ] Create `lib/cache/priceCache.ts`
  ```typescript
  export async function get(key: string): Promise<T | null>;
  export async function set(key: string, value: T, options?: { ttl?: number }): Promise<void>;
  export async function invalidate(key: string): Promise<void>;
  ```

- [ ] Integration with `getSpotPrice()`
  ```typescript
  export async function getSpotPrice(spotId: string): Promise<PriceConfidence> {
    const cached = await cache.get(`spot:${spotId}`);
    if (cached) return cached;
    
    // ... query database ...
    
    await cache.set(`spot:${spotId}`, result);
    return result;
  }
  ```

- [ ] Integration with moderation
  ```typescript
  export async function approvePriceSubmission(submissionId: string, adminId: string) {
    // ... update database ...
    await cache.invalidate(`spot:${spotId}`);
  }
  ```

---

## Phase 3A: Admin Moderation UI (Day 5)

- [ ] Create `app/admin/price-submissions/page.tsx`
  - [ ] Server Component: fetch pending submissions
  - [ ] Client Component: `PriceSubmissionsClient.tsx`
    - [ ] List pending submissions (pagination)
    - [ ] For each submission: show venue name, price, date, user context
    - [ ] Show current price in database (for comparison)
    - [ ] Buttons: Approve / Reject with modal
    - [ ] Reject requires reason (dropdown or text field)

- [ ] Create `components/PriceSubmissionCard.tsx`
  - [ ] Show submission details
  - [ ] Show confidence calculation (preview)
  - [ ] Approve/Reject actions

- [ ] Create rejection reason selector
  ```typescript
  const rejectionReasons = [
    'price_implausible',      // ₦500 or ₦500k
    'spot_closed',            // Venue no longer exists
    'duplicate',              // Same user, same spot
    'insufficient_context',   // No squad size provided
    'suspicious_pattern',     // Potential spam
    'other'
  ];
  ```

- [ ] Test moderation workflow
  1. Submit price (go to pending status)
  2. View in admin dashboard
  3. Approve (status → approved, cache invalidated)
  4. Verify new price appears in forge results

---

## Phase 3B: User Price Report Form (Day 5–6)

- [ ] Create `components/PriceReportForm.tsx` (progressive profiling)
  - [ ] Step 1: Total per person (required)
  - [ ] Step 2: Transport cost (optional)
  - [ ] Step 3: Food/drink breakdown (optional)
  - [ ] Step 4: Context - date, time, squad size (optional)

- [ ] Styling
  - [ ] Mobile-first (90% of users)
  - [ ] Match existing OyaPlan design
  - [ ] Success message on submit

- [ ] Integrate into `ForgeResultsClient.tsx`
  - [ ] Add "Report actual price?" link if confidence < 0.6
  - [ ] Or "Help us verify prices" CTA below results

- [ ] Test form
  1. Fill Step 1, submit
  2. Verify submission created with status='pending'
  3. Verify in admin queue
  4. Approve and verify price updates

---

## Phase 4A: Confidence Display (Day 6)

- [ ] Update `components/PlanCard.tsx`
  - [ ] Show confidence badge (✓ ⚠️ ? ⚡)
  - [ ] Show "Based on X submissions"
  - [ ] Show "Last updated X days ago"
  - [ ] Show price range if spread > 10%

- [ ] Badge styling
  ```typescript
  const badgeColor = {
    verified: 'bg-green-100 text-green-800',
    community_verified: 'bg-blue-100 text-blue-800',
    updated: 'bg-yellow-100 text-yellow-800',
    estimated: 'bg-gray-100 text-gray-800',
    unknown: 'bg-red-100 text-red-800'
  };
  ```

- [ ] Test badge display
  1. View forge results
  2. Prices show confidence badges
  3. Hover shows explanation

---

## Phase 4B: Stale Price Warning (Day 6)

- [ ] Update `ForgeResultsClient.tsx`
  - [ ] If confidence < 0.5, show warning
  - [ ] "Help us verify prices? Report ₦X"
  - [ ] Click opens price report form

- [ ] Test stale warning
  1. Seed database with old price (6 months)
  2. View forge results
  3. Warning appears
  4. User can submit new price

---

## Testing Checklist

### Unit Tests

- [ ] `calculateConfidence()` with various inputs
  ```typescript
  test('confidence: 10 submissions, 0 days, tight spread, operator → 0.95+', () => {
    const conf = calculateConfidence({
      submissionCount: 10,
      daysSinceLatest: 0,
      median: 15000,
      stddev: 1500,  // 10% CoV
      hasOperator: true
    });
    expect(conf).toBeGreaterThanOrEqual(0.95);
  });
  ```

- [ ] `confidenceTierFromScore()` for each tier
- [ ] Validation in `submitPriceEvidence()` (price bounds, date)
- [ ] Duplicate guard logic
- [ ] Cache invalidation

### Integration Tests

- [ ] Submit price → appears in pending queue
- [ ] Approve price → status updated, cache invalidated
- [ ] Reject price → rejection_reason saved
- [ ] Immutability trigger prevents evidence updates
- [ ] RLS allows anon inserts, admin updates

### E2E Tests

- [ ] User submits price (Step 1 → approved in admin)
- [ ] Admin reviews and approves
- [ ] Price appears in forge results with confidence badge
- [ ] Stale price shows warning

### Performance Tests

- [ ] Duplicate guard query < 1ms (index on hand)
- [ ] Aggregate computation < 5ms
- [ ] Cache hit < 1μs (in-memory)
- [ ] Table size tracking (should be ~900KB at 6k submissions)

---

## Verification Queries

### Data Integrity

```sql
-- Count approved submissions
SELECT COUNT(*) FROM price_submissions WHERE status = 'approved';

-- Count pending submissions
SELECT COUNT(*) FROM price_submissions WHERE status = 'pending';

-- Count rejected submissions and reasons
SELECT rejection_reason, COUNT(*) FROM price_submissions 
WHERE status = 'rejected' GROUP BY rejection_reason;

-- Oldest submission (freshness check)
SELECT MIN(date_of_spend) as oldest_data FROM price_submissions WHERE status = 'approved';

-- Most active venues
SELECT spot_id, COUNT(*) FROM price_submissions 
WHERE status = 'approved' GROUP BY spot_id ORDER BY COUNT(*) DESC LIMIT 10;
```

### Schema Integrity

```sql
-- Verify constraints
SELECT constraint_name, constraint_type FROM information_schema.table_constraints 
WHERE table_name = 'price_submissions';

-- Verify indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'price_submissions';

-- Verify trigger
SELECT trigger_definition FROM information_schema.triggers 
WHERE event_object_table = 'price_submissions';

-- Verify RLS policies
SELECT policyname, permissive, cmd FROM pg_policies WHERE tablename = 'price_submissions';
```

---

## Deployment Checklist

Before going to production:

- [ ] All tests pass
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No ESLint errors (`eslint`)
- [ ] Database migration tested on staging
- [ ] Cache backend configured (KV, Redis, or in-memory)
- [ ] Environment variables set (NEXT_PUBLIC_SUPABASE_URL, etc.)
- [ ] Error monitoring configured (Sentry)
- [ ] Admin user has dashboard access
- [ ] Rollback plan documented and tested

---

## Post-Launch Monitoring (Week 1–2)

- [ ] Check admin dashboard daily
  - [ ] Any pending submissions stuck?
  - [ ] Rejection rate (should be <5%)
  - [ ] Submission rate (target: >5 per day)

- [ ] Watch error logs
  - [ ] Immutability violations (should be zero)
  - [ ] RLS policy errors (should be zero)
  - [ ] Cache invalidation issues

- [ ] Monitor database
  - [ ] Query latency (aggregate should be <5ms)
  - [ ] Table size (should grow linearly)
  - [ ] Index performance

- [ ] User feedback
  - [ ] Price accuracy (survey or indirect signals)
  - [ ] Form completion rate (target: >50% for Step 1)
  - [ ] Trust in confidence badges

---

## Files Created

| File | Purpose | Type |
|---|---|---|
| `0012_price_submissions.sql` | Forward migration | SQL |
| `0012_price_submissions_rollback.sql` | Rollback migration | SQL |
| `lib/types/priceSubmission.ts` | TypeScript types | TypeScript |
| `lib/queries/priceAggregation.ts` | Query functions | TypeScript |
| `lib/actions/submitPriceEvidence.ts` | Submit endpoint | TypeScript |
| `lib/actions/moderatePriceSubmission.ts` | Moderation endpoint | TypeScript |
| `lib/cache/priceCache.ts` | Cache wrapper | TypeScript |
| `app/admin/price-submissions/page.tsx` | Admin dashboard | React |
| `components/PriceReportForm.tsx` | User form | React |
| `components/PriceSubmissionCard.tsx` | Card component | React |
| `schema/priceSubmission.drizzle.ts` | Drizzle reference | TypeScript |
| `docs/PRICING_ARCHITECTURE.md` | Design documentation | Markdown |

---

## Success Criteria

**By end of Sprint 1:**
- [ ] Migration applied without errors
- [ ] Database schema verified
- [ ] Query functions tested
- [ ] Submission endpoint working
- [ ] Moderation endpoint working
- [ ] All TypeScript checks pass

**By end of Sprint 2:**
- [ ] Admin UI deployed
- [ ] Price report form live
- [ ] Confidence badges displaying
- [ ] 10+ test submissions collected
- [ ] 80%+ approval rate on submissions

**By end of Week 3:**
- [ ] 100+ submissions collected
- [ ] 70% of spots have 1+ community price report
- [ ] Admin reviewing submissions daily
- [ ] First price improved beyond seed data

---

## Support

**Questions about the migration?**
- See: `docs/PRICING_ARCHITECTURE.md` → Design Decisions section
- Or: `0012_price_submissions.sql` → Comments in migration file

**Errors during deployment?**
- Check: Supabase migration logs
- Rollback: Run `0012_price_submissions_rollback.sql`
- Test locally: `supabase start && supabase migration up`

**Stuck on implementation?**
- TypeScript types: See `lib/types/priceSubmission.ts`
- Query usage: See `lib/queries/priceAggregation.ts`
- UI integration: See `PRICING_ARCHITECTURE.md` → Testing the Migration

---

**Ready to start? Begin with Phase 1A (Day 1).**
