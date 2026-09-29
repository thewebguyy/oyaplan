# OyaPlan Business & Monetization Architecture Audit

> **Document Status:** Canonical Pre-Implementation Architecture Audit (v1.0)  
> **Repository:** OyaPlan MVP (`thewebguyy/oyaplan`)  
> **Date:** September 2026  
> **Authors:** Senior Product Designer, Senior Frontend Engineer, Marketplace Product Architect, Trust Systems Engineer  
> **Scope:** Two-sided monetization re-engineering, reservation lifecycle reconciliation, deposit boundaries, commission mechanics, and pricing provenance.

---

## Executive Summary

OyaPlan is a **free-to-list marketplace for real-world businesses** designed to deliver **Budget Confidence** to consumers and qualified decision-stage customers to venues.

The core business model is:
$$\text{Free listing} \rightarrow \text{Discovery} \rightarrow \text{Planning} \rightarrow \text{Reservation request} \rightarrow \text{Venue receives deposit directly} \rightarrow \text{OyaPlan earns commission on qualifying reservation} \rightarrow \text{Actual outing} \rightarrow \text{Spend feedback} \rightarrow \text{Better data}$$

The previous business product experience (`/for-business` and `/business/*`) focused heavily on profile maintenance, verified partner badges, and planning demand signals. While valuable, this narrative inadvertently obscured OyaPlan's primary commercial monetization engine: **earning a commission on qualifying reservations generated through the platform**, with **100% of customer deposits paid directly to the venue**.

This audit inspects the existing codebase across database schemas, server actions, client components, and consumer interfaces to establish the ground truth before implementing changes.

---

## 1. What Reservation Functionality Already Exists

A forensic trace of the repository reveals the following existing reservation-adjacent capabilities:

| Component / Layer | Location | Implementation Status | Notes |
|---|---|---|---|
| **`reservation_fee` Column** | `supabase/migrations/0052_venue_partner_experience.sql:14`, `lib/types.ts:353` | **Schema Present** | Integer column on `public.venues` defaulting to `0`. |
| **`reservation_fee` Action Handler** | `lib/actions/partnerPricingActions.ts:301, 318` | **Working** | `updateStructuredChargesAction` accepts and saves `reservationFee` to the `venues` table. |
| **Table Policies Schema** | `supabase/migrations/0054_operational_venue_policies.sql:63`, `lib/types.ts:293-312` | **Schema & UI Present** | Stores JSONB array of `TablePolicy` objects (seating type, minimum spend, bottle minimums, time windows). |
| **Table Policy Manager** | `components/business/TablePolicyManager.tsx` | **Working** | Allows venue operators to configure seating types, weekend bottle minimums, and minimum spends per table. |
| **Attributed Visits Tracking** | `supabase/migrations/0054_operational_venue_policies.sql:80-91`, `lib/types.ts:314-324` | **Working & Enforced** | `venue_attributed_visits` records when an operator confirms a guest plan code (`shared_plan_id`, `plan_code`, `squad_size`, `estimated_total_cost`). Idempotent via `UNIQUE(venue_id, shared_plan_id)`. |
| **Consumer Non-Reservation Guardrail** | `components/plan/PlanCodeSquadPass.tsx:85-93` | **Strictly Enforced** | Explicitly warns consumers: *"This is an outing budget plan, not a table reservation or guaranteed entry."* |
| **Consumer Pricing Display** | `components/venue/PublicPricingSection.tsx:28` | **Partial** | Evaluates `venue.reservation_fee` presence alongside `entrance_fee`. |

---

## 2. What Reservation Functionality Does NOT Exist

The repository currently **lacks** full end-to-end transactional reservation infrastructure:

1. **No `reservations` or `booking_requests` Table:**
   - There is no table tracking consumer reservation requests (`guest_count`, `requested_time`, `special_requests`, `status`, `deposit_amount`).
2. **No Real-Time Table Availability Engine:**
   - Venues do not have live slot inventories, table layouts, or dynamic capacity allocation.
3. **No Direct Reservation Request Server Actions:**
   - No consumer-facing server action exists to dispatch a reservation request to a venue operator.
4. **No Venue Operator Reservation Inbox:**
   - `/business/[venueId]` lacks an active queue to accept, reject, or mark reservations as confirmed.
5. **No Two-Way SMS / WhatsApp Reservation Dispatch:**
   - While WhatsApp deep-links exist for general concierge (`lib/config/businessWhatsApp.ts`), there is no automated webhook dispatch for table bookings.

**Architectural Constraint:** We must **not** simulate or mock live bookings with fake data. Unsupported states must use honest, high-trust empty states.

---

## 3. What Business UI Currently Claims

Inspection of `/for-business`, `BusinessHero.tsx`, `BusinessFAQ.tsx`, `BusinessNarrativeJourney.tsx`, and `BusinessActivityClient.tsx` revealed outdated claims:

