# OyaPlan — Business Experience & Monetization Hardening Audit

**Document Status:** Canonical Implementation & Hardening Audit  
**Date:** September 2026  
**System:** OyaPlan Marketplace B2B & Commercial Architecture  
**Scope:** `/for-business`, `/business/*`, `/partner/*`, and Consumer Pricing Consistency

---

## 1. Executive Summary & Business Model

OyaPlan is a **free-to-list decision intelligence marketplace** for real-world dining, nightlife, and recreational venues across Lagos. The platform helps squads answer the core question: *"Know what I'll probably spend before I leave home."*

The re-engineered business experience aligns all marketing, acquisition, onboarding, and portal workflows with the canonical commercial reality:

$$\text{Free Listing} \longrightarrow \text{Discovery} \longrightarrow \text{Planning} \longrightarrow \text{Reservation Request} \longrightarrow \text{Direct Venue Deposit} \longrightarrow \text{Attributed Commission} \longrightarrow \text{Visit} \longrightarrow \text{Spend Feedback} \longrightarrow \text{Model Calibration}$$

### Core Tenets Reconciled:
1. **Free Listing Model:** Businesses pay nothing to be listed on OyaPlan. Broad supply (hundreds of venues) is maintained with verified or honest estimated data.
2. **First Cohort Depth:** The initial ~20 priority venues form the deep partner cohort for rich pricing, menu verification, and reservation workflows without excluding the broader marketplace.
3. **Transparent Monetization:** OyaPlan earns an attributed commission on qualifying reservations generated through the platform. No fake percentages (e.g. 10%, 15%) are fabricated.
4. **Zero Payment Custody:** Customers pay table reservation deposits **100% directly to the venue**. OyaPlan does **not** operate wallets, escrow, or deposit holding accounts.
5. **Trust-First Architecture:** Strict state separation between *Reservation Request* $\rightarrow$ *Venue Confirmation* $\rightarrow$ *Confirmed Reservation*. No synthetic booking dashboards, fake conversion rates, or fabricated revenue graphs.

---

## 2. Free Listing & Marketplace Supply Strategy

### Broad Supply vs. Deep Cohort Architecture
* **Broad Marketplace Supply (Hundreds of Venues):**
  - Any real-world venue in Lagos can have a presence on OyaPlan.
  - Listings with unverified or crowd-sourced pricing are explicitly badged as **Estimated** (e.g., standard baseline ranges like ₦5,000–₦6,000) rather than leaving listings blank or falsely claiming verification.
* **Deep Cohort Partners (~20 Priority Venues):**
  - Direct operator relationships with verified menu items, confirmed house policies (VAT, service charge, corkage, celebration rules), and managed reservation deposits.
  - The business experience does not present the first 20 as "the only venues that matter" or promise artificial ranking boosts. Instead, it positions verification as the foundation for squad budget confidence and reservation intent.

---

## 3. The 3-Sided Marketplace Relationship

The new component `BusinessMarketplaceRelationship.tsx` on `/for-business` formalizes the relationship across all three parties:

| Stakeholder | Role in the Ecosystem | Commercial / Value Exchange |
| :--- | :--- | :--- |
| **Customers (Squads)** | Discover spots, compare transparent costs, build outing itineraries, share with friends via WhatsApp, and request table reservations. | Zero cost to plan. Total budget clarity before departure. Deposits paid directly to venue. |
| **Businesses (Venues)** | Claim free listing, maintain accurate menus and house policies, receive planning demand signals, and accept reservation requests. | Free listing. 100% direct receipt of customer deposits. Incremental high-intent footfall. |
| **OyaPlan** | Aggregates discovery, delivers cost intelligence engines, provides reservation attribution infrastructure, and maintains trust data. | Earns an attributed commission on qualifying reservations generated through the platform. |

---

## 4. Reservation State Machine & Trust Boundaries

To protect customer and venue trust, the product enforces strict linguistic and architectural boundaries between planning, reservation, and attendance:

```
[Squad Plan Built]
       │
       ▼ (Planners choose venue & party size)
[Reservation Request Submitted]  <── State: "Request Pending" (NOT "Booked")
       │
       ▼ (Venue verifies table availability & collects deposit directly)
[Venue Confirmation]            <── State: "Venue Accepted"
       │
       ▼ (Both parties confirmed)
[Confirmed Reservation]          <── State: "Confirmed Reservation"
       │
       ▼ (Squad arrives at venue)
[Attributed Visit]              <── Validated via 6-character squad plan code
       │
       ▼ (Post-visit bill feedback)
[Actual Spend Feedback]         <── Calibrates budget intelligence engine
```

