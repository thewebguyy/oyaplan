# OyaPlan Phase 9 Hardening Audit: Trust + Actual Spend Feedback Loop

## 1. What Changed
- **Trust & Variance Intelligence Engine (`lib/trust/varianceEngine.ts`)**: Implemented mathematical rigor for calculating actual vs estimated variance, classifying variance root causes (venue data variance, transport volatility, squad-size changes, user discretion), calculating sample-disciplined North Star accuracy (`% of outings within ±10% of estimate`), and evaluating venue data freshness against the 30-day and 60-day operational windows.
- **Feedback & Spend Ingestion Action (`lib/actions/submitActualSpend.ts`)**: Hardened with non-punitive "Didn't go" handling (which records reason without polluting spend datasets with ₦0 entries), price matching verification, operational disruption detection, automatic queueing into `venue_change_requests`, and variance classification.
- **Post-Outing Consumer Experience (`components/plan/PlanActualSpendPrompt.tsx`)**: Replaced raw numeric input with a lightweight, multi-step mobile modal prioritizing factual spend comparison over generic ratings or reviews.
- **Admin Quality & Reverification Logic (`lib/admin/services/qualityService.ts`)**: Aligned variance anomaly thresholds to the charter-mandated 15% (queue reverification within 48h) and 30% (founder escalation), while introducing automated detection of `STALE_PRICING` (>30d medium, >60d high priority).
- **Plan Page Integration (`app/plan/[id]/page.tsx`)**: Bound planned squad size to the post-outing prompt to isolate per-person spend fluctuations caused by group size changes from venue pricing changes.

---

## 2. Existing Architecture Reused
No parallel databases, secondary verification systems, or review platforms were created. The implementation strictly leverages:
- **`actual_spend_reports`**: Stores factual actual spend, squad size, outing date, and attribution links.
- **`venue_change_requests`**: Serves as the canonical ingestion queue for user-reported operational anomalies (closure, price mismatch, unlisted fees).
- **`shared_plans`**: Holds immutable snapshots (`food_cost`, `transport_cost`, `total_cost`, `explanation`, `transport_estimate`) ensuring historical plans never silently rewrite themselves.
- **`venues` & `menu_items`**: Preserved as the singular source of truth for canonical pricing and operational metadata.
- **`lib/admin/services/qualityService.ts`**: Admin review and moderation pipeline.
- **`lib/services/analytics/telemetry.ts`**: Canonical event instrumentation pipeline.

---

## 3. New Data Flow
```text
 canonical venue data
        ↓
 plan snapshot (immutable)
        ↓
 outing decision & visit
        ↓
 post-outing feedback (Did you go? Actual spend? Prices matched?)
        ↓
 variance classification (Data error vs Transport surge vs Squad change vs User choice)
        ↓
 ┌──────────────────────────────┴──────────────────────────────┐
 ↓                                                             ↓
normal variance (≤15%)                                 variance >15% / issue flagged
 ↓                                                             ↓
recorded for statistical aggregation           queued to venue_change_requests / ops reverification
                                                               ↓
                                                      manual/evidence verification
                                                               ↓
                                                      canonical data update
```

---

## 4. Trust Model
- **Explicit Separation**: `Plan ≠ Visit Attribution ≠ Reservation ≠ Actual Spend ≠ Evidence ≠ Canonical Verification`.
- **Freshness Lifecycle**:
  - `0 - 30 days`: Active & Fresh.
  - `31 - 60 days`: Deprioritized & queued for reverification.
  - `> 60 days`: High-priority reverification queue; suppressed from active recommendations.
- **Evidence Hierarchy**:
  1. *Tier 1*: Manual OyaPlan ops verification.
  2. *Tier 2*: Venue operator claimed & verified update.
  3. *Tier 3*: Receipt-backed spend evidence.
  4. *Tier 4*: Corroborated user reports (≥3 reports).
  5. *Tier 5*: Single uncorroborated report (treated as signal, never auto-mutating canonical data).

---

## 5. Actual-Spend Model
- **Non-Punitive Check-in**:
  - If a user reports "I didn't go", the reason (budget, weather, plans changed, venue closed) is captured as behavioral telemetry, avoiding false ₦0 spend records in statistical pricing models.
