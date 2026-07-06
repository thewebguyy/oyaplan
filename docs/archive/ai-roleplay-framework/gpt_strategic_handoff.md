# GPT STRATEGIC HANDOFF
**From**: Outgoing GPT (Phases 1–13)
**To**: Incoming GPT (Phase 14+)

Welcome to OyaPlan. 

You are taking over a product that has just completed its foundational MVP (Phases 1–13). I have acted as the Chief Strategy & Product Advisor, guiding the Founder and Engineering systems from an abstract idea to a polished, conversion-optimized consumer experience.

Here is everything you need to know about the war we've fought so far, and the battles ahead.

## 1. Strategic History & Product Evolution
We started by trying to build an "instant outing generator". Initially, the pitch was speed ("Find a spot in 3 seconds").
We quickly realized that speed is a commodity. Our target demographic (Lagos Gen Z and Millennials) doesn't just want a spot; they want to know *exactly what it costs*. They are terrified of "Lagos billing" (hidden fees, opaque menus, unexpected transport costs).
Therefore, we pivoted our core value proposition to **Total Landed Cost Certainty**. We engineered a system that calculates Food + Activity + Transport for the exact group size.

## 2. Important Founder Decisions
- **Anonymous-First Onboarding**: The Founder agreed that forcing a login wall before generating a plan would kill virality. We engineered an entire Session Identity model to allow users to generate, save, and share plans anonymously.
- **Trust as a Primitive**: The Founder authorized the creation of the `Trust Intelligence` engine. Prices are not just displayed; they are accompanied by a Confidence Score and verification methodology (e.g., "Verified from community receipts").

## 3. Accepted Trade-offs
- **Static Transport Data**: Currently, transport costs are hardcoded JSON matrices between Lagos zones. We accepted this technical debt to ship the MVP faster. 
- **Manual Data Seeding**: We are relying on an ETL script to populate verified venues rather than crowdsourcing them on day one. We need liquidity before we can expect user-generated content.

## 4. Rejected Ideas
- **Direct Database UI Writes**: The Founder proposed having the UI insert directly into the `saved_plans` table. I explicitly blocked this alongside Claude to maintain strict domain boundaries.
- **Abstract Budget Inputs**: We replaced generic "₦15,000" dropdowns with contextual scenarios ("₦25,000 — Dinner for two"). Users couldn't conceptualize raw numbers easily.

## 5. Lessons Learned
- **Empathy in Empty States**: When the database returns 0 plans because a budget is too low, throwing a 404 is bad product design. We learned to explicitly tell the user: *"Your budget is too low for a premium vibe in VI. Here's what that usually costs..."*

## 6. Outstanding Strategic Questions
- **Retention Strategy**: OyaPlan is a high-utility, low-frequency product. If a user only organizes a group outing once a month, how do we keep the app top-of-mind?
- **Data Depreciation**: Inflation in our launch market is volatile. How do we prevent our price data from rotting over a 90-day period?

## 7. Where You Must Challenge Assumptions
- If the Founder suggests building complex "Social Feed" features, challenge them. OyaPlan's virality happens in WhatsApp, not in-app.
- If Engineering suggests slowing down the Forge Generation to fetch live Uber API prices, challenge them. A 90% accurate static estimate delivered instantly is better than a 100% accurate estimate that takes 10 seconds to load and costs us API fees.

## 8. Advice for Maintaining Continuity
Always read `gpt_context_package.md` before approving new features. Treat the North Star metric (`plan_shared`) as a religion. If a feature does not increase the likelihood of a user copying a link and pasting it into their groupchat, it does not get built.

Good luck.
— *Outgoing Chief Strategy & Product Advisor*
