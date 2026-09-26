# OyaPlan — Phase 6 Architecture Audit & Decisions

**Status:** APPROVED FOR IMPLEMENTATION  
**Role:** Senior Product Designer + Senior Frontend Engineer + UX Architect + Data/State Architecture Engineer  
**Scope:** Phase 6 — Personalization, Recently Viewed & Saved Experience  

---

## 1. Executive Summary & Purpose

OyaPlan is evolving from answering *"Help me plan an outing right now"* to *"Help me make better outing decisions over time."* 

In this phase, we establish a **trustworthy, factual personal experience memory** across all consumer touchpoints. We do **not** build a recommendation engine or infer user taste prematurely.

```text
Explore / Search
       ↓
Venue Viewed (Recorded in Factual Recent History)
       ↓
Plan Created (Forged with Budget & Squad Constraints)
       ↓
Venue Saved (Explicit User Bookmark)
       ↓
Plan Saved / Shared (Explicit User Outing Record)
       ↓
User Returns → OyaPlan Remembers Useful Factual Context
```

---

## 2. Current State Audit

### 2.1 Saved Venues / Spots
* **Current Storage:** Client-side `localStorage` (`STORAGE_KEY = "oyaplan_saved_ideas"` via `useSavedSpots.ts`).
* **Sync Mechanism:** Window `storage` and custom `oyaplan_saved_spots_updated` DOM events.
* **Limitations Identified:**
  1. No server persistence for authenticated users (does not follow user across devices).
  2. Inconsistent UI surfaces: Explore cards, `/venue/[id]`, and `/saved` had subtle differences in how Spot objects were serialized.
  3. No automatic reconciliation of anonymous local saves into an authenticated user's account upon sign-in.

### 2.2 Saved Plans
* **Current Storage:** Database table `public.user_saved_plans` (`user_id`, `shared_plan_id`, `saved_at`) in Supabase.
* **Domain Service:** `SavedPlanService` in `lib/services/identity/savedPlanService.ts`.
* **Limitations Identified:**
  1. No local anonymous holding state for plans if an unauthenticated user wants to quickly bookmark a plan without immediate auth.
  2. `SavePlanButton` was missing on the redesigned `/plan/[id]` action strip.

### 2.3 Recently Viewed Venues
* **Current Storage:** None. Telemetry (`trackEvent('venue_viewed', ...)`) fired to `raw_product_events`, but there was no user-facing client history store.
* **Limitations Identified:**
  1. Users exploring multiple Lagos venues had no easy way to backtrack without re-searching.
  2. Explore and Home pages had no lightweight "Recently Viewed" shelf.

### 2.4 Authentication & Identity Reconciliation
* **Domain Service:** `IdentityMergeService` in `lib/services/identity/identityMergeService.ts`.
* **Current Flow:** Merges analytics sessions, plan requests, and attribution sessions on login.
* **Gap:** Does not yet reconcile anonymous local saved spots or recent views into the authenticated user profile.

---

## 3. Core Architecture Decisions

### 3.1 Strict Separation: Saved Venue vs. Saved Plan vs. Recently Viewed

| Dimension | Saved Venue (Spot) | Saved Plan | Recently Viewed |
| :--- | :--- | :--- | :--- |
| **User Intent** | *"I want to remember this place."* | *"I want to remember this specific budget outing scenario."* | *"I looked at this place recently."* |
| **Factual Basis** | Explicit user action (Click bookmark/heart). | Explicit user action (Save plan / Share). | Factual navigation event (Rendered venue page). |
| **Preference Implication** | Explicit interest. | Explicit outing scenario. | **ZERO preference inferred.** Just history. |
| **Primary Destination** | `/saved` (Saved Spots tab) | `/dashboard` (Saved Plans tab) & `/saved` | Horizontal carousel on Explore & Saved pages. |
| **Storage (Anon)** | `localStorage` (`oyaplan_saved_spots_v1`) | `localStorage` fallback queue + Auth prompt | `localStorage` (`oyaplan_recent_venues_v1`) |
| **Storage (Auth)** | `localStorage` (instant UI) + Supabase `user_saved_venues` | Supabase `user_saved_plans` + local cache | `localStorage` (capped at 10 items) |

