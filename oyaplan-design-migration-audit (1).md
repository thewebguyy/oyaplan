# OyaPlan Design Migration Audit
### Internal document — Creative Director briefing for Design & Engineering
### Sources: Chowdeck (trust/localization/conversion), Linear (dashboard/spacing/typography), Apple (motion/polish/hierarchy)

**Method note:** OyaPlan was inspected live at oyaplan.vercel.app — home, `/explore`, and `/explore/yaba` were fetched and read directly (real copy, real IA, real zone/spot data). Chowdeck was audited from its marketing site + App Store listing (prior report). Linear and Apple references below are drawn from well-documented, widely-known public design conventions (spacing scales, type systems, motion principles) — not scraped — and are flagged as such. No proprietary branding, icons, illustration, or copy from any of the three is to be copied; every recommendation below is a *pattern*, not an asset.

**Baseline finding, stated up front:** OyaPlan's core IA is already directionally correct — it already does geography-first structure (`/explore/[zone]/[area]`), already shows real prices inline, already has a trust line ("Every price checked before it's shown"). The gap is not concept, it's **execution polish**: typography discipline, spacing rhythm, card/visual hierarchy, motion, and the missing connective tissue (search, filters, states, trust depth). This audit is about tightening an already-correct skeleton, not rebuilding it.

---

## How to read this document

Every section follows:
**Current State → Problems → Reference → Why It Works → OyaPlan Implementation → Priority → Complexity → Expected Impact**

Priority: 🔴 P0 (do this sprint) · 🟡 P1 (next sprint) · 🟢 P2 (backlog)
Complexity: ● Low · ●● Medium · ●●● High

---

## 1. Landing Page / Hero

**Current State (Observation).** Headline: "Know exactly where to go, and what it'll really cost." Subhead names the value prop directly. Below: three anonymous avatar glyphs (👤👤👤) + "Every price checked before it's shown" as a trust line. Then "Trending in Lagos this week" as five inline text links, then "Recently planned outings" as three plain text rows with prices.

**Problems.**
- The avatar-glyph trust row (👤👤👤) reads as a social-proof placeholder, not real social proof — no count, no context ("12 squads planned this week"), so it currently signals *nothing*.
- Trending spots and recently-planned outings are unstyled inline links/text — no card structure, no visual hierarchy, no imagery, no price-to-category relationship visible at a glance.
- Two competing CTAs on one page ("Start Planning" in nav + hero, "Plan Now" in nav) — unclear primary action.
- No visual proof-of-mechanism the way Chowdeck shows order-tracking states before download — OyaPlan's whole pitch is "real costs," but the hero doesn't *show* a real cost breakdown, it only claims one exists.

**Reference — Chowdeck.** Chowdeck's homepage shows the actual 4-state order-tracking illustration *before* asking for a download — proof of mechanism over claim of mechanism. Chowdeck also compresses trust into named, specific line items (10%→3% fee, no surge) rather than vague badges.

**Reference — Linear.** Linear's marketing hero uses one crisp headline + one supporting line + a single primary CTA, then immediately drops into a real, high-fidelity product screenshot (not an illustration) — the product *is* the hero image.

**Reference — Apple.** Apple hero sections almost always pair a short headline with immediate, large-scale visual proof (the product itself), and use restrained, single-direction motion (fade/rise on load, no gimmicks) to draw the eye down the page in a fixed order.

**Why these work.** All three converge on the same principle: **claims convert weakly, proof converts strongly.** Chowdeck proves logistics reliability visually; Linear proves product quality by showing the actual UI; Apple proves both simultaneously with cinematic restraint.

