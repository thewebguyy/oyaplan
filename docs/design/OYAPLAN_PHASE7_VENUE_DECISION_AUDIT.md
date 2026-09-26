# OyaPlan — Phase 7: Plan → Venue Decision Architecture Audit

**Status:** APPROVED FOR IMPLEMENTATION  
**Role:** Senior Product Designer + Senior Frontend Engineer + UX Architect + Information Architecture Specialist  
**Scope:** Phase 7 — Plan → Venue Decision Experience  

---

## 1. Executive Summary & Objective

When an OyaPlanner completes the Forge wizard and reviews a generated budget plan at `/plan/[id]`, they encounter the picked venue:

```text
FORGE
  ↓
GENERATED PLAN (/plan/[id])
  ↓
“This plan is for [VENUE NAME]”
  ↓
User naturally thinks: “Tell me more about this place before I leave home.”
  ↓
Tap venue name / venue image / venue context
  ↓
CANONICAL VENUE PAGE (/venue/[id])
  ↓
Understand the place (Atmosphere, What it costs, What you get, Location, Hours, Policies)
  ↓
CONFIDENT OUTING DECISION
  ↓
Plan This Venue (Pre-filled Forge) or Return to Plan
```

The central objective of Phase 7 is to **transform the venue named inside a generated Plan into an intentional, high-quality gateway into the canonical venue page**, making the venue page a complete, trustworthy decision layer between discovery and going out.

---

## 2. Current State Audit

### 2.1 Current Plan → Venue Connection (`/plan/[id]`)
* **PlanHeroSummary (`PlanHeroSummary.tsx`):** Displays the venue image, category, and a small "View Venue" pill, but the main card is not fully interactive or prioritized as the primary exploratory link.
* **PlanWhatYouGet (`PlanWhatYouGet.tsx`):** Displays menu item allocations and pricing estimates, but lacks a deep anchor link to the full scannable venue menu (`/venue/[id]#menu`).
* **PlanCostBreakdown (`PlanCostBreakdown.tsx`):** Explains food, rides, VAT, and service charge, but does not offer quick access to check the venue's house policies and mandatory fee disclosures.

### 2.2 Current Venue Page (`/venue/[id]`)
* **Components in Place:**
  - `VenueHeroGallery.tsx`: Visual photo grid, category badges, trust badges, operating breadcrumbs.
  - `VenueStickyAnchorNav.tsx`: Anchor links between Overview, Budget, Menu, Experience, Good to Know.
  - `VenueDecisionSummary.tsx`: Typical spend per person, estimated budget for 2, trust reasons.
  - `VenueBudgetScenario.tsx`: Dynamic "What can I get for ₦X?" spending simulator based on menu items.
  - `VenueScannableMenu.tsx`: Scannable menu categories with search and pricing.
  - `VenueExperienceSection.tsx`: Vibe tags and crowd suitability.
  - `VenueGoodToKnow.tsx`: House policies, VAT/service charge rates, opening hours, address and Google Maps directions link.
  - `VenueNearbyDiscovery.tsx`: Nearby alternatives in the same district.
  - `VenueMobileStickyCTA.tsx`: Bottom sticky CTA with "Plan This Venue" and 1-tap "Save Spot".
* **Gaps Identified:**
  1. Arriving from a Plan loses the originating plan context (squad size, budget, and vibe).
  2. Opening hours lacks an automated "Open Now" / "Closed" live status indicator when structured hours exist.
  3. No explicit "From Your Plan" contextual banner explaining why OyaPlan recommended this venue for their specific squad/budget.
  4. Mandatory charges could be even more explicit regarding corkage, reservation policies, and minimum spend rules.

---

## 3. Fresha-Inspired Information Architecture vs. OyaPlan Differences

Fresha provides an exceptional structural model for **frictionless profile information hierarchy**, but OyaPlan's business model and user outcomes are fundamentally different:

