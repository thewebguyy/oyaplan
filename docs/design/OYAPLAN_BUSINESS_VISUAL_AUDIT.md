# OyaPlan Business — Visual & Product Audit

> **Document Status:** Design Direction Locked Audit (v2.0)  
> **Scope:** All business-facing routes, components, authentication, navigation, copy, motion systems, and data integrity  
> **Principle:** Grounded in OyaPlan's real product layer. No fake marketing, no generic SaaS templates.

---

## 1. Executive Summary

OyaPlan Business previously operated as a **consumer app with a business dashboard attached**, rather than a distinct product world. The `/for-business` marketing page lacked narrative continuity and treated business visitors to generic SaaS sections. 

The new architecture establishes **two intentional product worlds sharing one source of truth**:
- **Consumer World:** "Where should we go and what will we spend?"
- **Business World:** "Be there when people decide where to spend."

---

## 2. Route Inventory & Status

| Route | Purpose | Current Status | Required Action |
|---|---|---|---|
| `/for-business` | Public Business marketing narrative | **Needs full narrative redesign** | Replace section-by-section layout with ACT 1–6 narrative, BusinessMarketingHeader (two mega menus + Marketplace bridge), real UI Hero, and continuous horizontal motion marquee |
| `/business` | Authenticated business root | **Working** | Protect unauthenticated entry; route users with business context |
| `/business/[venueId]` | Business venue dashboard | **Working** | Enhance header with `[OyaPlan | For Business]` lockup, Marketplace bridge, and attention items |
| `/business/[venueId]/venue` | Venue profile editor | **Working with gaps** | Keep functional; clean legacy `/partner/*` links |
| `/business/[venueId]/pricing` | Pricing management | **Working** | Showcase as core specimen in hero & marquee |
| `/business/[venueId]/activity` | Planning activity | **Working** | Pure real demand queries (synthetic multiplier removed) |
| `/business/[venueId]/insights` | Planning insights | **Working** | Honest confidence-gated empty states |
| `/business/[venueId]/updates` | Operational updates | **Working** | Special hours & temporary closures |
| `/business/claim` | Venue claim & search | **Working** | Primary conversion target for founding venues |
| `/business/claim/[token]` | Invitation-based claim | **Working** | Pilot cohort onboarding |
| `/partner` | Legacy redirect | **Redirect** | Cleanly redirect to `/business` |
| `/partner/[venueId]/*` | Legacy partner subroutes | **Lingering** | Ensure safe redirects |
| `/operator` | Legacy operator prototype | **Active** | Redirect permanently to `/business` |
| `/list-your-spot` | Legacy listing page | **Redirect** | Redirect to `/for-business` |

---

## 3. Navigation & Header Systems

### 3.1 Business Marketing Header (`BusinessMarketingHeader.tsx`)
- **Wordmark:** `[OyaPlan | For Business]` — dedicated product designation, not a generic pill.
- **Business Types Mega Menu:** Driven strictly by `VenueCategory` in `lib/types.ts` (Dining, Nightlife, Experiences, Outdoor).
- **Features Mega Menu:** Outcome-oriented (Manage, Inform, Understand, Grow) with clear `Available` vs `Coming Soon` status tags.
- **Marketplace Bridge:** Dedicated `Marketplace ↗` item with visual external cue linking to consumer `/`.
- **Utility Menu & Drawer:** Desktop utility trigger + mobile full-height slide drawer with no disabled/broken links.

### 3.2 Business App Shell (`BusinessShell.tsx`)
- Full application header with `[OyaPlan | For Business]` brand lockup.
- Venue switcher dropdown for multi-venue operators.
- Direct `Marketplace ↗` bridge link to view public venue page or explore marketplace.
- WhatsApp / Help support channel.
- Complete separation from consumer navigation (no consumer search, no consumer bottom bar).

---

## 4. Consumer / Business Boundary Architecture

### 4.1 Authentication Boundary
- Unauthenticated entry to `/business` prompts a business-tailored authentication flow (`/account?next=/business&context=business`).
- Post-login routing reliably places verified operators in `/business/[venueId]` or `/business/claim`.
- Operators are never left in consumer `/account` wondering if their venue exists.

### 4.2 Visual Identity Separation
- **Shared:** Brand Green (`#008751`), Lagos warm surface (`#FAF7F2`), Lagos warm border (`#EAE4DC`), typography tokens.
- **Distinct:** Business uses high-contrast editorial structures, deep surface accents (`#0B1E14`), operational status badges, and outcome-led micro-interfaces.

---

## 5. Narrative & Motion Audit

### 5.1 The 6-Act Page Structure
1. **ACT 1 — THE DECISION:** Hero ("Be there when people decide where to spend") with composed Business Controller ↔ Consumer Plan UI.
2. **ACT 2 — THE BUSINESS:** Who OyaPlan is for — categories derived from `VenueCategory`.
3. **ACT 3 — THE PRODUCT:** "Everything your venue needs to show up right." Horizontal continuous marquee + product deep dives.
4. **ACT 4 — THE CONNECTION:** The complete loop (Business updates → Marketplace → Consumer plan → Visit → Signals).
5. **ACT 5 — THE INVITATION:** Founding venue cohort ("Help shape how Lagos businesses show up on OyaPlan").
6. **ACT 6 — THE TRUST:** Transparent FAQ, direct WhatsApp concierge, final claim CTA.

### 5.2 Motion System Principles
- **Continuous Marquee:** GPU-accelerated `translate3d` animation with seamless DOM duplication.
- **Desktop Hover:** Decelerated smooth pause on hover for inspection.
- **Mobile/Tablet:** Automatic switch to touch-snap horizontal track (`scroll-snap-type: x mandatory`).
- **Accessibility:** Instant static fallback when `prefers-reduced-motion: reduce` is active.
- **Performance:** Zero layout thrashing, strict `requestAnimationFrame` lifecycle.

---

## 6. Data Integrity Principles
- **No Fabricated Stats:** Never display manufactured booking counts (e.g. "6 of 6 voted Yes" or "₦4.8M revenue").
- **No Overpromised Capabilities:** Strictly avoid implying POS integration, automated table booking, CRM, or guaranteed foot traffic.
- **Real Empty States:** Honest confidence-gated banners when volume is building.