### Trust Boundary Rules Enforced in UI:
- **Never promise "Instant Confirmation"** unless an automated venue PMS/table management API is integrated and authoritative.
- **Reservation Request $\neq$ Confirmed Reservation:** Planners submit a *request*; venues review and confirm.
- **Plan $\neq$ Reservation $\neq$ Visit $\neq$ Spend:** Each event is tracked independently in copy and data models.

---

## 5. Direct Deposit Flow (Zero Payment Custody)

OyaPlan explicitly disclaims payment custody across all consumer and business touchpoints:

- **What OyaPlan Does:** Facilitates the reservation request, communicates the required table deposit, and attributes the booking.
- **What OyaPlan Does NOT Do:** OyaPlan does NOT collect customer deposits, operate customer wallets, manage venue escrow, hold bank account balances, or act as a financial intermediary.
- **Copy Standard:**
  > *"Customers pay reservation deposits directly to the venue. OyaPlan does not collect or hold customer deposits."*
- **Audit Points Verified:**
  - `BusinessHero.tsx`: Direct deposit badge and visual bridge note.
  - `BusinessReservationSection.tsx`: Step 3 highlights direct venue payment.
  - `BusinessFAQ.tsx`: Dedicated Q&A explaining direct deposit handling.
  - `BusinessReservationsCard.tsx`: Business portal dashboard banner and empty states.
  - `BusinessPricingClient.tsx`: Table Reservation Deposit input field guidance.
  - `PartnerOnboardingClient.tsx`: Step 2 charges form guidance.
  - `PublicPricingSection.tsx`: Consumer pricing breakdown specifies `(Paid directly to venue)`.

---

## 6. Commission & Monetization Model

- **Canonical Rule:** OyaPlan earns an attributed commission on qualifying reservations generated through the platform.
- **Zero Fabricated Percentages:** The repository does not currently contain a finalized, global commission rate. In accordance with Section 7 of the specification, the product does **not** invent arbitrary rates (e.g. 5%, 10%, 15%, 20%) or synthetic pricing tables.
- **Commercial Notice Text:**
  > *"OyaPlan earns a commission on qualifying reservations made through the platform."*
- **Future Settlement State Machine Documented:**
  `reservation_requested` $\rightarrow$ `venue_confirmed` $\rightarrow$ `reservation_completed` $\rightarrow$ `commission_eligible` $\rightarrow$ `commission_recorded` $\rightarrow$ `commission_settled`.

---

## 7. Audit of Modified Files & Changes

### A. Marketing & Business Acquisition (`/for-business`)
1. **`components/business/BusinessHero.tsx`**:
   - Replaced pure "presence & ranking" messaging with dual narrative: **Demand Generation** (people deciding where to spend) + **Conversion** (decisions turn into reservations).
   - Added interactive Lagos visual bridge showing the 2-sided marketplace loop:
     $$\text{Consumer Plan (₦80,000 for 4)} \longrightarrow \text{OyaPlan Matching} \longrightarrow \text{Venue Request Received} \longrightarrow \text{Confirmed Outing}$$
   - Primary CTA updated to `Get Started — It's Free`; secondary CTA to `See How Reservations Work` (anchoring to `#reservations`); supporting link to `Explore the marketplace`.
   - Trust anchors highlighted: `₦0 Free listing`, `100% Direct deposits to your venue`, and `Attributed commission on bookings`.

2. **`components/business/BusinessReservationSection.tsx`** *(New)*:
   - 4-step reservation journey breakdown:
     1. Squad Plans Outing
     2. Squad Requests Reservation
     3. Venue Confirms & Accepts Direct Deposit
     4. Squad Visits & OyaPlan Earns Commission
   - Clear callout on reservation request vs. confirmed booking trust rules.

3. **`components/business/BusinessMarketplaceRelationship.tsx`** *(New)*:
   - Comprehensive 3-column breakdown of what Customers, Businesses, and OyaPlan do and receive.
   - Prominent disclaimer on direct deposits and honest commission terms.

4. **`components/business/BusinessMarketingHeader.tsx`**:
   - Re-engineered `featureGroups` mega menu to reflect the 4 stages of the business lifecycle:
     - **Get Discovered** (*Available*): Business Profile, Marketplace Presence, Experience & Category Fit.
     - **Get Chosen** (*Available*): Menus & Pricing, Cost Transparency, House Policies, Planning Context.
     - **Get Booked** (*In Development*): Reservation Requests, Booking Attribution, Customer Visit Identification.
     - **Learn & Improve** (*Available / In Development*): Demand Signals, Planning Insights, Actual Spend Feedback, Data Corrections.
   - Updated primary action button to `Get Started` (pointing to `/for-business#claim`).