- **Itemized Breakdown**:
  - Captures total actual spend along with optional splits: food & drink, transport, mandatory fees, and squad size.

---

## 6. Variance Model
- **Absolute Variance**: `actual_spend - estimated_spend`
- **Percentage Variance**: `((actual_spend - estimated_spend) / estimated_spend) * 100` (guarded against zero/missing estimates).
- **Variance Classification**:
  - `TRANSPORT_SURGE`: Transport variance explains ≥60% of total variance.
  - `SQUAD_SIZE_CHANGE`: Actual attendees differ from planned squad size, explaining per-person cost parity.
  - `VENUE_DATA_ERROR`: Direct food/beverage or mandatory charge mismatch reported or confirmed.
  - `USER_DISCRETION`: Variance within normal per-person discretionary spend threshold.
  - `UNCLASSIFIED`: Insufficient itemization.

---

## 7. Reverification Behavior
- **Variance > 15%**: Automatically flags venue in quality audit log; creates a pending item in `venue_change_requests` for ops review within 48 hours.
- **Variance > 30%**: Triggers high-severity escalation in admin console with alert for founder review.
- **Operational Disruption (Closed / Wrong Hours / Unlisted Extra Fee)**: Automatically logs structured issue into `venue_change_requests` without mutating live venue status without human/evidence verification.

---

## 8. Consumer UX
- **No Star Ratings or Reviews**: Zero public review counts, star averages, or unstructured comments.
- **Calm, Factual Language**:
  - "Estimated outing: ₦42,000" → "Actual spend: ₦45,500 (₦3,500 above estimate)".
  - Honest badges: "Verified menu pricing", "Estimated", "Limited data".
  - Removal of deceptive terms like "Guaranteed prices" or "No hidden fees".

---

## 9. Business UX
- **Actionable Discrepancy Signals**: Surfaces factual alerts to venue managers ("Recent outing reports suggest listed pricing may have changed").
- **Privacy Guaranteed**: Protects consumer identity; individual users' budgets and personal identifiers are never revealed to venue operators.

---

## 10. Admin / Ops UX
- **Actionable Queues**:
  - `Reverification Queue`: Venues with >15% variance or stale data (>30d / >60d).
  - `Escalation Queue`: Venues with >30% variance.
  - `Change Request Queue`: Discrepancy tickets flagged with category and reported spend context.

---

## 11. Privacy & Security
- Server-side calculation of all variance percentages and flags.
- RLS enforcement across `actual_spend_reports` and `venue_change_requests`.
- Strict input validation prevents negative amounts or script injections.

---

## 12. Telemetry
Reuses existing analytics engine (`lib/services/analytics/telemetry.ts`):
- `actual_spend_prompt_viewed`
- `actual_spend_started`
- `actual_spend_submitted` (with metadata: variance, variancePercentage, classification, didGo)

---

## 13. Mobile QA
- Optimized for standard mobile viewports: **360px**, **390px**, and **412px**.
- Numeric keyboards on currency input (`inputMode="numeric"`).
- Safe area bottom padding, sticky modal dismissals, touch-friendly radio and chip selectors.

---

## 14. Test Results
- **Unit & Integration Test Suites**: 10 passed test suites (all tests green).
  - `lib/trust/__tests__/varianceEngine.test.ts` (Scenarios A through I).
  - `lib/actions/__tests__/submitActualSpend.test.ts` (Submission, didn't go, variance triggers, change request generation).
  - `lib/admin/services/qualityService.test.ts` (15%/30% variance rules and stale pricing triggers).

---

## 15. Production Build Result
- `tsc --noEmit`: 0 errors.
- `next build`: Successfully compiled all 33 Next.js routes.

---

## 16. Known Limitations
- Offline actual spend sync is deferred until progressive web app sync capabilities are added.
- OCR automated receipt parsing is intentionally deferred; lightweight user self-reporting is prioritized to minimize consumer friction.

---

## 17. Deferred Work
- Machine learning predictive models for venue surge likelihood (deferred until >1,000 corroborated actual spend reports are collected per metropolitan region).