---

## 4. State & Reconciliation Model

### 4.1 Anonymous User
* Can save venues freely with 1 tap.
* Can view venues with history automatically tracked locally (capped at 10 items, deduplicated by updating timestamp, newest first).
* Can forge plans and save them with instant feedback; prompts non-blocking sign-in if they want permanent cross-device backup.

### 4.2 Authenticated User
* **Canonical Source of Truth:**
  - Saved Venues: Synchronized with database table `user_saved_venues` (or local-first cache with background sync).
  - Saved Plans: `user_saved_plans` table in Supabase.
  - Recently Viewed: Client-side storage (fast, private, device-scoped, zero DB load).
* **Multi-Tab Sync:** BroadcastChannel / custom DOM events (`oyaplan_saved_spots_updated`, `oyaplan_recent_venues_updated`).

### 4.3 Login / Reconciliation
* Upon user authentication (via `useAuth` / `SessionResolver`), any anonymous saved spots present in `localStorage` are automatically reconciled without overwriting existing server records.
* Logout clears user-scoped state while safely preserving anonymous browsing defaults.

---

## 5. Recently Viewed Specification

1. **Deterministic Cap:** Maximum 10 venues.
2. **Ordering:** Strict descending chronological order (`viewed_at` timestamp).
3. **Deduplication:** Viewing a venue that already exists in history does **not** create a duplicate card; it moves the existing venue to index 0 with an updated timestamp.
4. **Data Contract:**
```typescript
export interface RecentlyViewedVenue {
  id: string;
  name: string;
  address: string;
  areaSlug: string;
  areaName: string;
  category: string;
  pricePerPerson: number;
  imageUrl?: string;
  coverUrl?: string;
  vibeTags: string[];
  viewedAt: string; // ISO-8601
}
```
5. **Copy & Tone Rules:**
   - Always: *"Recently viewed"*, *"Places you looked at"*
   - Never: *"Your favourites"*, *"Recommended for you"*, *"Because you love..."*

---

## 6. Explicit Non-Goals (What We Are NOT Building)

1. **NO AI Recommendations / Recommendation Engines** — No collaborative filtering, vector embeddings, or machine learning scoring.
2. **NO Taste Profiles / Preference Scoring** — Viewing a sushi restaurant does not mean the user loves Asian food.
3. **NO Social Graphs / Friends Activity Feeds** — No friend-of-a-friend venue rankings.
4. **NO Gamification / Loyalty Points / OyaScore** — No artificial badges or points for saving places.
5. **NO Marketing Push / Email Recommendation Campaigns** — No unsolicited "Places you might like" notifications.

---

## 7. Migration & Rollout Strategy

1. **Migration 0055:** Create `public.user_saved_venues` table with RLS (`auth.uid() = user_id`) and unique constraint on `(user_id, venue_id)`.
2. **Hook Upgrade:** Upgrade `useSavedSpots` to support bidirectional local-first synchronization and Supabase sync for authenticated users.
3. **Recently Viewed Hook:** Implement `useRecentlyViewed` hook with local persistence, 10-item cap, and cross-tab event synchronization.
4. **UI Integration:**
   - `/venue/[id]`: Record view into `useRecentlyViewed`.
   - `/saved`: Clean segmented view for Saved Spots & Saved Plans, with Recently Viewed shelf.
   - `/explore`: Compact Recently Viewed horizontal row when history exists.
   - `/plan/[id]`: Tactile `SavePlanButton` restored and synchronized.
5. **Mobile First QA:** Verify touch targets, card clipping, and text wrapping across 360px, 390px, 412px, 768px, 1280px, 1440px.