1. **"Zero Commission on walk-ins" (as sole monetization mention):**
   - Emphasizes what OyaPlan does *not* charge, while completely omitting that **OyaPlan earns a commission when reservations are made through the platform**.
2. **"100% Control of your pricing" & "Live Marketplace sync":**
   - Treats profile maintenance as the primary product outcome rather than turning planning intent into confirmed reservations.
3. **"Maintain Your Ranking" / "Stay at the top of recommendations":**
   - In `BusinessActivityClient.tsx:210-217`, the copy suggested that updating prices improves ranking, which contradicts the core anti-pattern against promising priority ranking.
4. **Disconnection between Consumer Plan and Business Outcome:**
   - In `BusinessHero.tsx`, the right-hand specimen shows "Business Controller View" feeding "Customer Decision View (Locked In)", but terminates there without showing the reservation request arriving at the venue.
5. **"Verified Partner" Overemphasis:**
   - `BusinessFoundingPartner.tsx` positioned the badge as the main value, rather than positioning: *"You are where the customer decides."*
6. **FAQ Avoidance of Commercial Model:**
   - `BusinessFAQ.tsx` answered *"Does OyaPlan charge commissions on walk-ins or bills? No."* but never answered *"How does OyaPlan make money?"* or *"Does OyaPlan hold customer deposits?"*

---

## 4. What Claims Must Change

| Old Claim / Structure | Required Architectural Correction | Rationale |
|---|---|---|
| Sole focus on "Zero commission on walk-ins" | Clearly state: **"Listing is free. OyaPlan earns a commission on qualifying reservations made through the platform."** | Transparently communicates the commercial model to operators and investors. |
| Vague booking promises or complete absence of reservation story | Clarify: **"Turn planning intent into reservation requests. Venues confirm requests and receive deposits directly."** | Accurately describes the current reservation model without falsely claiming instant automated booking. |
| "Maintain your ranking to maximize recommendations" | Change to: **"Keep your pricing current so squads can trust your budget estimates."** | Adheres to repository rules: never imply paid or verified priority ranking. |
| "Verified Partner" as the main headline | Change hierarchy to: **Demand $\rightarrow$ Decision $\rightarrow$ Reservation $\rightarrow$ Relationship $\rightarrow$ Trust**. | Verification is an enabler of trust, not the product itself. |
| Ambiguous deposit handling | Explicitly state: **"Customers pay reservation deposits directly to your venue. OyaPlan does NOT hold customer funds."** | Critical legal and operational boundary; prevents misinterpreting OyaPlan as an escrow or payment custodian. |

---

## 5. What Monetization Infrastructure Already Exists

1. **Attribution Infrastructure:**
   - `venue_attributed_visits` and `shared_plans.plan_code` provide cryptographic proof of plan creation and venue presentation.
2. **Post-Outing Spend Capture:**
   - `components/ActualSpendCapture.tsx` and `actual_spend` table capture verified spend amounts after visits.
3. **Commercial Strategy Documentation:**
   - Historical roadmaps (`docs/product/business-roadmap.md`) outlined commission models on bookings and exclusive venue deals.

---

## 6. What Commission Infrastructure is Missing

The codebase does **not** currently contain an automated commission calculation or billing ledger:

1. **No Commission Rate Configuration Table:**
   - There is no canonical commission percentage in the database (e.g., no default 10%, 15%, etc.). Per Section 7 instructions, we will **not** invent a percentage; we state: *"Commission applies to reservations made through OyaPlan."*
2. **No Commercial Settlement Engine:**
   - Missing: `commission_eligible`, `commission_recorded`, `commission_settled`, invoice generation, or payout reconciliation.
3. **No Dispute / Cancellation Ledger:**
   - Missing states for handling venue rejections, customer cancellations, no-shows, or party size adjustments.

**Future State Commercial Lifecycle (Documented for Engineering Roadmap):**
$$\text{reservation\_requested} \rightarrow \text{venue\_confirmed} \rightarrow \text{reservation\_completed} \rightarrow \text{commission\_eligible} \rightarrow \text{commission\_recorded} \rightarrow \text{commission\_settled}$$

---

## 7. What Deposit & Payment Custody Infrastructure Exists

**Zero payment custody infrastructure exists — and this is strictly intentional.**

- OyaPlan does **not** operate a wallet, escrow service, bank account storage, payout gateway, or merchant custody engine.
- All customer reservation deposits and final bill settlements are strictly **Customer $\rightarrow$ Venue**.
- OyaPlan acts strictly as the **decision, planning, and reservation facilitator**, attributing qualifying reservations and invoicing commission directly to the business.

---

## 8. What Should Be Implemented Now

1. **Business Hero Re-Engineering (`BusinessHero.tsx`):**
   - Update narrative to bridge **Demand Generation** (squad deciding where to spend) and **Conversion** (decision becoming a reservation request).
   - Right-side visual bridge: Consumer Outing Plan $\rightarrow$ Venue Selected & Estimated Spend $\rightarrow$ Reservation Request Received at Venue.
   - Trust anchors: **Free Listing (₦0 to list)**, **Direct Deposits (100% direct to venue)**, **Commission on Reservations**.
   - Primary CTA: **"Get Started"**; Secondary CTA: **"See How Reservations Work"**; Supporting: **"Explore Marketplace ↗"**.
