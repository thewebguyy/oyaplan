# OyaPlan — Growth Roadmap

> **Status:** Approved product source of truth. See `docs/product/README.md` for how this document relates to `CLAUDE.md` and other repository documentation.

## Retention · Referrals · OyaScore · Community

This document relates specifically to keeping users coming back, getting them to bring friends, building trust in the pricing engine, and growing through community rather than paid ads.

## 1. North Star for Growth

**Retention Metric (carried forward):** percentage of Squads — saved friend groups — that share a second plan within 60 days of their first. This replaces an earlier draft metric based on safety/dispute resolution, which no longer applies now that OyaPlan is confirmed as a known-people planning tool, not a stranger marketplace.

## 2. Retention Mechanics

### 2.1 Carried Forward
- Outings-completed badges and simple streaks (e.g. "3 outings this quarter") to encourage repeat use beyond the first plan.
- Squad Profiles — a saved group of frequent outing companions, so a plan can be shared to the same crew repeatedly without re-adding people each time.

### 2.2 Added from Market Intelligence Report
- **Recurring outing persona** — let a Squad save a standing profile (e.g. "our usual Friday bar crew") with pre-set preferences, so planning a repeat outing takes one tap instead of rebuilding from scratch.
- **Event reminders** — push notifications for upcoming events or price drops at venues a Squad has saved or visited before.
- **Post-outing recap** — a simple "you spent ₦X, 15% under budget" summary after each outing, with a light tip for next time.
- **Personalised recommendations** — "based on your last 3 outings, try these 3 new spots" suggestions surfaced after a Squad has enough plan history.

## 3. Referral & Sharing Loops

### 3.1 Carried Forward
Referral credit for bringing a new user who completes a first plan — naturally spreads through existing friend groups since that's who the product is built for.

### 3.2 Group-Unlock Referral Mechanic
Rather than a generic "invite a friend, get a bonus" model, tie the reward to something the group actually needs: one person creates a plan, and two or three friends need to join (via the shared link) before the full budget breakdown or the OyaScore confidence rating unlocks. This creates a built-in reason to share the link immediately, because the plan creator can't get full value alone.

### 3.3 Shareable Cost Cards
A "Share this outing" button that generates a visual card — venue, total cost, OyaScore confidence rating — designed to be posted on Instagram or forwarded in WhatsApp, not just a screenshot of the app.

The content angle that performs best per the research is showing the true cost of a night out (e.g. "₦20k group outing breakdown"), not generic product demos — this doubles as marketing and as a trust-building display of the pricing engine.

## 4. OyaScore — Confidence Scoring System

The Market Intelligence Report identifies pricing trust as one of the biggest barriers to adoption in Nigeria — hidden fees, dynamic pricing, and venue misrepresentation all erode confidence. Its recommended fix is to make uncertainty visible rather than hiding it: show a confidence percentage next to every estimate, rather than presenting a single number as if it were guaranteed.

### 4.1 What OyaScore Would Show Users
- A confidence percentage per estimate, e.g. "₦4.2k–₦5.8k per person, 78% confidence based on 142 recent reports."
- A clear "Verified" vs "Estimated" label on every price, so users know which figures are backed by a recent visit versus inferred from older data.
- A visible explanation when a price includes a known variable, e.g. "peak hour +20%," rather than a flat number that turns out to be wrong on a Friday night.

### 4.2 What Feeds the Score (operational detail — see Data Operations Playbook for full mechanics)
- Freshness of the underlying venue data (how recently it was verified).
- Volume of user-reported actual spend confirming or contradicting the estimate.
- Historical accuracy of that specific venue's estimates over time.

This is the same confidence-scoring concept referenced in the Feature Spec's `confidence_score` field on the Venue entity — OyaScore is proposed here as the public-facing brand name for that internal mechanic, not a separate system.

## 5. Community & Launch Strategy

### 5.1 Seasonal Campaign Hooks
- **Detty December** — the single highest-intent window for group outing planning in Lagos; worth treating as a mini-launch moment even in year one.
- **Valentine's Day** — a curated "Valentine plans under ₦45k" push.
- **Ember months (Sept–Dec) and Easter** — general uptick in group social activity.

### 5.2 Launch Wedges (from Market Intelligence Report)
- **University wedge** — start with 3–5 Lagos campuses, targeting social organisers, class reps, and nightlife coordinators specifically, not students broadly. This is where referral density is highest and price sensitivity makes cost certainty matter most.
- **Offline wedge** — small "plan your outing" pop-ups near campuses, co-working spaces, and nightlife areas, where someone can build a plan on the spot in under two minutes. Trust in Lagos is still built in person.
- **Online wedge** — short-form video and creator collabs built around "here is the true cost of this night out" content, which is inherently shareable because it helps people justify decisions to friends.

### 5.3 Community Pillars
- **"OyaPlan Crews"** — a user club offering early access, custom planning support, and status perks to the most active planning groups.
- **Micro-influencer partnerships** in Lagos food, lifestyle, and nightlife — cheaper trust than large creators, and a natural fit for the cost-breakdown content format.
- **Event organiser and DJ collective partnerships** as a distribution channel, distinct from the venue partnerships covered in the Business Roadmap.

### 5.4 Growth Channel Priority (ranked by ROI)

| Rank | Channel | Best Use |
|---|---|---|
| 1 | WhatsApp group seeding | Meets outing decisions where they already happen |
| 2 | Founder-led outreach | Fastest learning loop for the first 500–1,000 users |
| 3 | Campus ambassadors | Dense, price-sensitive, repeatable cohorts |
| 4 | TikTok cost-content | Gen Z discovery and virality |
| 5 | Instagram share cards | Conversion and re-sharing |
| 6 | Micro-influencers | Cheaper trust than big creators |
| 7 | Referral loop | Works best once product-market fit is established |
| 8 | Community marketing | Slower but compounding long-term retention |
| 9 | Offline launch events | Legitimacy with the first 100 power users |
| 10 | PR | Credibility signal for investors and partners, not acquisition |

### 5.5 What to Avoid
Don't start with broad national awareness, expensive PR, or large influencer spend before there's a repeatable group-use loop. Don't optimise for downloads — optimise for plans created, friends invited, and outings repeated. OyaPlan is a social coordination product with local trust and pricing intelligence at its core, not a consumer app that happens to have a social feature bolted on.
