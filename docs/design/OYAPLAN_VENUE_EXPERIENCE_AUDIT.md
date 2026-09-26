# OyaPlan Venue Experience UX & Information Architecture Audit

**Document Date:** September 2026  
**Status:** Canonical Audit for Phase 4 (Venue Experience Re-Engineering)  
**Surface:** `/venue/[id]` (Consumer Venue Decision & Planning Surface)

---

## 1. Executive Summary & The Hard Truth

The current venue page acts too much like a static database record. Users do not visit a venue page to read raw database tables; they visit to answer one decisive question:

> **“Can I confidently decide whether this place is right for our outing, what we can order, and what we will actually spend before leaving home?”**

The re-engineered venue experience must establish **Visual Confidence + Experience Fit + Cost Confidence + Trust → Decisive Action (Plan This Venue)**.

---

## 2. Current Architecture & Component Inventory

| Existing Component | Current Role | Audit Assessment & Refactoring Strategy |
|---|---|---|
| `app/venue/[id]/page.tsx` | Server Entry Point | Keep server-side pre-fetching (`getPublicVenueById`, `getVenueMenuItems`, `getVenuePhotos`). Add `getNearbyVenues`. |
| `PublicVenueHero.tsx` | Hero Banner | **Refactor**: Current hero is a single image banner with badges. Needs asymmetric editorial photo gallery (or touch swipe on mobile), verified badge, live open/closed status, and instant Save action. |
| `PublicPricingSection.tsx` | Menu & Charges List | **Refactor**: Currently lists static item rows without interactive category tabs or spend simulation. Replace with Scannable Menu Tabs + "What Can ₦X Get You?" Budget Scenario Engine. |
| `PublicExperienceFit.tsx` | Vibe & Squad fit | **Refactor**: Remove card stacking. Make it a concise, editorial "Why this place?" + Lagos occasion match. |
| `PublicOverviewSection.tsx` | Hours, Location & Operations | **Refactor**: Split into clear "Good to Know" sections: Hours with overnight handling, Directions, Actionable Contact (WhatsApp/Call), Mandatory House Charges, and Table Policies. |
| `PublicGallery.tsx` | Photos Grid | **Refactor**: Integrate directly into the top hero/editorial gallery with full-screen photo preview and graceful "Photos coming soon" empty state. |
| `OperationalNoticeBanner.tsx` | Emergency Closure Notices | **Preserve**: Clean, amber warning for temporary maintenance/closures. |
| `ChangeRequestModal.tsx` | Community Correction | **Preserve**: Secondary action for reporting outdated pricing/hours. |
| `ClaimVenueForm.tsx` | Business Claim Modal | **Preserve**: Seamless link to `/business/claim/[id]`. |

---

## 3. Data Availability & Null Semantics Audit

| Data Field | Availability | Null / Zero Semantics | Display Rule |
|---|---|---|---|
| `cover_url`, `gallery_urls`, `venue_photos` | Rich for claimed/scouted venues; limited for draft venues | `null` or empty array | **Never show stock photos**. Show curated placeholder badge: *"Photos coming soon — We're gathering verified photos for this space."* |
| `derived_typical_cost` | Present for indexed venues | `0` or `null` = Limited pricing data | Distinguish between **Verified** (`last_price_updated_at < 30 days`), **Estimated** (`computed_confidence_score < 0.7`), and **Limited Data**. |
| `menu_items` | Present for venues with OCR / scout data | `[]` = Menu data limited | When items exist: Group into category tabs (Food, Drinks, Sides, Activities). When limited: Show budget tiers (*"What ₦30k / ₦50k / ₦100k typically covers"*). |
| `vat_pct`, `service_charge_pct` | Boolean/Numeric | `null` = Not provided; `0` = No fee; `>0` = Known charge | **Never convert NULL into ₦0**. Show exact percentage or state *"Not provided by venue"*. |
| `corkage_fee`, `cake_fee`, `minimum_spend` | Numeric | `null` = Not stated; `0` = Free; `>0` = Exact fee | Display in "Good to Know" with clear conditions (e.g. *"₦10,000 / bottle corkage"*). |
| `table_policies` | Structured policy rows | `[]` = No special table restrictions | Translate policy rules (minimum spend, bottle requirements, weekend rules) into natural Lagos consumer English. |
| `opening_hours` | JSON object (`monday` to `sunday`) | `{}` = Hours unverified | Handle overnight operating schedules (e.g., 6:00 PM – 3:00 AM) using canonical datetime comparisons. |
| `districts` | Relational lookup (`name, slug`) | Fallback to Lagos Island / Mainland | Use for location context and nearby venue cross-discovery. |

---

## 4. Crucial Interaction & UX Insights

1. **Anonymous-First Save & Plan**:
   - Save button uses `useSavedSpots.ts` (`localStorage` for anonymous users, instantly synced).
   - "Plan This Venue" seamlessly forwards into `/forge?pinned=[venueId]&area=[areaSlug]&squad=2&budget=[derivedBudget]&vibe=[vibe]&fresh=true`.

2. **Mobile Sticky Action Bar**:
   - Mobile users (360px, 390px, 412px) need a thumb-friendly bottom action bar (`[♡ Save] [Plan This Venue — ~₦25k/person]`) that respects safe-area insets without blocking content.

3. **Horizontal Sticky Anchor Navigation**:
   - `[ Overview ] [ What It Costs ] [ Menu ] [ Photos ] [ Good to Know ]`
   - Keeps large venue pages fast to navigate without endless scrolling.

4. **Information Density Progression (3-Level Rule)**:
   - **Level 1 (3-Second Decision)**: Venue name, category, area, typical spend per person, verified trust badge, hero photo.
   - **Level 2 (Understanding)**: "What can ₦50,000 get us here?", scannable menu categories, squad fit, house charges.
   - **Level 3 (Evidence & Details)**: Exact item prices, verification date, table policies, opening hours, directions.
