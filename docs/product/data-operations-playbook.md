# OyaPlan — Data Operations Playbook

> **Status:** Approved product source of truth. See `docs/product/README.md` for how this document relates to `CLAUDE.md` and other repository documentation.

## Verification · Freshness · Confidence · Audits

*Consolidated from prior strategy docs — 2026*

This is the operational backbone the whole product depends on: OyaPlan's entire value proposition is cost certainty, and cost certainty is only as good as the data behind it. This document pulls together the verification workflow from the Operations & Growth Roadmap, the data-model fields from the Feature Spec, and the pricing-trust research from the Market Intelligence Report into one operating playbook.

## 1. Verification Process

### 1.1 Weekly Verification Rhythm (carried forward)

| Activity | Details |
|---|---|
| Data Management | Log venue name, area, category, menu prices, and verification dates via internal tools. |
| Weekly Rhythm | Every Friday: call or visit 10–20 venues to confirm and update prices. |
| Validation Logistics | Weekly verification of 10–20 venues; cross-test Danfo/Bolt fares on key Lagos routes. |
| Pilot Program | Execute 10 pilot outings to audit receipts and gather qualitative user feedback. |

### 1.2 Milestone 0.5 Verification Targets (carried forward)
- 100+ venues manually verified.
- 500+ menu items with real-time pricing.
- 200+ transport routes with verified fare ranges.

### 1.3 NEW — Labeling Discipline

From the Market Intelligence Report's pricing-trust research: label discipline is called out explicitly as a trust driver, not just a data hygiene detail.

- Every price shown to a user must be labeled either "Verified" (confirmed by a recent visit or call) or "Estimated" (inferred from older data or category averages) — never presented as an unqualified number.
- Where a price includes a known variable, state it plainly (e.g. "peak hour +20%") rather than showing a flat figure that turns out wrong on the night.

## 2. Freshness Management

Freshness is what keeps "Verified" meaningful over time — a price that was accurate a month ago isn't automatically accurate today.

### 2.1 Data Model Support (from Feature Spec)
- `Venue.last_verified_at` — timestamp of the most recent confirmed price check.
- `Venue.variance_flag` — set automatically when reported actual spend diverges materially from the listed estimate.
- `Venue.verification_method` — manual, crowdsourced, or partner API, so the team knows which venues need active outreach versus which are self-updating.

### 2.2 NEW — Freshness Thresholds

Not explicitly defined in any prior document — proposed here as an operating rule, since 'freshness' was referenced conceptually but never given a concrete threshold.

- Venues unverified for 30+ days are deprioritised in suggestion rankings until re-checked, even if no variance has been reported yet.
- Venues unverified for 60+ days are pulled from active suggestions entirely and routed back into the weekly verification queue.
- High-traffic venues (appearing in the top 20% of generated plans) are re-verified on a tighter cycle than the default weekly rotation, since pricing errors there affect the most users.

## 3. Confidence Scoring (OyaScore Engine)

The user-facing name "OyaScore" and its display format are covered in the Growth Roadmap. This section covers the underlying mechanics — how the score is actually calculated and maintained.

The Market Intelligence Report frames confidence scoring as the core trust mechanism the product needs, combining data freshness with historical accuracy. The components below turn that into an operable model.

### 3.1 Score Inputs
- **Freshness** — how recently the venue's pricing was verified, weighted against the freshness thresholds above.
- **Report volume** — how many users have confirmed actual spend against this venue's estimate; more reports increase confidence, sparse data lowers it regardless of how recent the last check was.
- **Historical accuracy** — this venue's track record of estimates landing within the ±10% North Star band over its reporting history.

### 3.2 NEW — Minimum Data Bar

Proposed operating rule, not present in any prior document.

A venue should not display a confidence percentage at all until it has a minimum baseline of data (e.g. at least one manual verification and a small number of user-reported outcomes) — showing a fabricated-looking "92% confidence" on a venue with a single data point would undermine the exact trust the score is meant to build. Below that bar, show "Estimated — limited data" instead of a percentage.

## 4. Audits & Data Quality Loops

### 4.1 Carried Forward — Accuracy Targets
- Milestone 2 success metric: 20%+ feedback submission rate; median estimate error under 15%.
- North Star metric: percentage of outings where actual spend lands within ±10% of the estimate.
- Post-outing prompt asking the plan creator or any participant to confirm actual spend against the estimate — this is the primary feedback mechanism feeding both the accuracy metric and OyaScore.

### 4.2 NEW — Quarterly Audit Cadence

Not specified in any prior document — the weekly verification rhythm covers routine upkeep, but there was no defined cadence for a deeper structural check.

- Once a quarter, sample a cross-section of "Verified" venues (not just flagged ones) and manually re-confirm pricing, independent of the automated variance-flagging system — this catches slow drift that never crosses the variance threshold on any single check but has accumulated over months.
- Review the accuracy of the confidence-scoring model itself each quarter: are venues with a high OyaScore actually landing within the ±10% band more often than low-scoring venues? If not, the weighting of freshness versus report volume versus historical accuracy needs adjustment.

## 5. Data Governance
- Keep a documented data-retention and privacy policy for phone numbers and location data collected at signup — standard practice, but worth having in writing before scaling past a pilot cohort.
- Treat verification records as an audit trail: every price change should be traceable to who verified it, when, and by what method (manual call, site visit, or crowdsourced report).
