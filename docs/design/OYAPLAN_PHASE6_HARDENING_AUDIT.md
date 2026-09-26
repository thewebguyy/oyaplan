# OyaPlan — Phase 6 Hardening & Verification Audit

**Phase:** Phase 6 — Personalization, Recently Viewed & Saved Experience  
**Status:** COMPLETE & VERIFIED  
**Date:** September 2026  
**Auditor:** Senior Product Designer + Senior Frontend Engineer + UX Architect + Data/State Architecture Engineer  

---

## 1. Executive Summary

Phase 6 establishes a **trustworthy, factual personal experience memory** across all OyaPlan consumer surfaces without prematurely introducing speculative recommendation algorithms, preference scoring, or inferred taste models.

OyaPlan now clearly distinguishes between:
1. **Saved Venues (Spots):** Explicit user bookmarking of a place to remember and plan around later.
2. **Saved Plans:** Explicit user planning scenarios with custom budget, squad size, and cost breakdowns.
3. **Recently Viewed Spots:** Factual, privacy-preserving browsing history (capped at 10 items) allowing frictionless backtracking.

---

## 2. Architectural Decisions & State Matrix

| User Context | Saved Spots (Venues) | Saved Plans | Recently Viewed Spots |
| :--- | :--- | :--- | :--- |
| **Anonymous User** | Persisted instantly in `localStorage` (`oyaplan_saved_ideas`). Works offline and across tabs with custom sync events. | Prompts non-blocking sign-in to persist cross-device; allows instant temporary sharing via URL. | Persisted locally in `localStorage` (`oyaplan_recently_viewed_v1`), capped at 10 items. |
| **Authenticated User** | Optimistic local storage + background database sync via `public.user_saved_venues` (`user_id`, `venue_id`). | Server-side canonical persistence via `public.user_saved_plans` with RLS protection. | Local client store (fast, zero server overhead, device-scoped). |
| **Cross-Device Sync** | Follows authenticated user across devices upon login. | Follows authenticated user across devices. | Device-specific browsing history with 1-tap "Clear" control. |
| **On Login Reconciliation** | Existing anonymous local saves merge seamlessly without overwriting server state. | User can immediately view all past saved outings under `/saved?tab=plans` and `/dashboard`. | Preserved on current browser session. |

---

## 3. Recently Viewed Specification & Rules

1. **Deterministic Cap:** Maximum 10 items.
2. **Deduplication:** When an existing venue in history is re-visited, it is hoisted to index 0 with an updated `viewedAt` timestamp rather than creating duplicate entries.
3. **Language & Trust Integrity:**
   - Uses strictly factual copy: *"Recently viewed spots"*, *"Places you looked at recently on this device"*.
   - Never uses manipulative or inferred phrasing: *"Your favourites"*, *"Recommended for you"*, *"Places we know you love"*.
4. **Interactive Component:** [`RecentlyViewedRow`](file:///c:/Users/Admin/oyaplan/components/venue/RecentlyViewedRow.tsx) provides a smooth, horizontally scrollable snap carousel with touch-friendly targets, accurate price formatting, and 1-tap "Clear" capability.

---

## 4. Personalization Boundaries (What Was Deliberately NOT Built)

To maintain absolute trust and prevent AI hallucinations or premature inference:
- ❌ **NO AI Recommendation Engine:** No vector embeddings, nearest-neighbor clustering, or collaborative filtering.
- ❌ **NO Preference Scoring:** Viewing a restaurant in VI does not tag the user as an "upscale foodie".
- ❌ **NO OyaScore / Gamification:** No badges or point systems for browsing or saving spots.
- ❌ **NO Unsolicited Marketing Campaigns:** No push notifications or automated emails claiming to know the user's taste.

---

## 5. Cross-Surface Consistency Verification

All touchpoints now share unified synchronization:

```text
[Explore Page] ──(Click Bookmark)──> Saved in localStorage + Synced to Server
      │
      ▼
[Venue Page /venue/[id]] ──> Displays active "Saved" state immediately
      │
      ▼
[Saved Page /saved] ──> Instant list update in "Saved Spots" tab
      │
      ▼
[Account /account] ──> Quick access link to Saved Spots and Outing Plans
      │
      ▼
[Plan Page /plan/[id]] ──> 1-Tap "Save Plan" persists outing to "Saved Plans" tab
```

---

## 6. Mobile First QA & Responsive Verification

| Width / Form Factor | Verification Surface | Status | UX & Layout Observations |
| :--- | :--- | :--- | :--- |
| **360px (Small Android)** | `/saved`, `/explore`, `/venue/[id]`, `/plan/[id]` | ✅ PASS | Touch targets ≥44px. Card padding scales smoothly. Horizontal carousels scroll with clean edge snapping. |
| **390px (iPhone 14/15/16)** | `/saved`, `/explore`, `/venue/[id]`, `/plan/[id]` | ✅ PASS | Zero horizontal viewport overflow. Sticky CTA and bottom navigation do not collide with content. |
| **412px (Pixel / Samsung)** | `/saved`, `/explore`, `/venue/[id]`, `/plan/[id]` | ✅ PASS | Optimal aspect ratios for food and venue imagery. Crisp typography with Outfit font. |
| **768px (Tablet / iPad)** | `/saved`, `/explore`, `/venue/[id]`, `/plan/[id]` | ✅ PASS | 2-column grid layout for saved spots and plans. Smooth transition from bottom nav to desktop bar. |
| **1280px / 1440px (Desktop)** | `/saved`, `/explore`, `/venue/[id]`, `/plan/[id]` | ✅ PASS | Contained max-width grids (`max-w-4xl` / `max-w-5xl`), restrained shadows, elegant white-sand backgrounds. |

---

## 7. Accessibility & Performance Validation

1. **Accessible Actions:**
   - Every save, remove, and clear button includes descriptive `aria-label` tags (e.g. `aria-label="Remove Yellow Chilli from Saved Spots"`).
   - Keyboard navigation supports full focus rings with visible `:focus-visible` styling.
2. **Performance:**
   - `useRecentlyViewed` and `useSavedSpots` use optimistic updates and event-driven multi-tab synchronization with zero blocking network waterfalls.
   - Images are loaded via optimized `VenueImage` / `Next.js Image` with responsive sizes and category fallbacks.

---

## 8. Verification Results

- **TypeScript Typecheck (`npx tsc --noEmit`):** ✅ PASSED (0 errors)
- **Vitest Unit Test Suite (`npx vitest run`):** ✅ PASSED (0 failures across all unit test files)
- **Production Build (`npm run build`):** ✅ PASSED
