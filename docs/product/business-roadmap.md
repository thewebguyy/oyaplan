# OyaPlan — Business Roadmap

> **Status:** Approved product source of truth. See `docs/product/README.md` for how this document relates to `CLAUDE.md` and other repository documentation.

## Partners · Monetization · Analytics

This document consolidates monetization and partnership content that was previously split across the original Competitive Landscape doc, the Feature Spec, and the Market Intelligence Report. Sections marked NEW are either new additions or new structure imposed on points that existed but weren't organized as business strategy before.

## 1. Monetization Layers

### 1.1 User-Facing
- **Freemium core:** free browsing of venues, viewing of cost estimates, and personal plan-building; premium tier unlocks unlimited saved plans, advance filters (e.g., "under ₦15k", "Bolt only"), Smart suggestions (AI-based venue swaps to hit budget), early access to popular group outings, and multiple saved Squads.
- **Booking & payment (future):** 2–3% transaction fee if integrated group payment is added later, purely as a convenience for a Squad splitting a bill among themselves — not a marketplace transaction fee, since OyaPlan does not broker payments between people who don't already know each other. Booking certain components such as beach entry, boat rides, events.

### 1.2 Venue & Partner
- **Free Standard listings**; "Featured venue" placement in specific categories and boosted visibility priced at ₦5k–20k/month per venue.
- **Dynamic deals** woven into outing suggestions including venue posts ("Weekend cocktail deal: 2 for ₦3k") and monetisation via commission on booked deals or promotion fee.
- **Transport partnerships** (Bolt or local operators) paying for integration visibility or offering referral-fee discount codes for OyaPlan users.

### 1.3 Brand & Bundled Outings
Partner with consumer brands to create pre-packaged, guaranteed-price outings (e.g. "Brand X + Venue Y + Transport = ₦3k"), giving brands a Lagos youth-culture placement and giving OyaPlan a sponsorship line that doesn't compromise the core pricing-trust promise, since the bundled price is still fully disclosed upfront.

## 2. Revenue Model & Projections

| Revenue Stream | Mechanism |
|---|---|
| Freemium Core | ₦3k–5k/year for unlimited saves, AI-smart suggestions, and advanced budget filters. |
| Venue Partnerships | ₦5k–20k/month for featured placement and boosted visibility in suggestions. |
| Transaction Fees | 2–3% on integrated group payments (Squad-only) and commission on venue-exclusive deals. |
| Venue Analytics | ₦10k–50k/month per venue or chain for demand heatmaps and pricing insight dashboards. |

- **Year 1:** ~₦8–9M — premium subscriptions (~300 users), venue promotions (~50 venues), light transaction volume.
- **Year 2:** ~₦40–45M — premium subscriptions (~2,500 users), venue promotions (~200 venues), early deals commission.
- **Year 3:** ~₦120M+ — premium subscriptions (~7,500 users), venue promotions (~500 venues), deals and analytics revenue scaling.

## 3. Venue & Partner Strategy

### 3.1 Supply-Side-First Sequencing
- Onboard venues, event organisers, and transport data before pushing hard on user acquisition — a planning tool with thin venue coverage doesn't retain users, and every early user who hits an empty area is a harder user to win back later.
- Incentivise data contribution by offering venues free listings or basic analytics in exchange for keeping their pricing updated — this solves the cold-start problem of thin, stale venue data that would otherwise make early estimates unreliable.
- Start with a curated set of popular, high-density venues (VI/Lekki nightlife and beach circuit) before expanding city-wide, rather than trying to cover all of Lagos at once.

### 3.2 Two-Sided Value Proposition (carried forward, made explicit)

| Side | What They Get |
|---|---|
| Users | Cost certainty, multi-venue planning, and group coordination in one place. |
| Venues / Partners | Qualified foot traffic, better conversion than passive discovery, and data insight into demand patterns. |

## 4. Analytics & Data Monetization

### 4.1 Venue-Facing
- **Venue Analytics Dashboard** — demand heatmaps ("people plan outings to VI bars on Fridays") and price-sensitivity insight, priced ₦10k–50k/month per venue or chain.
- **City & Brand Insight Reports** — outing trends and budget bands by area, sold via data licensing or sponsored reports to advertisers and brands.

This is a natural build-out for the strategy/operations side of the team given existing SQL, Power BI, and reporting experience — the data model is already structured to support it.

### 4.2 User-Facing Analytics
- Personal spending trend insights ("you spend 30% more on Fridays than other nights") — currently absent from the product, and flagged in the research as a retention driver as much as a monetisation one.
- Longer-term, exploratory: syncing with a user's bank or fintech app to compare planned versus actual spend automatically. This is a significant scope and trust undertaking — worth treating as a Year 2+ idea, not something to plan engineering time against now.

## 5. Investor & Fundraising Notes

### 5.1 Target Investor Types
- Local Nigerian VCs and seed funds with consumer, lifestyle, or mobility portfolios.
- Angel investors with backgrounds in food delivery, ride-hailing, or logistics — they already understand Lagos unit economics.
- Non-dilutive funding: grants and startup competitions (e.g. Flutterwave Spark) as a lower-pressure early option.

### 5.2 What Investors Will Want to See
- A clear articulation of the problem (no cost certainty for outings in Lagos) and why existing tools don't solve it.
- Early traction — even informal pilot outings, venue conversations, and a working demo count before a public launch.
- A credible moat: proprietary pricing data, the OyaScore confidence system, and Squad-based retention — not just "we built an app."
- A realistic 3-year financial model with clearly stated assumptions, and a defined break-even path.

## 6. Risk & Regulatory Notes
- If integrated group payment is added later (a Squad splitting a bill in-app), avoid the platform ever holding user funds directly. Route it through a licensed processor (e.g. Paystack or Flutterwave split-payment products) rather than an in-house wallet, to stay clear of CBN payment-service-provider licensing thresholds.
- Keep a documented data-retention and privacy policy for phone numbers and location data collected at signup.
- From the Market Intelligence Report: monetisation must not come at the cost of trust — becoming an ad-heavy listing site would undercut the core cost-transparency positioning that differentiates OyaPlan in the first place.