5. **`components/business/BusinessNarrativeJourney.tsx`**:
   - Rebuilt as the complete 5-step journey:
     - `01 — Get Discovered` (Appear when squads plan)
     - `02 — Help Them Decide` (Accurate menus and policies remove uncertainty)
     - `03 — Get The Reservation` (Planners request reservations where supported)
     - `04 — Serve The Customer` (Direct deposits and warm hospitality)
     - `05 — Learn & Calibrate` (Actual spend feedback improves future planning accuracy)

6. **`components/business/motion/BusinessMarquee.tsx`**:
   - Updated all 6 product cards to reflect commercial reality:
     - *Marketplace Presence* (Free listing across Lagos)
     - *Menus & Pricing* (Transparent per-person spending)
     - *Planning Demand* (Upstream intent before leaving home)
     - *Reservation Requests* (Direct deposits, zero intermediary escrow)
     - *Visit Attribution* (6-character plan codes)
     - *Actual Spend Feedback* (Squad receipt accuracy loop)

7. **`components/business/BusinessTypesSection.tsx`**:
   - Retained dynamic query backing (`SpotCategory`).
   - Updated header and category cards to communicate broad supply across all Lagos entertainment sectors.

8. **`components/business/BusinessFoundingPartner.tsx`**:
   - Reframed from badge-centric SaaS to: *"You are where the customer decides"*.
   - Explains the priority cohort (~20 venues) as deep operational partners without implying other venues cannot list.

9. **`components/business/BusinessFAQ.tsx`**:
   - Added all 8 canonical questions mandated in Section 19:
     1. *Is it free to list my business?* (Yes, ₦0 listing fee).
     2. *How does OyaPlan make money?* (Attributed commission on qualifying reservations).
     3. *Does OyaPlan hold customer deposits?* (No, 100% direct to venue).
     4. *Do I need to be fully verified to be listed?* (No, broad supply with estimated vs. verified distinction).
     5. *Can customers reserve through OyaPlan?* (Reservation requests where supported).
     6. *Does OyaPlan guarantee a reservation?* (No, venue confirmation required).
     7. *What happens if my prices change?* (Updated via portal with non-destructive audit log).
     8. *Can venues still accept walk-ins?* (Yes, OyaPlan drives both planned reservations and walk-in footfall).

10. **`components/business/BusinessFooter.tsx`**:
    - Updated value proposition, navigation links, and free-to-list tagline.

11. **`app/for-business/ForBusinessClient.tsx` & `page.tsx`**:
    - Integrated all new sections into the page hierarchy and refreshed SEO metadata.

---

### B. Business Portal & Operations (`/business/*`)
1. **`components/business/BusinessReservationsCard.tsx`** *(New)*:
   - Dedicated portal component placed on `BusinessHomeClient.tsx`.
   - Offers tabs for `Reservation Requests (0)`, `Confirmed Bookings (0)`, and `Commercial Terms & Commission`.
   - Displays honest, intentional empty states:
     > *"No reservation requests through OyaPlan yet. When customers build a plan around your venue and request a reservation, their details will appear here for your confirmation."*
   - Explains direct venue deposit policy and attributed commission terms.
   - Shows current configured table deposit amount with direct link to update.

2. **`app/business/[venueId]/pricing/BusinessPricingClient.tsx`**:
   - Added `reservationFee` state initialized from `venue.reservation_fee`.
   - Included `reservationFee` in `handleSaveCharges` payload.
   - Added form input for **Table Reservation Deposit (NGN)** with explicit guidance: *"Required deposit to hold a table. Paid directly to your venue by the customer. OyaPlan does not hold customer deposits."*

3. **`app/business/[venueId]/activity/BusinessActivityClient.tsx`**:
   - Removed anti-pattern claim *"Maintain Your Ranking"*.
   - Replaced with: **"Maintain Squad Trust — Keep your menu prices current so planners have total budget confidence."**
   - Retained real server-side metrics (`plansFeaturingCount`, `plansSharedCount`, `reportedOutingsCount`) with zero simulated activity.

---

