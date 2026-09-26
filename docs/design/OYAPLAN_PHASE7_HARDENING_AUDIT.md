# OyaPlan — Phase 7: Hardening & Production Verification Audit

**Document:** `docs/design/OYAPLAN_PHASE7_HARDENING_AUDIT.md`  
**Role:** Senior Frontend Engineer + Product Reliability Engineer + QA Engineer + Trust/Data Reviewer  
**Status:** Verification Complete — Production Safe  

---

## 1. Scope & Acceptance Criteria Verification

Phase 7 hardened the core consumer decision journey:
$$\text{Forge} \longrightarrow \text{Plan} \longrightarrow \text{Venue} \longrightarrow \text{Understand} \longrightarrow \text{Decide} \longrightarrow \text{Plan This Venue}$$

| Verification Area | Requirement | Result | Evidence / Implementation |
| :--- | :--- | :---: | :--- |
| **Plan $\rightarrow$ Venue Continuity** | Plan page venue cards & titles link directly to `/venue/[id]` with contextual params. | **PASS** | `PlanHeroSummary.tsx` & `PlanWhatYouGet.tsx` forward `fromPlan=true`, `squad`, `budget`, `vibe`, `startArea`. |
| **Venue Context Header** | When arriving from Plan, display `VenuePlanContextCard` with squad/budget match and return button. | **PASS** | `VenuePlanContextCard.tsx` renders matching breakdown + `router.back()` return button. |
| **Data Integrity & NULL Semantics** | Strict distinction between `NULL` (Not stated), `0` (Free / 0%), and `>0` (Fee). | **PASS** | Verified in `VenueGoodToKnow.tsx` for VAT, Service Charge, Corkage, Cake, Minimum Spend. |
| **Landed Cost Transparency** | 3-column spend breakdown (per person, 2-person pair, 4-person squad) + realistic transport. | **PASS** | `VenueDecisionSummary.tsx` & `VenueBudgetScenario.tsx` calculate squad transport & per-person splits. |
| **Scannable Menu** | Categorized menu tabs with count badges, item prices, and graceful empty states. | **PASS** | `VenueScannableMenu.tsx` handles Food, Drinks, Desserts, Activities, with honest indexing fallback. |
| **Sticky Anchor Navigation** | Mobile horizontal scroll with active state tracking. | **PASS** | `VenueStickyAnchorNav.tsx` ordered as: *What It Costs*, *What You Can Get*, *Menu*, *Vibe & Fit*, *Good to Know*. |
| **Mobile Sticky CTA** | 48px thumb target with safe-area padding for 1-tap Save & Plan actions. | **PASS** | `VenueMobileStickyCTA.tsx` with `env(safe-area-inset-bottom)` and `tap-feedback`. |
| **Multi-Entry Journey Coherence** | Works seamlessly from Plan, Explore, Saved, Recently Viewed, and direct URLs. | **PASS** | Clean fallback parameters when `fromPlan` is omitted. |
| **Mobile Viewport Robustness** | Tested at 360px, 390px, 412px viewports without horizontal scroll leaks. | **PASS** | Flex wrapping, text truncation, and responsive padding. |

---

## 2. Multi-Journey Verification Matrix

1. **Journey A: Budget Planner (Forge $\rightarrow$ Plan $\rightarrow$ Venue $\rightarrow$ Plan)**
   - User sets ₦90,000 budget for 4 people $\rightarrow$ generates plan $\rightarrow$ taps venue card $\rightarrow$ reviews `VenuePlanContextCard` showing 4 people / ₦90k match $\rightarrow$ tests budget simulator $\rightarrow$ clicks "Plan This Venue" $\rightarrow$ opens Forge with pinned venue and preserved squad/budget.
2. **Journey B: Explore User (Explore $\rightarrow$ Venue $\rightarrow$ Plan)**
   - User opens venue directly from Explore $\rightarrow$ no plan banner rendered $\rightarrow$ reads typical spend (₦18,000/person) $\rightarrow$ taps "Plan This Venue" $\rightarrow$ opens Forge prefilled with 2 people and ₦36,000 default.
3. **Journey C: Saved User (Saved Spots $\rightarrow$ Venue $\rightarrow$ Plan)**
   - Taps saved venue card $\rightarrow$ heart button immediately shows filled state $\rightarrow$ navigates through anchor tabs smoothly.
4. **Journey D: Incomplete Data Graceful Degradation**
   - Venue with no photos: renders clean editorial placeholder (no broken images or stock photos).
   - Venue with no itemized menu: renders *"Menu indexing in progress"* without breaking the budget simulator.
   - Venue with no opening hours: renders *"Opening schedule verification in progress"*.

---

## 3. Automated Suite Verification

* **TypeScript Typecheck (`npx tsc --noEmit`)**: 0 errors
* **Vitest Suite (`npx vitest run`)**: All test suites passed
* **Next.js Production Build (`npm run build`)**: Static generation & dynamic routes compiled cleanly

---

## 4. Architectural Invariants Preserved

* **Brand Green**: `#008751` preserved throughout.
* **Midnight Lagoon**: `#010528` preserved as primary dark neutral.
* **No Speculative Infrastructure**: Zero extra dependencies or phantom DB tables created.
* **Privacy & Telemetry**: Safe anonymous client event logging (`venue_viewed`, `transport_actual_feedback`).