**How OyaPlan should implement it — STEAL + INVENT.**
- **STEAL** (from Chowdeck + Linear): Replace the avatar-glyph trust row with a real, specific, numeric line — pull directly from what already exists in your data (e.g., "37 outings planned this week across Lagos" — you already have "Recently planned outings" data, just surface the count).
- **INVENT**: Build a live, real, interactive cost-breakdown card *directly in the hero* — not an illustration, not a claim, an actual mini version of the planner output (e.g., "Yaba → White House + transport = ₦4,200/person") pre-filled with a real spot, rendered as an actual styled card component, not plain text. This is more honest than Chowdeck's illustrated states (which are decorative) and more concrete than Linear's static screenshot (yours can be *live*, since your data already exists).
- **STEAL** (from Linear): One primary CTA only. Kill "Plan Now" from nav or demote it to the same action as "Start Planning" — same href, same label, everywhere.

**Priority:** 🔴 P0
**Complexity:** ●● Medium (mostly component/copy work, no new backend)
**Expected UX Impact:** High — this is the single highest-leverage change; it directly demonstrates the product's core promise instead of asserting it.

**Tailwind/React sketch:**
```tsx
// HeroProofCard.tsx — real data, styled as a first-class component, not inline text
<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm
                 flex flex-col gap-3 max-w-sm">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-neutral-500">Yaba · Squad of 3</span>
    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
      Price checked today
    </span>
  </div>
  <p className="text-lg font-semibold text-neutral-900">White House + transport</p>
  <p className="text-2xl font-bold text-neutral-900">₦4,200<span className="text-sm font-normal text-neutral-500">/person</span></p>
</div>
```

---

## 2. Navigation

**Current State.** Header: logo + "Lagos Squad Planner" tagline, then "Start Planning" / "Explore" / (on subpages) "List Your Spot" / "Plan Now". Inconsistent CTA labeling across pages (home shows "Start Planning" twice; explore shows "Plan" + "Plan Now").

**Problems.** Redundant/inconsistent CTA copy across routes (Start Planning / Plan / Plan Now — three labels for what appears to be one action). No visible active-state indication for current section. No mobile nav pattern observable (hamburger/drawer not confirmed).

**Reference — Chowdeck.** Two-axis nav: identity-first primary items (Company/Vendors/Riders) + a grouped "Products" dropdown for features, kept short despite 6+ products.

**Reference — Linear.** Extremely minimal top nav — logo, 3–4 items max, one CTA, generous horizontal padding, no visual clutter.

**Why it works.** Fewer, consistently-labeled actions reduce decision fatigue and reinforce a single mental model of "what does this button do," which matters more than usual for OyaPlan since the entire product *is* one action (plan an outing).

**OyaPlan Implementation — STEAL.**
- Standardize on **one CTA label** everywhere ("Plan an outing" or similar), same route, same styling, in every nav instance.
- Keep nav to 3 items max: **Plan · Explore · List a Spot**, matching Chowdeck's short-top-nav discipline.
- Add an active-route underline/pill state (Linear-style: subtle background pill on the current section, not a heavy underline).

**Priority:** 🔴 P0 · **Complexity:** ● Low · **Impact:** Medium (removes confusion, cheap to fix)

---

## 3. Information Architecture

**Current State (Observation — this is a genuine strength).** OyaPlan already runs geography-first IA nearly identical in structure to what a mature delivery platform uses: `/explore` (zone list: Central, Island, Mainland, Waterfront, each with area/spot counts) → `/explore/[area]` (spot list with category, location, avg price/person, "Plan around this" deep link back into the planner pre-filled with `startArea` + `pinnedSpotId`).

**Problems.** No breadcrumb trail on area pages (just "Back to Zones" — a single backward link, not a full path). No cross-links between zones (e.g., no "nearby areas" suggestion on a spot-sparse page like Waterfront, which currently has only 1 area / 1 active spot). No visible category filter within an area page — spots are shown in a flat list regardless of type (nature/restaurant/bar/entertainment mixed together).

**Reference — Chowdeck.** `/store/[city]/restaurants/[slug]` + SEO footer link farm of cuisine × city × vendor. Same shape as OyaPlan's zone→area→spot, but Chowdeck adds category-crossed SEO surfaces (cuisine-near-me pages) that OyaPlan doesn't yet have (e.g., "Budget outings in Lagos," "Rooftop bars in Lagos Island").