### C. Onboarding & Partner Workflows (`/partner/*`)
1. **`app/partner/[venueId]/onboarding/PartnerOnboardingClient.tsx`**:
   - Added high-visibility **Marketplace Agreement & Free Listing** banner at the top of the onboarding journey.
   - Added `reservationFee` input field to Step 2 (Mandatory Charges & Taxing).
   - Hooked up `reservation_fee` in `stepData` payload.

2. **`lib/actions/partnerOnboardingActions.ts`**:
   - Updated `saveOnboardingStepAction` to persist `data.reservation_fee` to Postgres `venues.reservation_fee` column during Step 2.

---

### D. Consumer Consistency & Pricing (`/venue/[venueId]`)
1. **`components/venue/PublicPricingSection.tsx`**:
   - Checked and rendered `venue.reservation_fee` when set by the venue:
     - Displays: `Table Reservation Deposit: ₦X`
     - Explicit label: `(Paid directly to venue)`
   - Ensures consumer flow perfectly reflects that OyaPlan does not intermediate deposits.

---

## 8. Stale Pricing Trace & Fallback Strategy

### Historical Context
During earlier development iterations, static mock items or test fixtures used legacy values (e.g. ₦1,000–₦1,500) for activity fees or meal approximations that no longer represent current Lagos macroeconomic realities.

### Data Trace:
1. **Database:** Postgres `menu_items` stores verified item-level prices. `venues.last_price_updated_at` and `price_evidence` track freshness.
2. **Transformations:** `decisionCardMapper.ts` and `squadPricingEngine.ts` calculate total bill breakdowns (food + drinks + 7.5% VAT + service charge + mandatory fees).
3. **Fallback Policy:**
   - Where verified item data is missing, OyaPlan calculates an **Estimated Spend Tier**.
   - If an unverified fallback range (such as ₦5,000–₦6,000) is applied, the UI must explicitly prefix the value with **"Estimated"**.
   - The product never presents an estimated range as "Verified" or applies a single uniform fee globally across venues.

---

## 9. Mobile QA & Touch Targets

The entire business marketing surface and business portal were evaluated against Lagos mobile usage patterns (dominant viewport widths: 360px, 390px, 412px):

- **Header Mega Menus:** Seamlessly collapse into an accessible slide-out mobile drawer on screens $< 1024\text{px}$.
- **Touch Targets:** All buttons, interactive tabs, form inputs, and links adhere to minimum $44 \times 44\text{px}$ touch targets with active `.tap-feedback` transitions.
- **Horizontal Overflow:** All grids (`sm:grid-cols-2`, `sm:grid-cols-3`) collapse to single-column layouts on small screens; tables and sub-tab bars support horizontal overflow with `no-scrollbar` styling.
- **Visual Bridge:** The interactive consumer $\rightarrow$ venue lifecycle visual flows vertically on mobile screens without squishing or truncating text.

---

## 10. Verification & Test Execution

### 1. TypeScript Strict Checking
Ran `npx tsc --noEmit` across the entire codebase:
- **Result:** Exit Code `0`. Zero type errors, zero unassigned parameters, zero missing imports.

### 2. Next.js Production Build
Ran `npm run build`:
- **Result:** Successfully compiled and generated production server and client bundles.
- All dynamic routes (`/for-business`, `/business/[venueId]`, `/business/[venueId]/pricing`, `/venue/[venueId]`) passed route compilation.

---

## 11. Deferred Work & Unresolved Product Decisions

The following items are intentionally deferred for future backend phases and must **not** be simulated prematurely:

1. **Transactional Reservation Engine:**
   - Database tables for reservation requests (`reservations`), customer contact verification, and venue acceptance/rejection timestamps.
   - Recommendation: Develop a dedicated Supabase schema migration with strict RLS when the pilot cohort of 20 venues begins accepting live bookings.
2. **Direct Deposit Proof of Transfer:**
   - Direct bank transfer / USSD reference submission mechanism between guest and venue.
   - Recommendation: Venue confirms deposit receipt via a single-tap button in `/business/[venueId]` without OyaPlan touching funds.
3. **Commission Ledger & Invoicing:**
   - Monthly settlement ledger calculating attributed commission for completed outings.
   - Commercial decision required: Finalize commission terms with pilot venues (e.g. flat fee per confirmed seat vs. percentage of estimated/reported spend).

---

## 12. Conclusion & Architectural Compliance

The OyaPlan business experience now accurately reflects the business model:
- **Free to list** for broad Lagos supply.
- **Deep relationships** with the initial cohort.
- **Honest reservation pathways** where supported.
- **100% direct customer deposits** to venues.
- **Attributed commission monetization** without fake numbers.
- **High trust** for both Lagos squads and venue operators.
