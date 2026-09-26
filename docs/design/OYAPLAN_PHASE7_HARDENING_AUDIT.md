# OyaPlan Phase 7: Plan → Venue Decision Experience — Hardening & Production Audit

## 1. Executive Summary & Verdict

* **Phase**: Phase 7 — Plan → Venue Decision Experience
* **Charter Alignment**: Delivers Budget Confidence through planning. Solves the core user thought: *"OyaPlan picked this place for us, now tell me more about this place."*
* **Core Philosophy**: Mobile-first, zero fake social proof, tri-state cost clarity (`NULL` = Not provided, `0` = Free, `>0` = Known fee), frictionless Plan ↔ Venue navigation without context destruction.
* **Final Verdict**: `PASS — READY FOR PRODUCTION`

---

## 2. What Changed

| Component / File | Nature of Change | Purpose / User Benefit |
| :--- | :--- | :--- |
| `components/plan/PlanHeroSummary.tsx` | Enhanced Link & Gateway | Makes the recommended venue identity card an interactive gateway to `/venue/[id]` carrying plan context (`fromPlan=true`, squad, budget, vibe, area). |
| `components/plan/PlanWhatYouGet.tsx` | Menu Deep-Link | Adds a direct navigational link to `/venue/[id]#menu` for OyaPlanners seeking the itemized scannable menu. |
| `components/venue/VenuePlanContextCard.tsx` | New Component | Contextual bridge banner rendered when opening a venue from a Plan. Provides 1-tap "Return to Plan", budget alignment indicators, and "Plan This Venue in Forge". |
| `components/venue/VenueDecisionSummary.tsx` | Context-Aware Estimation | Tailors typical squad calculations and Forge outbound links to match the originating plan squad and budget when arriving via `fromPlan`. |
| `components/venue/VenueMobileStickyCTA.tsx` | Plan Context Preservation | Carries originating squad, budget, and vibe into Forge when tapping the sticky "Plan This Venue" button. |
| `app/venue/[id]/PublicVenueClient.tsx` | URL Search Param Bridge | Reads `fromPlan`, `squad`, `budget`, `vibe` query parameters and passes them to the venue decision layer. |
| `app/venue/[id]/page.tsx` | SSR `<Suspense>` Boundary | Wraps `PublicVenueClient` in `<Suspense>` to ensure clean Next.js App Router hydration and production build compatibility. |
| `docs/design/OYAPLAN_PHASE7_VENUE_DECISION_AUDIT.md` | Comprehensive Audit Document | Pre-implementation architectural comparison against Fresha's information architecture and OyaPlan's decision charter. |

---

## 3. Plan → Venue Flow Verification

```text
       FORGE
         ↓
  GENERATED PLAN (/plan/[id])
         ↓
  Interactive Venue Card (Touch Target ≥44×44px, "Explore venue details & menu →")
         ↓
  CANONICAL VENUE PAGE (/venue/[id]?fromPlan=true&squad=4&budget=90000...)
  ┌────────────────────────────────────────────────────────┐
  │ [✓] VenuePlanContextCard: "Recommended In Your Plan"   │
  │     4 People · ₦90,000 Budget · Estimated ~₦81,000     │
  │     [<- Return to Plan]       [Plan This in Forge ->]  │
  ├────────────────────────────────────────────────────────┤
  │ [✓] Venue Decision Summary (Squad of 4 context)        │
  │ [✓] House Charges & Mandatory Terms                    │
  │ [✓] Menu Spending Simulator & Scannable Menu           │
  │ [✓] Operating Hours, Status & Landmark/Location        │
  └────────────────────────────────────────────────────────┘
         ↓                                ↓
  [Return to Plan]                [Plan This Venue]
         ↓                                ↓
  Original /plan/[id]             Forge (Pre-populated)
  (Zero loss of state)
```

---

## 4. Venue Information Architecture Layers

1. **Layer 1 — Decision (Immediate Glance)**:
   - Venue Name, Neighborhood/Area, Category/Experience tag
   - Data Freshness Signal (e.g., *"Pricing verified recently"* vs *"Estimated pricing"*)
   - Operational Status / Hours (computed from canonical `opening_hours` JSON)
   - Estimated Outing Cost for Squad / Typical Spend per Person
   - Primary CTA (*"Plan This Venue"*)

2. **Layer 2 — Understanding (Exploration & Scannability)**:
   - Visual Gallery with editorial responsive aspect ratios
   - Itemized Scannable Menu with search and category navigation
   - House Charges (Service Charge %, VAT %, Corkage, Minimum Spend, Cake Fee)
   - Experience Fit (Date night, Group dining, Outdoor, Nightlife, Chill)
   - Weekly Operating Hours with split-period and closure handling

3. **Layer 3 — Action & Logistics**:
   - Landmark, Address, and Directions action
   - Verified Contact actions (Call, WhatsApp when legitimate)
   - Nearby Alternative Discovery within the same district

---

## 5. Data Sources & Integrity

* **Zero Fabricated Content**: If venue operating hours, pricing, or photos are missing, the UI gracefully renders an honest empty state without stock imagery or fabricated ratings.
* **Tri-State Fee Logic**:
  * `NULL` = Not Provided / Unverified (Never assumed to be zero)
  * `0` = Explicitly Free / No Charge
  * `>0` = Known, transparent mandatory surcharge
* **Confidence Scoring**: Backed by verified partner evidence, operations inspection, or community verification.

---

## 6. Mobile QA & Responsive Matrix

All breakpoints tested and validated:

| Surface | 360px | 390px | 412px | 768px | 1280px | 1440px | Result |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Plan (`/plan/[id]`) | PASS | PASS | PASS | PASS | PASS | PASS | Verified |
| Plan → Venue Link | PASS | PASS | PASS | PASS | PASS | PASS | Verified (≥44px touch) |
| Venue (`/venue/[id]`) | PASS | PASS | PASS | PASS | PASS | PASS | Verified |
| Plan Context Card | PASS | PASS | PASS | PASS | PASS | PASS | Verified |
| Venue → Forge Loop | PASS | PASS | PASS | PASS | PASS | PASS | Verified |
| Saved Spots → Venue | PASS | PASS | PASS | PASS | PASS | PASS | Verified |
| Explore → Venue | PASS | PASS | PASS | PASS | PASS | PASS | Verified |

---

## 7. Accessibility & Performance Audit

* **Accessibility**:
  * Semantic HTML hierarchy (`<main>`, `<section>`, `<h1>`..`<h3>`).
  * Accessible links with descriptive context (not bare URLs or unlabelled icons).
  * High-contrast design tokens: Midnight Lagoon `#010528`, Forest Green `#008751`, Warm Stone `#FAF7F2`.
  * Touch target dimensions strictly ≥44×44px on all interactive elements.
* **Performance**:
  * Static page generation for guides and marketing roots.
  * Turbopack production compilation in under 3 minutes with zero errors.
  * Zero client-side waterfall fetching; data queries executed in parallel server-side.

---

## 8. Regression Protection

* **TypeScript Compilation**: `npx tsc --noEmit` -> 0 Errors.
* **Vitest Suite**: `npx vitest run` -> 100% Passing.
* **Production Build**: `npm run build` -> Exit Code 0 with clean route tree.

---

## 9. Final Verdict

```text
PASS — READY FOR PRODUCTION
```
