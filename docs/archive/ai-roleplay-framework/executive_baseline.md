# PROJECT BASELINE & FOUNDER HANDOFF
**Status**: ACTIVE | **Phase**: Post-Phase 13 (Launch Ready) | **Date**: July 2026

## 1. Executive Summary
OyaPlan has successfully completed its "Initial Build Phase" (Phases 1–13). The infrastructure has transitioned from abstract backend services into a fully assembled, polished, and psychologically optimized consumer experience. The platform is ready for its Open Beta launch.

## 2. Completed Phases
The system is built on seven core pillars established over 13 phases:
1. **Canonical Data Platform**: Robust schema for spots, areas, and categories.
2. **Matching Engine**: Vibe and budget-based venue recommendation logic.
3. **Trust Intelligence**: Confidence scoring and verification tracking for prices.
4. **Pricing Engine**: Dynamic calculations including transport matrices and group sizes.
5. **Analytics Platform**: Strict-mode resilient tracking (`page_viewed`, `forge_started`, `forge_completed`, `plan_shared`).
6. **Growth Infrastructure**: Viral loops, referral codes, and dynamic Open Graph images.
7. **Identity Platform**: Anonymous-first authentication (`SessionResolver`), user preferences, and shared plans.
8. **Consumer Assembly & Polish (Phases 12-13)**: Conversion-optimized copy, empathetic empty states, and aesthetic upgrades (Spot Images, Sonner Toasts).

## 3. Current Project Status & Sprint
- **Current Status**: **LAUNCH READY (MVP)**
- **Next Sprint**: Data Seeding (ETL pipeline) -> Closed Beta -> Open Beta -> Iteration.

## 4. Architecture Summary
- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, shadcn/ui.
- **Backend/Database**: Supabase (PostgreSQL), Edge Functions (where applicable), `@vercel/og` for dynamic images.
- **Auth Model**: Anonymous-first. Users can generate, save, and share plans without creating accounts. Identity is stitched upon eventual sign-up.

## 5. Major Decisions
- **Anonymous-First Philosophy**: Frictionless onboarding. Users experience the core value ("Total Landed Cost") before being asked for PII.
- **Certainty over Speed**: Removed the "3 seconds" value prop in favor of "Knowing exactly what it costs". Trust is the primary currency.
- **No Direct UI Database Writes**: All mutations flow through domain services (e.g., `SavedPlanService`) for future-proofing.

## 6. Business & Product Risks
- **Data Freshness (High Risk)**: OyaPlan's value is entirely dependent on the accuracy of its prices. If prices become stale, trust vanishes.
- **Liquidity (Medium Risk)**: The Matching Engine requires a dense dataset of venues across all budgets/vibes to prevent users hitting the "Budget too low" empty state frequently.
- **Virality Assumptions**: Growth relies on the assumption that users will share plans via WhatsApp organically due to the visual appeal and utility.

## 7. Technical Risks
- **Rate Limiting**: Heavy reliance on Supabase from the client/edge. Upstash Redis must be properly monitored to prevent abuse.
- **Data Scaling**: The `transport_matrix` is currently static/JSON based. As areas expand, calculating true A-to-B transport costs will require a scalable routing solution.

## 8. Roadmap Status
- **Immediate Priorities**:
  - Run the `scripts/import-verified-venues.ts` ETL script in production.
  - Onboard a beta cohort and monitor the funnel.
- **Deferred Work**:
  - Referral Progress Dashboard
  - Advanced Filters
  - OyaScore Gamification & Leaderboards
  - User Preferences UI

## 9. Success Metrics (North Star)
- **Primary**: `plan_shared` (Virality & Utility)
- **Secondary**: `forge_completed` (Activation) -> `plan_saved` (Retention)
