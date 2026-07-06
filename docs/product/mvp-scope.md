# OyaPlan — MVP Scope

> **Status:** Approved product source of truth. See `docs/product/README.md` for how this document relates to `CLAUDE.md` and other repository documentation.

## 1. Core MVP Definition

The original scope discipline note from the Operations & Growth Roadmap still holds and is the governing constraint for everything below: a simple venue data model and a basic estimate calculator only. No confidence scoring, no budget simulation, no automated group planning in the first build.

## 2. In-Scope for MVP

### 2.1 Onboarding

Phone/OTP signup, Lagos sub-location, outing type and budget-band preferences, then three curated starter plans with per-person cost shown up front. Target: a new user reaches their first actionable plan in under three minutes.

### 2.2 Outing Builder (Solo Planning)

Custom multi-stop outing building (e.g. beach → bar → dinner), with venue search filtered by price, vibe, and distance at each step, auto-calculated transport across Bolt, BRT/danfo, or a blended mode, and a full cost breakdown with a budget/premium toggle.

### 2.3 Venue Discovery & Details

Venue pages showing price bands for food and drinks, entry fees (including weekend variants), ratings, and photos, with a one-tap add-to-outing action.

### 2.4 Transport & Cost Estimator

Mode/price/time/comfort matrix across Bolt, BRT, and danfo for each leg of a plan, feeding directly into the total cost.

### 2.5 Plan Sharing & Cost Split

Link-based sharing to a WhatsApp group or direct message — no public feed. Manual cost-sharing: the app shows the total and an even per-person split; the group settles outside the app the same way they would today.

### 2.6 Basic Account Trust

Phone/OTP verification at signup for spam prevention, and a simple "report a venue listing" action for incorrect or offensive venue content. No reliability scoring, no check-ins — those don't apply to a known-people planning tool.

## 3. Explicitly Out of Scope for MVP

Deferred to later phases — listed here so nothing gets accidentally built early or promised to investors as day-one functionality.

- **OyaScore / confidence scoring** — requires a baseline of verification and user-reported data that won't exist until after the pilot period; see the Data Operations Playbook's "minimum data bar" rule.
- **Integrated in-app group payments** (Paystack/Monnify split payments) — manual settlement outside the app is the MVP approach.
- **Budget Planning Assistant / automated suggestions** — Milestone 3 in the Growth and Operations roadmaps, not an MVP feature.
- **Loyalty mechanics** (streaks, badges, referral credit) — Milestone 4, once there's a base of repeat users to retain.
- **Brand partnerships and bundled outings** — a business-development motion that needs an existing user base and venue network to be worth pursuing.
- **Fintech/bank integration** for actual-spend tracking — flagged in the Business Roadmap as a Year 2+ exploratory idea, not a near-term build.
- **Time-per-leg and weather-aware plan flagging** — valuable, but reasonable to sequence just after MVP rather than in the first release, since it depends on the transport estimator already being stable.

## 4. MVP Milestones

### Milestone 0.5: Operational Validation (Month 1)
- 100+ venues manually verified.
- 500+ menu items with real-time pricing.
- 200+ transport routes with verified fare ranges.
- Basic phone/OTP verification live before first pilot outing.
- Shareable-link flow for plans built and tested.

### Milestone 1: Estimate Reliability (Months 2–3)
- **Success Metric:** 30% user confidence rate in pre-outing cost estimates.
- Link-based plan sharing (WhatsApp/direct link) live.

## 5. MVP Budget

| Resource / Category | Estimated Cost (₦) |
|---|---|
| Engineering Team (2 personnel) | 400,000 – 800,000 |
| Operations Intern | 80,000 – 150,000 |
| Product Design (shared) | 150,000 |
| Logistics (transport & validation) | 30,000 – 60,000 |
| Miscellaneous (calls, site visits) | 20,000 – 50,000 |
| **Total Estimated Monthly Burn** | **680,000 – 1,210,000** |

## 6. Success Criteria to Exit MVP

- Venue and transport data verification targets from Milestone 0.5 are met and holding (not just hit once and gone stale).
- 30%+ user confidence rate in cost estimates is reached, per Milestone 1.
- At least a handful of Squads have shared a second plan, giving early signal that the retention mechanics in the Growth Roadmap are worth building out further.