**Why it works.** Geography-first IA matches the actual mental model of the user ("what's near me / where I'm going") while category-crossed SEO pages capture a *second* mental model ("what kind of thing do I want") without restructuring the primary IA.

**OyaPlan Implementation.**
- **STEAL**: Full breadcrumb (`Explore / Lagos Mainland / Yaba`) on every area page — cheap, immediately improves orientation and SEO.
- **STEAL**: Chowdeck's SEO footer-link-farm pattern — add a footer block of category × price-band × zone combinations ("Budget outings under ₦5k," "Date spots on Lagos Island," "Family outings in Lagos Mainland") each linking to a filtered explore view.
- **ADAPT**: Chowdeck's flat vendor list works because restaurants are inherently comparable; OyaPlan mixes categories (nature/restaurant/bar/entertainment) in one list, which Chowdeck doesn't have to solve. Add lightweight category chips/filter pills at the top of each area page — this is a genuinely different problem than Chowdeck's, not a direct copy.

**Priority:** 🟡 P1 (breadcrumbs 🔴 P0, they're trivial) · **Complexity:** ● Low–●● Medium · **Impact:** High for SEO/discoverability, Medium for immediate UX

---

## 4. Cards, Typography, Grid, Spacing, Color, Visual Hierarchy

*(Grouped — these are one visual-system problem, not five separate ones.)*

**Current State.** Spot listings ("Unilag Lagoon Front — nature — Unilag, Yaba — Avg ₦500/person") render as plain sequential text blocks, not cards. No visible typographic scale distinction between a spot name, its category tag, its location, and its price — everything reads at similar visual weight in the raw markup. Theme color is a single green (`#008751` — notably, this is literally the Nigerian flag green, a strong, correct localization signal, similar spirit to Chowdeck's Pidgin/Yoruba/Igbo/Hausa hero).

**Problems.** No card container = no scannability. No type-scale hierarchy = price (the single most important data point on the whole product) doesn't visually dominate. No consistent spacing rhythm observable between list items. Category ("nature," "restaurant," "bar") has no visual treatment (color-coding, icon, or badge) to enable fast pattern-matching when scanning a list of 5+ mixed-category spots.

**Reference — Linear.** Linear's core discipline: a strict type scale (roughly 12/14/16/20/24/32px steps), a consistent 4px/8px spacing base unit, and near-monochrome UI with **one** accent color reserved for interactive/important elements only. Cards have a single consistent border-radius and border treatment throughout the entire product, no exceptions.

**Reference — Apple.** Apple's hierarchy discipline: price and the single most important fact are always the largest, boldest element on a card; everything else (location, category) is secondary, smaller, and lower-contrast gray — never competing with the primary number.

**Reference — Chowdeck.** Warm, high-contrast accent (red/orange) used sparingly for CTAs and status; illustrated category icons for fast pattern recognition across mixed content types.

**OyaPlan Implementation.**
- **STEAL (Linear)**: Define and lock a type scale now, before more screens get built. Suggested:

| Token | Size | Weight | Usage |
|---|---|---|---|
| `text-xs` | 12px | 500 | category tags, metadata |
| `text-sm` | 14px | 400–500 | location, secondary copy |
| `text-base` | 16px | 400 | body |
| `text-lg` | 18px | 600 | spot name |
| `text-2xl` | 24px | 700 | price (per card) |
| `text-4xl`–`5xl` | 36–48px | 700–800 | hero headline |

- **STEAL (Linear)**: 4px base spacing unit — `gap-1 (4px) / gap-2 (8px) / gap-4 (16px) / gap-6 (24px) / gap-8 (32px)` — apply consistently to card padding, list gaps, and section spacing. No arbitrary values.
- **STEAL (Apple)**: Price is always the largest, boldest number on any card. Non-negotiable rule for every card variant.
- **ADAPT (Chowdeck)**: Keep the green (`#008751`) as the single accent — it's already correctly localized (Nigerian flag green vs. Chowdeck's red) — but use it *only* for CTAs, active states, and the "price checked" trust badge, never for decorative fills. Use small colored category dots/badges (not full illustration) for nature/restaurant/bar/entertainment — cheaper to build and maintain than Chowdeck's bespoke illustration system, and more consistent with a Linear-style restrained palette.
- **AVOID**: Don't adopt Chowdeck's illustration-heavy visual style wholesale — it doesn't fit a Linear/Apple-influenced restrained aesthetic and is expensive to produce and maintain at OyaPlan's stage.

**Card component sketch:**
```tsx
<article className="rounded-xl border border-neutral-200 bg-white p-4 flex flex-col gap-2
                     hover:border-neutral-300 hover:shadow-sm transition-all duration-150">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-neutral-900">{spot.name}</h3>
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
      {spot.category}
    </span>
  </div>
  <p className="text-sm text-neutral-500">{spot.location}</p>
  <p className="text-2xl font-bold text-neutral-900">
    ₦{spot.avgPrice.toLocaleString()}
    <span className="text-sm font-normal text-neutral-500">/person</span>
  </p>
  <button className="mt-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 self-start">
    Plan around this →
  </button>
</article>
```

**Priority:** 🔴 P0 (this underlies almost every other visual problem) · **Complexity:** ●● Medium · **Impact:** Very High — this single change (real cards + type scale) will do more for "polish" than any other item in this document.

---

## 5. Buttons, Forms, Search, Filters

**Current State.** Primary actions observed are text links ("Plan around this," "Start Planning," "Know a spot that should be here? Suggest it →") — no distinct visual button component observed in the fetched markup (may exist in actual rendered CSS, but no button-like styling signal present in structure). No search bar observed anywhere. No filter/sort controls on any explore page.

**Problems.** No way to search for a spot by name directly — user must know which zone to browse into. No price-band filter, no category filter, no sort (cheapest first / trending / nearest) on area pages, which will become a real usability problem once any area exceeds ~10 spots.

**Reference — Linear.** Command-palette-style search (⌘K) as the primary discovery mechanism, paired with minimal, high-contrast filter chips (not dropdowns) for narrowing results — filters are visually part of the results view, not hidden in a separate control panel.

**Reference — Chowdeck.** Cuisine-based filtering via dedicated SEO pages rather than in-app filter UI (a content strategy, not an interaction pattern) — less directly useful here since it solves discovery via URLs, not UI controls.

**OyaPlan Implementation.**
- **STEAL (Linear)**: A single search input at the top of `/explore` that matches on spot name, area, or category — simple substring match is enough at current data scale, no need for a search backend yet.
- **STEAL (Linear)**: Filter chips (not dropdowns) directly above the spot list: category chips (Nature / Restaurant / Bar / Entertainment) + a price-band toggle (Budget / Mid / Premium). Selecting a chip filters in place, no page reload.
- **INVENT**: Neither product solves "plan for a group with mixed budgets" well. Propose a **squad budget slider** on the planner itself — input a per-person budget ceiling, and the planner filters/ranks spot combinations that fit, showing "fits your budget" badges. This is a genuinely novel mechanism suited to OyaPlan's squad-planning premise that neither Chowdeck (single-order) nor Linear (not a commerce product) has any equivalent for.

**Priority:** Search + filters: 🟡 P1 · Budget slider: 🟢 P2 (bigger feature, needs its own spec)
**Complexity:** Search/filters ●● Medium (client-side only at current scale) · Budget slider ●●● High
**Impact:** High once spot count grows past ~15–20 per area; currently Medium given small dataset.

---

## 6. Empty States, Error States, Skeleton Loaders

**Current State.** One real empty-ish state observed: Lagos Waterfront zone shows "1 areas... 1 active spots" — a low-inventory state rendered as plain descriptive text, not a designed empty/sparse state. No loading skeletons observed in static HTML (expected, since these are client-rendered — but worth flagging that none of the three fetched pages showed any skeleton markup, suggesting this may not be built yet).

**Problems.** A zone with 1 spot reads as thin/unfinished rather than intentional — no framing like "New zone, more spots coming" or a CTA to fill the gap. No confirmed error-state pattern for e.g. a bad `/explore/[area]` slug.

**Reference — Apple.** Apple's empty states are never apologetic or dead-feeling — they use the empty state as an opportunity (e.g., an empty Photos library still shows a clear, single-action prompt, not a sad illustration alone).

**Reference — Chowdeck.** "No stories at the moment, check again later!" — functional but flat; not a strong reference here either. This is actually a gap in *both* reference products.

**OyaPlan Implementation — mostly INVENT.**
- **INVENT**: For sparse zones (Waterfront's 1-spot case), reframe as opportunity, not deficiency: "Lagos Waterfront is just getting started — 1 spot live, more on the way. Know a beach or resort we're missing?" with the existing "Suggest a spot" CTA surfaced directly in the empty state (you already have this route — `/suggest-a-spot` — just isn't connected to the empty state yet).
- **STEAL (general UX best practice, not from either brand specifically)**: skeleton loaders should mirror the exact shape of the final card (same border-radius, same height, gray pulse blocks matching where name/price/category will render) — never a generic spinner, since layout-matching skeletons reduce perceived load time more than spinners do.
- **INVENT**: A distinct "price unverified" state — since OyaPlan's whole trust claim is "every price checked before it's shown," you need an explicit, honest state for the (presumably rare) case a price hasn't been checked recently, rather than silently showing stale data. Neither Chowdeck nor Linear needs this — it's unique to OyaPlan's specific trust promise, and handling it visibly (small "price last checked 3 days ago" tag) makes the trust claim credible rather than just asserted.

**Priority:** 🟡 P1 · **Complexity:** ● Low (empty states) – ●● Medium (skeleton system) · **Impact:** Medium, but high for trust credibility specifically (the "price unverified" state).

---

## 7. Trust Signals & Social Proof

**Current State.** One trust line: "Every price checked before it's shown." Anonymous avatar glyphs with no numbers attached. "Recently planned outings" list (3 real examples with real prices) functions as implicit social proof but isn't framed as such.

**Problems.** The single strongest trust asset OyaPlan has (real, specific, recent outing data) is currently presented as a flat list, not leveraged as social proof. No explanation of *how* prices are checked (manually? scraped? user-submitted?) — the claim is strong but unsubstantiated.

**Reference — Chowdeck.** Names the exact mechanism and number for every trust claim (10% vs 3% fee, no surge, free delivery over ₦3,000) — specificity is the entire trust strategy.

**Why it works.** Vague trust claims ("checked," "verified," "trusted") are ignorable; specific, falsifiable claims ("checked within the last 7 days," "37 squads planned this week") are credible because they could be wrong and aren't.

**OyaPlan Implementation — STEAL, directly.**
- Replace "Every price checked before it's shown" with a specific mechanism line: e.g., "Prices re-verified every [X days] by our Lagos team" or similar — whatever is actually true. Specificity over polish.
- Turn "Recently planned outings" into a live-feeling social proof strip with a real count header: "37 squads planned an outing this week" (using real aggregate data you already have, per the earlier hero recommendation).
- **AVOID**: Don't add fake review stars or fabricated testimonial quotes to manufacture social proof — Chowdeck itself doesn't do this on its marketing site, and it would undermine the "real, checked, honest pricing" brand promise if the social proof itself weren't equally real.

**Priority:** 🔴 P0 · **Complexity:** ● Low · **Impact:** High — cheap, and directly reinforces the core brand promise.

---

## 8. Pricing Page

**Current State.** OyaPlan currently has no pricing page — the product is free/consumer-facing with no visible monetization surface in the fetched routes (`list-your-spot` and `suggest-a-spot` suggest a future vendor-side monetization path, not a consumer subscription yet).

**Reference — Chowdeck (Chowpass).** Three-tier subscription (Monthly/Quarterly/Bi-Annual) anchored with a "Popular" badge and escalating "Save ₦X" framing; every benefit is a named, specific fee reduction, not a vague perk.

**OyaPlan Implementation — INVENT (this doesn't exist yet, and Chowdeck's B2C subscription model doesn't map directly).**
- OyaPlan's monetizable surface is more naturally **two-sided** (venues paying to be listed/featured — see `list-your-spot`) rather than consumer subscription, at least at this stage. Directly copying Chowpass would be premature.
- **ADAPT** the anchoring/specificity *pattern* (not the tier structure) for a future venue-side pricing page: three tiers (Basic listing free / Featured listing paid / Sponsored placement paid), each benefit stated as a specific, falsifiable claim ("Appear in top 3 of your zone," "Included in weekly trending digest") rather than vague ("more visibility").
- Hold consumer-side monetization (an eventual "OyaPlan Plus" for e.g. saved plans, group polls, or priority support) until usage data justifies it — premature pricing pages are a common early-stage trust-eroding move worth explicitly avoiding.

**Priority:** 🟢 P2 (not urgent — no product yet to price) · **Complexity:** ●● Medium once scoped · **Impact:** Deferred

---

## 9. Motion, Animation, Hover Effects, Microinteractions

**Current State.** No motion system observable from static HTML (expected — this requires live rendering to assess). Flagging this as an unknown, not a confirmed absence.

**Reference — Apple.** Apple's motion language: **short duration (150–300ms), consistent easing (ease-out on enter, ease-in on exit), motion always has a clear origin/destination** (elements grow from where they were tapped, not fade in from nowhere), and motion is used to clarify state change, never as decoration.

**Reference — Linear.** Near-instant micro-interactions (hover states under 100ms), subtle scale/opacity shifts on interactive elements, and a strict rule against motion that delays the user from acting (no unnecessary entrance animations blocking interaction).

**Reference — Chowdeck.** Illustration-driven looping carousels (order-tracking states) — more decorative, less about interface feedback.

**OyaPlan Implementation — STEAL (Apple + Linear), AVOID (Chowdeck's decorative-loop style).**
- **Motion principles to lock as a written rule set:**
  1. All interactive-element transitions: 120–180ms, `ease-out`.
  2. Card hover: `translateY(-2px)` + shadow increase only — no scale, no color shift beyond border.
  3. Page-level entrances: single, restrained fade+rise (`opacity 0→1`, `translateY(8px→0)`), 200ms, staggered by ≤40ms per item for lists — never more.
  4. No looping/decorative animation anywhere in-product (reserve for marketing page only, sparingly, and even there prefer Apple's restraint over Chowdeck's illustrated loops).
  5. Respect `prefers-reduced-motion` — disable translate/scale, keep opacity-only fallback.

```css
/* Tailwind config extension */
transitionDuration: { '150': '150ms' }
transitionTimingFunction: { 'oyaplan-out': 'cubic-bezier(0.16, 1, 0.3, 1)' }
```
```tsx
// Card hover, Framer Motion
<motion.article
  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
>
```

**Priority:** 🟡 P1 · **Complexity:** ● Low (Tailwind/Framer Motion config, no architecture change) · **Impact:** Medium-High for perceived polish specifically — this is the fastest way to make OyaPlan *feel* like Linear/Apple without a redesign.

---

## 10. Dashboard / Planner Result View

**Current State.** Not directly observable from the routes fetched (the actual generated-plan output view wasn't in the crawlable HTML — likely a client-side state, not a separate URL). Inferred to exist from "Plan around this" deep links and "Recently planned outings" data.

**Reference — Linear.** Dense-but-legible information layout: left-aligned labels, right-aligned or strongly right-weighted numeric values, generous row height (36–44px) even in dense views, and a consistent grid so scanning down a column of prices is effortless.

**OyaPlan Implementation — STEAL.**
- Structure the plan-result view as a **receipt-like summary**: each line item (venue, transport leg, extras) left-aligned with its label, price right-aligned in the same bold weight/size across all rows (Linear's "numbers align, always" discipline), with a clearly separated, larger total row at the bottom — same principle as any well-built checkout summary, reinforced by Apple's "the most important number is the biggest" rule.
- Keep the WhatsApp-share action (implied by "One tap to copy a complete Lagos plan to WhatsApp" in the meta description) as the single primary CTA on this screen — this is already a strong, correctly-localized mechanic (WhatsApp is the dominant sharing surface in Lagos) and should not be diluted with secondary actions competing for attention.

**Priority:** 🔴 P0 (this is likely the actual core product moment) · **Complexity:** ●● Medium · **Impact:** Very High — recommend a dedicated follow-up audit once this view can be directly inspected.

---

## 11. Mobile UX & Responsive Behavior

**Current State.** Viewport meta correctly set (`width=device-width, initial-scale=1`); no other mobile-specific signal observable from fetched HTML.

**Reference — Chowdeck.** `maximum-scale=5` allowance on the transactional app — a deliberate choice to not block pinch-zoom, which is a real accessibility consideration many apps get wrong.

**OyaPlan Implementation — STEAL.**
- Do not set `maximum-scale=1` or `user-scalable=no` anywhere — preserve pinch-zoom for low-vision users, matching Chowdeck's (correct) choice.
- Given the WhatsApp-share core action and Lagos mobile-data context, prioritize a lightweight, low-KB mobile bundle for the plan-result view specifically — this is the screen most likely to be shared and opened cold on a stranger's phone via a WhatsApp link, so first-load performance there matters more than anywhere else in the product.

**Priority:** 🔴 P0 (viewport policy) / 🟡 P1 (perf budget) · **Complexity:** ● Low · **Impact:** Medium-High given WhatsApp-native distribution model.

---

## 12. Accessibility

**Current State.** Cannot fully assess without rendered DOM/ARIA inspection; flagging as unknown rather than asserting a grade.

**Reference — Apple.** Apple's baseline: 4.5:1 text contrast minimum, all interactive elements keyboard-reachable in logical order, motion respects `prefers-reduced-motion`, touch targets ≥44×44px.

**OyaPlan Implementation — STEAL (as a checklist, not optional).**
- Lock a minimum bar now, before more screens ship: 4.5:1 contrast for all body text against the white/neutral background, 44px minimum tap target for all "Plan around this" / filter-chip / CTA elements, visible focus rings (not just hover states) on every interactive element, and full keyboard navigability through the explore → area → plan flow.
- Given the single green accent (`#008751`) is being used for both category badges and CTAs, verify it meets contrast on white at whatever weight/size it's rendered at — if not, use a darker shade for text-on-white contexts and reserve the brighter green for fills only.

**Priority:** 🟡 P1 · **Complexity:** ● Low–●● Medium · **Impact:** Medium, compounding (cheap now, expensive to retrofit later).

---

## 13. Design Tokens — Recommended Starting Set

*(A locked-down v1 token set, synthesizing Linear's restraint + Apple's hierarchy discipline + OyaPlan's already-correct green.)*

| Category | Token | Value |
|---|---|---|
| Color — brand | `--color-primary` | `#008751` (keep — correct localization) |
| Color — primary text | `--color-text` | `#171717` |
| Color — secondary text | `--color-text-muted` | `#737373` |
| Color — border | `--color-border` | `#E5E5E5` |
| Color — surface | `--color-surface` | `#FFFFFF` |
| Color — surface-subtle | `--color-surface-muted` | `#FAFAFA` |
| Radius | `--radius-card` | `12px` |
| Radius | `--radius-pill` | `9999px` |
| Spacing base | `--space-unit` | `4px` (scale: 4/8/12/16/24/32/48) |
| Type — body | `--font-body` | 16px / 400 / 1.5 line-height |
| Type — price | `--font-price` | 24px / 700 / 1.2 line-height |
| Motion — duration | `--duration-fast` | 150ms |
| Motion — easing | `--ease-standard` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Shadow — card | `--shadow-card` | `0 1px 2px rgba(0,0,0,0.04)` |
| Shadow — card-hover | `--shadow-card-hover` | `0 4px 12px rgba(0,0,0,0.06)` |

---

## 14. Master Classification Summary

| Area | Classification | One-line rationale |
|---|---|---|
| Hero proof-of-mechanism | STEAL + INVENT | Show real cost card, not illustration or claim |
| Nav CTA consistency | STEAL (Linear) | One label, one action, everywhere |
| Breadcrumbs / SEO footer | STEAL (Chowdeck) | Cheap, high SEO/orientation value |
| Category filtering within area | ADAPT | Chowdeck doesn't need this; OyaPlan's mixed categories do |
| Card system + type scale | STEAL (Linear) | Highest-leverage visual fix available |
| Illustration-heavy visual style | AVOID (Chowdeck) | Wrong fit for Linear/Apple-restrained direction, costly to maintain |
| Search + filter chips | STEAL (Linear) | Needed once spot count grows |
| Squad budget slider | INVENT | Neither reference product solves group-budget planning |
| Empty states as opportunity | INVENT (loosely Apple-inspired) | Both references are weak here |
| "Price unverified" state | INVENT | Unique to OyaPlan's specific trust claim |
| Trust line specificity | STEAL (Chowdeck) | Specific > vague, directly transferable |
| Fake reviews/testimonials | AVOID | Undermines the honest-pricing brand promise |
| Consumer subscription tier now | AVOID (premature) | No product yet to price; revisit post-traction |
| Venue-side tiered listing pricing | ADAPT (Chowpass pattern) | Right shape, different audience (B2B not B2C) |
| Motion system (duration/easing) | STEAL (Apple + Linear) | Cheapest, fastest "feels polished" win available |
| Decorative looping animation | AVOID (Chowdeck) | Doesn't fit restrained motion language |
| Receipt-style plan summary | STEAL (Linear) | Numbers-align discipline directly applicable |
| WhatsApp single-CTA share | STEAL (already present) | Already correctly localized, don't dilute it |
| Pinch-zoom allowed | STEAL (Chowdeck) | Correct accessibility default |
| Accessibility baseline checklist | STEAL (Apple) | Cheap now, expensive later |

---

## 15. Sprint-Level Execution Plan

**Sprint 1 (P0 cluster — visual credibility):**
Card system + locked type scale/spacing tokens → real hero proof card → trust-line specificity → nav CTA consolidation → breadcrumbs.

**Sprint 2 (P0/P1 — core moment + motion):**
Plan-result "receipt" view polish → motion system (durations/easing/hover) → mobile perf budget for the share-result screen → accessibility baseline pass.

**Sprint 3 (P1 — growth surfaces):**
Search + filter chips on explore/area pages → SEO footer link farm (category × price-band × zone) → empty-state reframing + suggest-a-spot linkage → "price last verified" tag.

**Backlog (P2 — needs more product definition first):**
Squad budget slider → venue-side tiered pricing page → any consumer monetization surface.

---

## 16. The Synthesis — What "Best Version of OyaPlan" Looks Like

Pulling the three influences into one sentence each, as the guiding brief for every future design decision:

- **From Chowdeck:** trust is built through *specific, falsifiable claims* (fee %, verification cadence, real counts) — never vague badges — and localization is a first-class design decision (language, currency, WhatsApp-native sharing), not an afterthought.
- **From Linear:** visual system discipline — one locked type scale, one 4px spacing unit, one accent color reserved for meaning (not decoration), numbers always aligned and always the visual anchor of any row or card.
- **From Apple:** motion exists only to clarify state, never to decorate; hierarchy is ruthless — the single most important number on any screen is always the largest, boldest element; empty and error states are opportunities to guide, not apologies.

OyaPlan's differentiated core — real, checked, squad-relevant Lagos pricing, shared instantly to WhatsApp — is already sound and already better-localized than either reference product for its specific use case. The migration work above is entirely about **execution discipline**, not concept validation: tighten the type/spacing/card system (Linear), make trust claims specific and motion purposeful (Chowdeck + Apple), and invent the two or three mechanisms (budget slider, price-freshness state, opportunity-framed empty states) that neither reference product has ever had to solve because neither one does squad-based, cost-transparent outing planning.
