# OYAPLAN — 10,000% PRODUCT QUALITY AUDIT & ENGINEERING RE-ARCHITECTURE

**Standard:** *Would a first-time Lagos user understand what OyaPlan does, trust the numbers, make a decision, and complete the next action without thinking about the interface?*

---

## 1. Executive Assessment

OyaPlan is a consumer decision product for real-world experiences and spending in Lagos. It is **not** a social media feed, booking directory, or marketing website. The core outcome is: **Know what you'll spend before you leave home.**

This audit identifies critical UX, mobile, architectural, trust, and visual inconsistencies across the codebase, and defines the definitive implementation roadmap for 10,000% product quality.

---

## 2. Audit Findings by Surface

### A. Mobile Navigation & Utility Architecture
- **Problem:** The mobile menu drawer previously had overlapping concepts with the `/account` and `/dashboard` pages, creating confusion about where saved items and profile controls lived.
- **Problem:** Mobile drawer was rendered as a plain modal list rather than a dedicated "OyaPlan Space" with clear hierarchy: Authenticated Utility, Discovery, Business Bridge, and Company context.
- **Problem:** The hamburger menu and bottom navigation needed clear separation of concerns (Bottom Nav for quick tabs: Plan, Explore, Saved, Account; Menu for full OyaPlan space, utility, company, and business bridge).
- **Fix:** Redesign mobile drawer from scratch into a full-height utility surface with distinct sections (Your OyaPlan, Explore OyaPlan, For Business card, Company links) and ensure touch targets >= 44px (prefer 48px).

### B. Homepage Information Architecture
- **Problem:** The "Story Behind OyaPlan" (`FounderStorySection`) was positioned directly on the homepage, inserting narrative friction between the core planning widget and the decision flow.
- **Fix:** Remove `FounderStorySection` from `app/page.tsx` and consolidate all narrative, founder story, and company philosophy onto the canonical `/about` page. Keep the homepage strictly focused on: **Discover → Configure → Price Confidence → Next Step**.

### C. Iconography & Emoji Audit
- **Problem:** Functional and category interface elements across `PlannerWidget`, `LivePreviewCard`, `VerificationReceiptLoader`, `HowItWorksSection`, `venue/`, and `editorial/` used raw emojis (e.g. 📍, 💰, 💕, 👥, 🎉, ⚡, ⚠️, 🚗, 🚌) instead of crisp vector iconography.
- **Fix:** Replace functional emojis with refined Lucide icons (`MapPin`, `Wallet`, `Heart`, `Users`, `PartyPopper`, `Zap`, `Utensils`, `Sun`, `Car`, `Bus`, `ShieldCheck`, `AlertTriangle`). Reserve emojis strictly for user-created squad avatars if configured by the user.

### D. Trust & Financial Precision
- **Problem:** Some UI copy in loading states referenced hardcoded strings like `"✓ 10% VAT + local service charge baked in"` rather than dynamic, verified data handling.
- **Rule:** Never fabricate VAT (7.5% or 10%) or mandatory fees. Follow:
  - `NULL` = Not Provided
  - `0` = Free / Zero Charge
  - `> 0` = Known Verified / Estimated Fee
- **Fix:** Standardize all financial labels to: **Your Budget**, **Estimated Spend**, **Remaining**. Label estimates honestly as `Verified` vs `Estimated` vs `Limited data`.

### E. Mobile Responsiveness (360px, 390px, 412px)
- **Problem:** Text wrapping and tap target compression on smaller viewports (360px) in preset selectors and filter chips.
- **Fix:** Ensure all interactive elements have minimum 44×44px touch targets, fluid typography, safe-area padding for iOS/Android home indicators, and zero horizontal overflow.

### F. Business / Consumer Boundary
- **Problem:** Ambiguity in navigation links between consumer discovery and operator surfaces.
- **Fix:** Ensure all consumer-facing entry points point to `/for-business`, while venue operator workspaces remain isolated under `/business/[venueId]` with dedicated `BusinessMarketingHeader` and operator layouts.

---

## 3. Information Architecture Blueprint

| Surface | Canonical URL | Primary User Outcome |
| :--- | :--- | :--- |
| **Home** | `/` | Instant Lagos outing configuration & budget preview |
| **Explore** | `/explore` | Filter and discover verified spots by budget & area |
| **Forge** | `/forge` | Fast progressive outing planning flow |
| **Venue Detail** | `/venue/[id]` | Understand pricing, menu, logistics & decide |
| **Plan Page** | `/plan/[id]` | Review budget vs estimated landed spend & squad share |
| **Saved** | `/saved` | Manage bookmarked spots & saved plans |
| **Account** | `/account` | Manage profile identity & preferences |
| **Settings** | `/settings` | Notification & account controls |
| **About** | `/about` | Why OyaPlan exists: founder story & philosophy |
| **For Business** | `/for-business` | Venue operator landing page & claim flow |
| **Business Portal** | `/business/[venueId]` | Private operator dashboard for menu/pricing updates |

---

## 4. Execution Plan
1. **Canonical Design System:** Document all design tokens in `docs/design/OYAPLAN_CANONICAL_DESIGN_SYSTEM.md`.
2. **Homepage Content Update:** Remove story section from `app/page.tsx` and enrich `/about/page.tsx`.
3. **Mobile Menu & Navigation Re-engineering:** Overhaul `components/NavBar.tsx` and `components/MobileBottomNav.tsx`.
4. **Emoji to Lucide Icon Migration:** Update `PlannerWidget.tsx`, `ForgeForm.tsx`, `LivePreviewCard.tsx`, `VerificationReceiptLoader.tsx`, `HowItWorksSection.tsx`, `venue/` and `editorial/` components.
5. **Trust & Financial Alignment:** Ensure no invented fees or hardcoded tax strings.
6. **Mobile Ergonomics & Resilience:** Validate responsive widths (360px, 390px, 412px) and test builds.
