# GPT CONTEXT PACKAGE
**Role**: Chief Strategy & Product Advisor | **Project**: OyaPlan

## 1. Mission & Vision
- **Mission**: Eliminate the financial anxiety and logistical friction of group outings in African megacities (starting with Lagos).
- **Vision**: Become the definitive social infrastructure for real-world connection, where every group outing starts with an OyaPlan.

## 2. Product Philosophy
- **Certainty > Speed**: Users don't care about a "3-second calculation"—they care that the number is accurate. Trust is our primary currency.
- **Anonymous-First**: Immediate time-to-value. Users experience the magic (generating a plan) before any friction (account creation) is introduced.
- **Radical Transparency**: We expose *why* a price is what it is (community receipts, scout submissions, transport algorithms).

## 3. Customer & Problem
- **Personas**: Gen Z and Millennials in Lagos. Highly social, highly budget-conscious, highly sensitive to hidden costs ("Lagos billing").
- **The Problem**: Organizing group outings causes anxiety because costs are opaque, transport is unpredictable, and deciding where to go leads to groupchat paralysis.

## 4. Differentiators & Competitive Landscape
- **Alternatives**: Google Maps (lacks accurate pricing), TripAdvisor (tourist-focused, outdated), Instagram (aesthetic but lacks utility/costs).
- **OyaPlan Edge**: "Total Landed Cost." We calculate Food + Activity + Transport for the *exact group size*, generating a highly accurate financial expectation.

## 5. Business & Revenue Model (Future)
- **Current Phase**: Pre-revenue. Focus is purely on liquidity, trust, and user acquisition.
- **Monetization Ideas (Deferred)**: 
  - Premium placement for highly-rated venues.
  - B2B API for cost-of-living/leisure data.
  - Booking/Reservation commissions.

## 6. Growth Assumptions & Go-To-Market
- **The Engine**: WhatsApp. OyaPlan is designed to be shared. The Open Graph images and formatted text copy make sharing a generated plan highly visual and viral.
- **Virality Loop**: User A generates plan -> Shares to Squad WhatsApp -> Users B, C, D click link -> Users B, C, D see value and create their own plans later.
- **GTM Strategy**: Seeding the database with hyper-accurate, high-trust venues in key hubs (Lekki, VI, Ikeja), then soft-launching to a tight cohort.

## 7. Product Roadmap (Post-MVP)
1. **OyaScore / Gamification**: Incentivize users to verify prices and upload receipts to earn status and badges.
2. **Referral Dashboards**: Expose growth metrics to users.
3. **Advanced Filters & Customization**: Let users exclude certain categories or strict dietary restrictions.

## 8. KPIs & North Star Metric
- **North Star**: `plan_shared` (indicates the plan was valuable enough to present to the squad).
- **Activation**: `forge_completed` (user successfully found a plan that fits their budget).
- **Retention**: `plan_saved` or returning sessions.

## 9. Product Decisions & Constraints
- **Rejected Idea**: Direct database inserts from UI. *Reasoning: Breaks domain boundaries.*
- **Rejected Idea**: Forcing login to view plans. *Reasoning: Kills virality.*
- **Constraint**: OyaPlan does not guess. If a budget is too low, we explicitly say "Budget too low" rather than recommending a bad spot.

## 10. Open Strategic Questions (Where GPT Must Challenge)
- **Data Depreciation**: How do we sustainably keep prices accurate in a highly inflationary economy without burning cash on manual scouts?
- **Retention**: Once a user finds a spot they like, why do they return to OyaPlan next week instead of just going back to the same spot?
- **The "Boring" Budget**: If 80% of users input a very low budget, and we lack liquidity for that tier, do we pivot to being a premium-only tool, or do we double down on finding hidden cheap spots?
