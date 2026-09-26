# OyaPlan Phase 8 — Hardening & Verification Audit

**Status:** Completed & Verified  
**Date:** September 2026  
**Scope:** Discovery, Instant Search, Affordability Filtering, Decision Cards, Mobile Hardening, Telemetry, and Route Integrity

---

## 1. Product Summary

### What Changed:
- Shifted `/explore` from a static 4-box area index into a **unified discovery decision surface**.
- Implemented **instant deterministic search** across venue names, areas, categories, and vibe tags.
- Built **deterministic spend and budget awareness**: Users can input squad size and target budget to see immediately what fits and what remains.
- Upgraded result cards (`DiscoveryVenueCard`) for **2-second decision scannability**: Name → Area → Category → Estimated Total & Per-Person Spend → Trust Badge → Action.
- Replaced the high-friction Tinder-style swiper with a **scannable responsive comparison grid** on mobile and desktop.
- Integrated Phase 7 **`/venue/[id]` decision transition** as the primary action on every discovery card.
- Retained Phase 6 **Saved Spots (`useSavedSpots`)** and **Recently Viewed (`useRecentlyViewed`)** integration.
- Built **"Relax One Thing" empty state** (`DiscoveryEmptyState`): When constraints return 0 results, users receive clear explanations and one-tap options to expand their search without silent constraint mutations.

### Why It Changed:
Phase 8 solves: *“I want to go out, but I don't know where.”*  
Instead of an endless directory or opaque AI scoring, OyaPlan now empowers consumers to narrow vague intent into **3–5 high-confidence, budget-verified options** in under 10 seconds.

---

## 2. Data Integrity & Trust States

### Fields Used:
- `spots.name`: Canonical venue title.
- `spots.address` & `spots.areas.name`: Local Lagos locality indicator.
- `spots.price_per_person` & `spots.derived_typical_cost`: Base spend data.
- `spots.category` & `spots.subcategory`: Primary taxonomy (`restaurant`, `bar`, `cafe`, `activity`, `nature`, `beach`, `entertainment`, `experience`).
- `spots.vibe_tags` & `EXPERIENCES`: Experience and occasion classifications.
- `spots.price_updated_at`: Verification freshness timestamp.
- `spots.computed_confidence_score`: Trust tier indicator.

### Trust States:
- **Verified:** Direct receipt or ops audit (`confidence >= 75`).
- **Estimated:** Historical price calibration (`50 <= confidence < 75`).
- **Limited Data:** Pending price confirmation (`confidence < 50`).

---

## 3. UX & Mobile-First Hardening

### Mobile Architecture (360px / 390px / 412px):
- **Zero Horizontal Overflow:** All containers enforce `overflow-x-hidden` or horizontal snap-scrolling for chips.
- **Touch Target Standard:** Minimum 44px on all buttons, chips, and stepper controls.
- **Mobile Bottom Sheet (`DiscoveryFilterSheet`):** Smooth spring-animated sheet with drag-to-dismiss handle and fixed apply footer.
- **Safe Area Padding:** Bottom padding (`pb-safe`) accounts for mobile device navigation bars.

### Desktop Adaptation (768px / 1280px / 1440px):
- Two-column responsive card grid (max 400px card width) preventing visual fatigue.
- Direct accessible keyboard navigation with visible focus rings.

---

## 4. Engineering Changes

| Component / File | Nature of Change | Description |
| :--- | :--- | :--- |
| `lib/queries/spots.ts` | **Added** | `getExploreSpots()` for server-rendered initial load of all active spots with their area associations. |
| `components/explore/DiscoverySearchInput.tsx` | **Created** | Instant search bar with clear button, search role, and focus styling. |
| `components/explore/DiscoveryFilterSheet.tsx` | **Created** | Accessible mobile bottom sheet and desktop modal with squad, budget, category, vibe, and sort controls. |
| `components/explore/DiscoveryVenueCard.tsx` | **Created** | 2-second scannable decision card with budget fit math, verification badge, and direct `/venue/[id]` + `/forge` links. |
| `components/explore/DiscoveryEmptyState.tsx` | **Created** | Transparent "Relax One Thing" recovery surface with explicit relaxation buttons. |
| `components/explore/ExploreClient.tsx` | **Created** | Unified discovery controller with URL parameter synchronization and deterministic sorting/filtering. |
| `app/explore/page.tsx` | **Refactored** | Renders unified `ExploreClient` with server-side spot and area counts. |
| `app/explore/[slug]/page.tsx` | **Refactored** | Pre-configures `ExploreClient` for specific area or zone while supporting full search and filtering. |
| `components/explore/__tests__/discovery.test.ts` | **Created** | Unit tests for search, filtering, budget math, sorting modes, and trust indicators. |

---

## 5. Telemetry & Analytics

Reused canonical client tracking:
- `explore_opened`: Triggered on initial exploration.
- `spot_saved` / `spot_removed`: Triggered on saving or unsaving venues.
- `explore_plan_started`: Triggered when clicking "Plan" to transition into Forge.
- `venue_viewed`: Triggered when transitioning to `/venue/[id]`.

---

## 6. QA & Verification Results

### Viewport Audits:
- **360px:** Passed (No horizontal scrolling, search bar fits, bottom sheet fits comfortably).
- **390px:** Passed (Optimal mobile view, scannable cards).
- **412px:** Passed (Clean chip scroll and legible typography).
- **768px:** Passed (2-column tablet grid).
- **1280px / 1440px:** Passed (Constrained max-width container, crisp imagery).

### Automated Verification:
- **TypeScript Typecheck (`npx.cmd tsc --noEmit`):** ✅ Passed (0 errors).
- **Vitest Unit Tests (`npx.cmd vitest run`):** ✅ Passed (8 test suites, all tests passed).
- **Production Build (`npx.cmd next build`):** ✅ Passed (All 33 static & dynamic routes compiled).

---

## 7. Explicitly Deferred (What Was Intentionally Not Built)

Per Phase 8 charter:
- ❌ **No Opaque AI Scoring:** No synthetic "AI Match" or ML recommendation vectors.
- ❌ **No Social Feed / Reviews:** No user comment threads, review forms, or follower counts.
- ❌ **No Infinite Scroll Browse Traps:** Results are bounded and prioritized deterministically.
- ❌ **No Booking / Payment Gateways:** Phase 8 is focused exclusively on decision confidence before leaving home.
