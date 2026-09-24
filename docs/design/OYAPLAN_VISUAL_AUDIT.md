# OyaPlan Visual & Product Design Audit (2026)

> **Document Status:** Approved Architectural & Visual Strategy  
> **Author:** Senior Product Designer + Senior Frontend Engineer + Design Systems Engineer  
> **Target:** OyaPlan 2026 Product Design + Frontend Redesign  

---

## 1. Executive Summary

OyaPlan’s mission is singular: **Deliver Budget Confidence through planning.** The primary user outcome is: **"Know what I'll probably spend before I leave home."**

The underlying technology, database schema, matching engine, and verification model are battle-tested and strong. However, the current visual interface suffers from a common product trap: **it presents as a collection of generic directory cards rather than a consumer decision engine.**

This audit establishes the concrete visual defects, existing strengths, design opportunities, component blueprints, and screen-by-screen roadmap needed to elevate OyaPlan into a **distinctive, premium Nigerian consumer product** without altering its core architecture or brand anchor (**#008751 OyaPlan Green**).

---

## 2. Current Visual Problems

### 2.1 The "Generic Card" Problem
* The interface relies on generic cards (photo on top, venue name, address, price per person, button) borrowed from directory and food delivery paradigms.
* The core product object is **not the venue**; it is the **decision** (the complete squad outing: food + drinks + transport + mandatory fees + certainty).
* Information is fragmented across disparate badges, forcing the user to mentally calculate the math of their night out instead of presenting the financial reality up front.

### 2.2 Money Is Treated as Plain Metadata
* Price is often buried in a small sub-caption or a single bottom-right label (`₦25,000 / person`).
* Budget limits, food vs. transport allocation, and VAT/service buffers are not presented with strong typographic authority.
* In Lagos, where inflation and unexpected surcharges cause anxiety ("group chat wahala"), financial numbers must have instant scannability and structural transparency.

### 2.3 Over-Badging & Trust Clutter
* Multiple conflicting badges compete for visual attention: `Verified`, `Within budget`, `Freshness`, `Score: 85`, `Scout vetted`.
* Trust signals currently look like certification stamps or compliance tags rather than calm, factual assurances.
* Users need simple, transparent facts: *"Verified 3 days ago"*, *"Menu prices confirmed"*, *"Estimated · limited data"*.

### 2.4 Arbitrary Spacing, Radiuses, and Borders
* Radiuses swing unpredictably between `rounded-xl`, `rounded-[20px]`, `rounded-[24px]`, `rounded-[28px]`, `rounded-[32px]`, and `rounded-full` without a coherent physical hierarchy.
* Sections use ad-hoc margins (`mt-7`, `p-5`, `py-12`, `pt-24`), creating an uneven vertical rhythm.
* Gray borders (`border-border-default`) and cards are overused to delineate content where typography, whitespace, and subtle tone shifts would be far more elegant.

### 2.5 Photography & Imagery Under-Utilization
* Many views fall back to generic icons or plain placeholders.
* Images lack a consistent framing and aspect-ratio standard (some 4:3, some 16:9, some arbitrary heights).
* The imagery does not consistently evoke the vibrant, warm, authentic experience of going out in Lagos (Admiralty Way at dusk, rooftop dining in VI, Ikeja vibes).

### 2.6 Fragmented Operator/Business Experience
* Three separate business surfaces exist: `/business/*` (canonical), `/partner/*` (deprecated redirect shell), and `/operator/*` (prototype).
* In the business venue editor (`PartnerOnboardingClient.tsx` used inside `/business/[venueId]/venue`):
  * **Missing Opening Hours Editor:** Profile health deducts 15% and displays a warning to add hours, but the form has zero fields for hours.
  * **No Real Photo Upload:** Requires typing raw external URLs with no image picker or upload flow.
  * **Broken Legacy Links:** Completion buttons link back to `/partner/[id]` rather than `/business/[id]`.
* Synthetic multipliers and hardcoded Naira calculations (`plansCount * 35000`) in `BusinessActivityClient.tsx` compromise the product's core value of radical transparency.

### 2.7 Mobile Navigation Deficiencies
* Top `NavBar.tsx` has no mobile navigation drawer; it only shows Back and Sign In.
* `MobileBottomNav.tsx` is disabled on business screens, stranding business operators on mobile devices.
* Footer has broken links: `/explore/lekki` (should be `/explore/lekki-phase-1`) and `/explore/victoria-island` (should be `/explore/vi`), yielding 404 errors.

---

## 3. Existing Strengths to Preserve & Amplify

1. **Non-Negotiable Brand Anchor**: The vibrant Nigerian green (`#008751`) is instantly recognizable, energetic, and trusted.
2. **Deterministic Matching & Real Zone Fare Logic**: The algorithm is pure, predictable, and mathematically sound; it calculates real Lagos transport matrices.
3. **Evidence-Based Pricing Model**: The database structure stores verified item-level menus, VAT percentages, service charges, and audit timestamps.
4. **Fast SSR & Lightweight Bundle**: Next.js 16 App Router, React 19, Tailwind CSS v4, and minimal client JavaScript yield excellent TTFB.
5. **WhatsApp Distribution & Plan Passes**: The `OYA-XXXXXX` visit pass and WhatsApp shareable link flow provide a physical bridge from group chat to the venue floor.

---

## 4. Proposed Visual Language & Thesis

### "Lagos Editorial $\times$ Modern Consumer Utility $\times$ Financial Clarity"

* **Warm, Grounded Surfaces**: Rather than stark, cold SaaS grays, OyaPlan rests on **White Sand** (`#FAFAF8`), subtle warm sand tones (`#FAF7F2`), and Lagos clay/earth accents (`#EAE4DC`, `#7A3E1D`).
* **Authoritative Midnight Tones**: Deep **Midnight Lagoon** (`#010528`) delivers crisp typographic contrast and editorial sophistication.
* **The Living Brand Green**: **#008751** is reserved for primary actions, success confirmations, positive budget fits, and trusted verification. It is never diluted or altered.
* **Typographic Hierarchy as Structure**: Typography does the heavy lifting of organizing content. Bold, editorial headlines, monospace figures for money, and quiet, high-legibility captions replace excessive nested boxes.
* **Tactile & Physical**: Controls have deliberate physical feedback (`active:scale-[0.98]`), spring transitions, and clear tap boundaries tailored for one-handed mobile use on Lagos 4G.

---

## 5. Reusable Component Blueprint

To avoid scattering ad-hoc styles across dozens of components, the redesign introduces a centralized set of design primitives:

1. **`OyaPrice`**: Displays financial numbers with currency symbol, integer formatting, per-person/total breakdown, and visual budget state.
2. **`OyaBudgetBreakdown`**: Compact, scannable ledger showing Venue + Transport + Extras + Mandatory Fees.
3. **`OyaTrustIndicator`**: Calm, honest assurance badges (`Verified 2 days ago`, `Estimated · Needs menu review`, `Operator confirmed`).
4. **`OyaDecisionCard`**: The hero consumer card combining imagery, occasion vibe, full squad total, price breakdown, and single-tap share/plan actions.
5. **`OyaSectionHeader`**: Coherent editorial headers with category eyebrow, bold title, and concise explanation.
6. **`OyaEmptyState`**: Truthful, confidence-preserving empty states (e.g. "We're still gathering enough planning activity to show this insight").
7. **`OyaHoursEditor`**: Simple, intuitive opening hours input for all 7 days of the week, fixing the long-standing operator onboarding gap.

---

## 6. Scope Classification & Action Plan

| Area / Feature | Action | Rationale |
|---|---|---|
| Brand Green (`#008751`) & Logo | **KEEP** | Non-negotiable identity anchor. |
| Home Page (`/`) | **RECOMPOSE** | Redesign around "I want to go out": conversation-first input, immediate budget clarity. |
| Explore / Discovery (`/explore`, `/explore/[slug]`) | **RECOMPOSE** | Shift from venue directory to "What can ₦35k get us tonight?". |
| Forge / Results (`/forge`) | **RECOMPOSE** | Elevate the generated plan into the hero decision object; clear ledger and WhatsApp share. |
| Plan Dossier (`/plan/[id]`) | **RECOMPOSE** | Transform from database record into an outing brief: screenshot & WhatsApp ready. |
| Public Venue (`/venue/[id]`) | **REPAIR & POLISH** | Make phone & Instagram clickable; add directions CTA; venue-aware outing notes. |
| Business Home (`/business/[venueId]`) | **REPAIR & POLISH** | Lead with "What needs attention?"; honest metrics; remove synthetic multipliers. |
| Business Venue Editor (`.../venue`) | **REPAIR** | Add Opening Hours editor; fix `/partner` redirect links; streamline verification flow. |
| Footer Explore Slugs | **REPAIR** | Fix `/explore/lekki` $\rightarrow$ `lekki-phase-1` and `/explore/victoria-island` $\rightarrow$ `vi`. |
| About Page (`/about`) | **REPAIR** | Link from Footer and About navigation so the founder narrative is discoverable. |
| Production Mockup (`/mockups/venue-card`) | **REMOVE** | Non-production mockup route lingering in App Router. |
| Multi-Stop Chain Planner (`/chain`) | **DEFER** | Preserve existing functionality; do not expand into speculative transit modes now. |
| Admin Dashboard (`/admin/*`) | **DEFER** | Internal operational tools are stable and functional. Focus on consumer & operator UX. |

---

## 7. Implementation Sequence

1. **Phase 0 — Constitutions**: Create `docs/design/OYAPLAN_DESIGN_SYSTEM.md`.
2. **Phase 1 — Token & Primitives Foundation**: Centralize design tokens in `app/globals.css` and create core UI primitives (`OyaPrice`, `OyaTrustIndicator`, `OyaBudgetBreakdown`, `OyaSectionHeader`, `OyaHoursEditor`).
3. **Phase 2 — Consumer Core (Home & Explore)**: Redesign Landing/Home and Explore surfaces.
4. **Phase 3 — Decision & Plan Core (Forge & Plan Dossier)**: Redesign Forge results and Plan Dossier pages.
5. **Phase 4 — Venue Public Presentation**: Polish `/venue/[id]` with real links, directions, and clean pricing sections.
6. **Phase 5 — Business Experience & Gap Resolution**: Fix venue editor (opening hours!), remove synthetic metrics, clean up navigation.
7. **Phase 6 — Route & Navigation Cleanup**: Fix footer slugs, link About page, remove dead mockup routes.
8. **Phase 7 — Verification & QA**: Multi-viewport testing (360px, 390px, 412px, desktop), test suite run, type check.