| Dimension | Fresha Profile Architecture | OyaPlan Canonical Venue Experience |
| :--- | :--- | :--- |
| **Core Goal** | Convert visitor into an appointment booking. | Convert uncertainty into understanding and budget confidence before leaving home. |
| **Monetization** | Commission on booked appointments / staff tips. | Pure consumer utility & planning intelligence (Zero booking fees). |
| **CTA Model** | "Book Now", select staff, pick calendar slot. | "Plan This Venue", pre-fill budget & squad in Forge. |
| **Pricing Model** | Fixed service prices (e.g. Haircut ₦15,000). | Variable group dining bills, VAT, service charges, ride-hailing estimates, and minimum spends. |
| **Social Proof** | Star ratings, user reviews, booking counts. | Hard data freshness timestamps, verified menu receipts, and transparent calculation methodology. |

### The OyaPlan Information Hierarchy:
```text
1. VENUE IDENTITY & ATMOSPHERE (Name, District, Category, Verified Photos, Trust Badge)
   ↓
2. OPERATIONAL STATUS & LOCATION (Open Now / Hours, Address, Landmark, Directions)
   ↓
3. FINANCIAL DECISION & TYPICAL SPEND (Typical cost/person, Estimate for 2, Originating Plan Context)
   ↓
4. BUDGET SCENARIO: WHAT CAN WE GET? (Dynamic item allocations for squad budget)
   ↓
5. SCANNABLE MENU & ITEM PRICING (Menu categories, price transparency)
   ↓
6. GOOD TO KNOW & HOUSE POLICIES (VAT, Service Charge, Minimum Spend, Corkage, Dress Code)
   ↓
7. EXPERIENCE FIT & VIBE (Group dining, Date night, Outdoor seating)
   ↓
8. PRIMARY ACTION: PLAN THIS VENUE (Pre-fill Forge with pinned venue)
```

---

## 4. Trust & Data Integrity Rules

1. **Strict Tri-State Charge Representation:**
   - `NULL` = *"Not specified by venue"* (Never treat as ₦0).
   - `0` = *"Free / No charge"*.
   - `> 0` = Exact known percentage or Naira amount.
2. **Zero Fabricated Social Proof:**
   - No synthetic ratings, stars, fake review counts, or "100+ people booked today" urgency tricks.
3. **Transparent Data Freshness:**
   - Always display when menu prices or venue details were last verified by OyaPlan.
4. **Graceful Degradation:**
   - If a venue has no photos, show a clean, honest camera placeholder.
   - If a venue has no granular menu items, state that pricing is estimated from district tiers.

---

## 5. Implementation Action Plan

1. **Plan Page (`/plan/[id]`):**
   - Elevate [PlanHeroSummary.tsx](file:///c:/Users/Admin/oyaplan/components/plan/PlanHeroSummary.tsx) to make the entire venue card interactive with an accessible link to `/venue/[id]`.
   - Pass originating plan parameters in query string (`/venue/[id]?fromPlan=true&squad=4&budget=90000&vibe=dinner`) so the venue page can display contextual recommendations.
   - Add deep-link to venue menu in [PlanWhatYouGet.tsx](file:///c:/Users/Admin/oyaplan/components/plan/PlanWhatYouGet.tsx).
2. **Venue Page (`/venue/[id]`):**
   - Add a lightweight, elegant **"From Your Plan"** contextual callout on `/venue/[id]` when arriving from a plan.
   - Add smart **Live Operational Status** ("Open Now" / "Closed · Opens at X") in [VenueHeroGallery.tsx](file:///c:/Users/Admin/oyaplan/components/venue/VenueHeroGallery.tsx) and [VenueGoodToKnow.tsx](file:///c:/Users/Admin/oyaplan/components/venue/VenueGoodToKnow.tsx) calculated from `opening_hours`.
   - Ensure the "Plan This Venue" CTA seamlessly pre-fills Forge with squad and budget context.
3. **Mobile QA & Verification:**
   - Test 360px, 390px, 412px, 768px, 1280px, 1440px.
   - Run typecheck, vitest suite, and next production build.