2. **Marketplace Relationship & Reservation Deep-Dive Sections:**
   - Add dedicated sections explaining the 3-way marketplace relationship (Customer / Business / OyaPlan) and the 4-step reservation journey:
     1. *Customer plans*
     2. *Customer requests to reserve*
     3. *Venue confirms directly & collects deposit*
     4. *OyaPlan earns commission on qualifying reservation*
3. **Features & Business Types Mega Menus (`BusinessMarketingHeader.tsx`):**
   - Align Features menu with lifecycle: **Get Discovered**, **Get Chosen**, **Get Booked**, **Learn & Improve** with honest status tags (`Available`, `In Development`, `Coming Soon`).
   - Ground Business Types dynamically in canonical `VenueCategory`.
4. **Continuous Motion Marquee (`BusinessMarquee.tsx`):**
   - Modernize the 6 cards to reflect the commercial journey: Marketplace Presence, Menus & Pricing, Planning Demand, Reservation Requests, Visit Attribution, Actual Spend Feedback.
5. **Business Narrative Journey (`BusinessNarrativeJourney.tsx`):**
   - Update to 5 distinct steps: 01 Get Discovered $\rightarrow$ 02 Help Them Decide $\rightarrow$ 03 Get The Reservation $\rightarrow$ 04 Serve The Customer (Direct Deposit) $\rightarrow$ 05 Learn (Spend Feedback).
6. **Comprehensive FAQ (`BusinessFAQ.tsx`):**
   - Answer all core questions: Free listing, commission model, direct deposits, reservation request vs. confirmation, price updates, unverified vs. verified venues.
7. **Business Portal Alignment (`/business/[venueId]`):**
   - Add honest Reservation Activity & Commercial Activity modules with clear zero-data empty states (no fake numbers, no synthetic revenue).
   - Clean up outdated ranking claims in `BusinessActivityClient.tsx`.
8. **Consumer & Pricing Consistency:**
   - Ensure `PublicPricingSection.tsx` and `TablePolicyManager.tsx` clarify that reservation deposits are paid directly to the venue.

---

## 9. What Should Be Deferred

The following items are explicitly out of scope for this phase and deferred to subsequent backend development phases:

1. Developing an automated reservation dispatch webhook engine (Twilio / Meta WhatsApp Cloud API).
2. Implementing database tables for reservation records, waitlists, or table layouts.
3. Implementing Stripe / Paystack / Flutterwave billing for automatic commission collection.
4. Implementing merchant payment custody or automated escrow.

---

## 10. Backend & Product Decisions Required Before Next Engineering Phase

Before writing reservation database migrations or payment webhooks, the core team must resolve:

1. **Commission Commercial Terms:**
   - Will commission be a fixed flat fee per guest (e.g., ₦1,000/seat) or a percentage of estimated reservation spend?
   - Will the commission invoice be billed monthly in arrears or settled per booking?
2. **Reservation Confirmation SLA:**
   - What is the venue operator's response window (e.g., 2 hours, 12 hours) before an unconfirmed reservation request expires?
3. **No-Show & Cancellation Policy:**
   - How does a venue report a customer no-show to ensure commission is waived or disputed?
4. **Deposit Verification Mechanism:**
   - Does the venue share a direct bank transfer link / USSD code in the reservation confirmation message, or does OyaPlan provide a direct redirect to the venue's own booking engine?

---

## 11. Stale Pricing & Fee Provenance Trace

The prompt identified stale fee information in the ₦1,000–₦1,500 range that has lingered too long in the product.

### Traced Provenance:
1. **Database Seed (`supabase/seed.sql` & migrations `0012`, `0033`, `0034`):**
   - Historic entries like *Gbagada Park* (₦1,500 admission) or default fallback formulas (`COALESCE(v_median_fee, 5000) + COALESCE(v_median_drink, 1500)`) were drafted during initial 2024/2025 prototypes.
   - In 2026 Lagos reality, park entry and leisure activities typically range from ₦5,000–₦6,000+.
2. **Query & Materialization Layer:**
   - `venues.derived_typical_cost` is calculated in Postgres via `sync_venue_derived_statistics()`.
   - When a venue has no menu items, the system falls back to category defaults.
3. **UI Transformation:**
   - In `components/venue/PublicPricingSection.tsx`, `VenueHeroGallery.tsx`, and `PublicVenueClient.tsx`, fallbacks are used.
4. **Resolution Rule:**
   - Never overwrite real historical data with fake universal figures.
   - If a venue's pricing is not partner-verified or recent (< 30 days), the UI must explicitly display **Estimated** (e.g. *"~₦5,000–₦6,000 · Estimated"*), never presenting unverified approximations as verified facts.
