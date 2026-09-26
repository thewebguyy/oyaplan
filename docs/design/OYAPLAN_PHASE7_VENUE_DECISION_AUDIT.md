# OyaPlan — Phase 7: Venue Decision Experience Audit

**Document:** `docs/design/OYAPLAN_PHASE7_VENUE_DECISION_AUDIT.md`  
**Role:** Senior Product Designer + Senior Frontend Engineer + UX Architect + Trust/Data Product Engineer  
**Status:** Canonical Decision Architecture Audit  

---

## 1. Executive Summary & North Star

OyaPlan is **not a restaurant directory**, **not a social discovery feed**, and **not a booking/reservation platform**. 

> **Product Principle:**  
> *OyaPlan does not help people browse endlessly. It helps them become confident enough to decide where to spend their money.*

The user journey is:
$$\text{Forge} \longrightarrow \text{Plan} \longrightarrow \text{Venue} \longrightarrow \text{Understand} \longrightarrow \text{Decide} \longrightarrow \text{Plan This Venue}$$

The venue page (`/venue/[id]`) is an **intermediate uncertainty-reduction layer**, not a dead-end destination. Its sole objective is to answer the critical questions a planner needs before committing time, social capital, and money.

---

## 2. Decision Questions Framework

A planner contemplating spending ₦30,000–₦150,000 in Lagos must get immediate, factual answers to 9 fundamental questions:

| # | Question | Current Status | Target Architecture Solution |
| :--- | :--- | :--- | :--- |
| **Q1** | **What is this place?** | Partially answered (Hero banner + category). | Large editorial typography, verified vibe tags, category, and curated photo gallery. |
| **Q2** | **Where is it?** | Present (Address text + Google Maps link). | Neighborhood/District breadcrumb, full address, 1-tap Google Maps directions, and Uber ride deep link. |
| **Q3** | **When can I go?** | Inconsistent across spots. | Day-by-day operating hours table. If hours are missing: honest fallback *"Opening hours not yet verified"*. |
| **Q4** | **What does it actually cost?** | Present in Decision Summary. | 3-column spend breakdown: Typical spend/person, 2-person pair, 4-person squad. Landed cost framing (food + drinks + house fees). |
| **Q5** | **What can we realistically get?** | Simulated in Budget Scenario. | Interactive Spending Simulator using verified item prices across squad sizes (2, 4, 6) and budgets. |
| **Q6** | **Are there important charges or policies?** | Handled in Good to Know. | Strict **NULL / 0 / >0** semantics for VAT, Service Charge, Corkage Fee, Cake Fee, Minimum Spend, and Table Policy. |
| **Q7** | **Does it fit the kind of outing I'm planning?** | Handled in Experience Fit. | Occasion match, noise level, lighting, squad suitability (backed exclusively by database metadata). |
| **Q8** | **Why did OyaPlan choose it?** | Rendered only when arriving from Plan. | `VenuePlanContextCard` displays originating squad, budget, and vibe match + "Return to Plan" button. |
| **Q9** | **What should I do next?** | Handled via CTAs. | Primary action: **"Plan This Venue"** $\rightarrow$ pins venue in Forge with pre-populated parameters. Secondary: **"Save Spot"** $\rightarrow$ localStorage synced list. |

---

## 3. Data Availability & Schema Integrity Matrix

Every displayed field must map to a verifiable source without fabricated data:

| Field Name | DB Column / Source | Type | Verified / Estimated | Fallback Behavior when Missing / NULL |
| :--- | :--- | :--- | :--- | :--- |
| **Venue Name** | `venues.name` | `string` | Canonical Fact | Required; not-found trigger if missing. |
| **Address** | `venues.address` | `string` | Canonical Fact | Fallback to district name or `Lagos`. |
| **District / Area** | `districts.name`, `districts.slug` | `string` | Canonical Fact | Defaults to `Lagos` / `ikeja`. |
| **Category** | `venues.category` | `string` | Canonical Fact | Defaults to `Restaurant` or `Lounge`. |
| **Vibe Tags** | `venues.vibe_tags` | `string[]` | Verified/Curated | Defaults to `["Chill"]`. |
| **Derived Typical Cost** | `venues.derived_typical_cost` | `number` | Estimated/Derived | Fallback to category baseline (₦18,000/person) with explicit *Estimated* badge. |
| **Cover & Gallery** | `venues.cover_url`, `venue_photos` | `string[]` | Verified Asset | Clean editorial geometric placeholder with category icon. No generic stock photography. |
| **Menu Items** | `menu_items` table | `MenuItem[]` | Verified / Partner | Category filter tabs. If empty: *"Menu indexing in progress"* banner. |
| **VAT %** | `venues.vat_pct` | `number \| null` | Regulatory / Fact | `NULL` $\rightarrow$ *"Not stated"*; `0` $\rightarrow$ *"Inclusive / 0%"*; `>0` $\rightarrow$ `"{vat}%"`. |
| **Service Charge %** | `venues.service_charge_pct` | `number \| null` | House Policy | `NULL` $\rightarrow$ *"Not stated"*; `0` $\rightarrow$ *"No service charge"*; `>0` $\rightarrow$ `"{sc}%"`. |
| **Corkage Fee** | `venues.corkage_fee` | `number \| null` | House Policy | `NULL` $\rightarrow$ *"Not stated"*; `0` $\rightarrow$ *"Free"*; `>0` $\rightarrow$ `"₦{fee} / bottle"`. |
| **Cake Fee** | `venues.cake_fee` | `number \| null` | House Policy | `NULL` $\rightarrow$ *"Not stated"*; `0` $\rightarrow$ *"Free"*; `>0` $\rightarrow$ `"₦{fee}"`. |
| **Minimum Spend** | `venues.minimum_spend` | `number \| null` | House Policy | `NULL` $\rightarrow$ *"Not stated"*; `0` $\rightarrow$ *"None"*; `>0` $\rightarrow$ `"₦{fee}"`. |
| **Opening Hours** | `venues.opening_hours` | `JSON` | Operational Fact | `NULL` / `{}` $\rightarrow$ *"Opening hours not yet verified"*. |
| **Contact Phone / WA** | `venues.contact_number` | `string \| null` | Operational Fact | If `null`, contact buttons are cleanly omitted (no dead buttons). |

---

## 4. Current Journey Friction & Deficiencies

### Identified Friction Points:

1. **Weak Context Continuity from Plan:**
   - In `/plan/[id]`, the venue hero card links to `/venue/[id]`, but if a user taps it, they need an effortless way to return to their exact generated plan or jump forward into editing the venue in Forge.
   - Fixed: `VenuePlanContextCard` and sticky return buttons.

2. **Mobile Viewport Ergonomics (360px – 412px):**
   - Anchor navigation and menu category pills require horizontal drag with no clipping or layout shift.
   - Sticky action bar (`VenueMobileStickyCTA`) must observe iOS/Android `env(safe-area-inset-bottom)` and provide 48px thumb targets.

3. **Honest Operational Semantics:**
   - Never show "Open Now" or "No Hidden Fees" unless backed by explicit non-null DB records.
   - If a venue is marked `temporarily_closed` or `under_maintenance`, a top-level alert banner must immediately notify the planner before they coordinate a squad.

4. **"Plan This Venue" Action Directness:**
   - Tapping "Plan This Venue" must link to `/forge?pinned=[venueId]&area=[areaSlug]&squad=[squad]&budget=[budget]&vibe=[vibe]&fresh=true`.
   - Pins the venue in the Forge engine so matching filters preserve the user's intent.

---

## 5. Implementation Strategy & Deliverables

1. **Plan Output Integration:**
   - Verify all links from Plan Hero Summary (`components/plan/PlanHeroSummary.tsx`) and Plan What You Get (`components/plan/PlanWhatYouGet.tsx`) cleanly forward context parameters to `/venue/[id]`.
2. **Venue Decision Page Polish:**
   - `PublicVenueClient.tsx`: Full orchestration with breadcrumbs, plan context card, anchor nav, decision summary, budget simulator, scannable menu, experience fit, good to know, nearby discovery, and mobile sticky CTA.
3. **Mobile & Accessibility Hardening:**
   - Touch targets $\ge 44\times 44\text{px}$.
   - Full keyboard navigation and visible focus rings.
   - No horizontal layout overflow at 360px.
4. **Hardening & Verification:**
   - Document in `docs/design/OYAPLAN_PHASE7_HARDENING_AUDIT.md`.
   - Run complete TypeScript and test suite checks.
