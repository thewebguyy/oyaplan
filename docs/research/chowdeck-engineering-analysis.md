# Reverse-Engineering Investigation: Chowdeck -> OyaPlan Architectural Mapping

**Target**: Chowdeck (`www.chowdeck.com` / `https://chowdeck.com/store`)  
**Implementation Target**: OyaPlan (`c:\Users\PC\Documents\oyaplan`)  
**Tooling**: REA (Reverse Engineering Agent) + AST & Network Probe Suite  
**Status**: Phase 1 & Phase 2 Complete (Initial Journey & Core Modules)

---

## 1. Executive Summary

Chowdeck is an on-demand food, grocery, and courier delivery platform operating across Nigeria (Lagos, Ibadan, Abuja), Ghana, and Côte d'Ivoire.
An investigation of Chowdeck's production frontend (`_next/static/chunks/6117...js`, React Server Components, and API gateway) was conducted to extract transferable architectural patterns for OyaPlan's outing planning and budget predictability engine.

---

## 2. Evidence Register

| Finding ID | Observable Behavior & Evidence Source | Confidence | Transferable Principle | Relevance to OyaPlan |
| :--- | :--- | :--- | :--- | :--- |
| **EVD-01** | **Multi-Component Surcharge & Fee Breakdown**: Module `6165` (`cartless` slice) + Checkout API enforce `Subtotal + Delivery + Service Fee + Packaging - Voucher = Total`. | **CONFIRMED** | Outings and dining in Lagos/West Africa frequently suffer from hidden fees (VAT 7.5%, service charges 10-12.5%, cover fees). Transparent composite pricing eliminates surprise variances. | **HIGH**: Direct upgrade to `varianceEngine.ts` and `candidateEngine.ts` landed cost formula. |
| **EVD-02** | **Step-Based Geocoded Transport Pricing**: Module `33858` declares explicit country registries (`deliveryFeeStep: 700 NGN`). Delivery pricing is quantized into stepped brackets tied to regional geography rather than raw linear distance. | **CONFIRMED** | Transport estimation in Lagos (Uber/Bolt) behaves non-linearly, especially cross-lagoon (Mainland vs Island). Stepped bracket baselines prevent route estimation drop-outs. | **HIGH**: Enhances `TransportEstimate` in `lib/types.ts` when route coordinates are missing or volatile. |
| **EVD-03** | **Locale-Resilient Narrow Currency Formatting**: Module `50566` utilizes `Intl.NumberFormat.formatToParts()` with `currencyDisplay: "narrowSymbol"` and dynamic symbol splicing to guarantee clean rendering without fractional `.00` clutter or encoding corruption. | **CONFIRMED** | Clean monetary representation without encoding crashes (`₦` corrupting to `?` across terminals and SMS/WhatsApp links). | **IMMEDIATE**: Replaces brittle `?${actualTotal.toLocaleString()}` string interpolations across `oyaplan`. |
| **EVD-04** | **Client-Side Telemetry & PII Sanitizer**: Module `6905` implements a deterministic PII stripper scrubbing 20+ sensitive keys (`token`, `auth`, `bvn`, `nin`, `card`, `otp`) and capping serialization depth to 6 with an 8KB ceiling before telemetry export to Honeycomb. | **CONFIRMED** | Outing planning applications handle phone numbers, group attendee details, and spend amounts. Sanitization protects user privacy in Sentry logs. | **MEDIUM**: Enhances Sentry beforeSend middleware in OyaPlan. |
| **EVD-05** | **Draft-Before-Commit State Machine**: Module `6165` separates uncommitted draft adjustments (`setDraft`, `updateDraft`, `clearDraft`) from final committed cart state. | **CONFIRMED** | Allows users to test "what-if" plan modifications (party size, upgrade tiers) without mutating persistent plan records until explicitly confirmed. | **HIGH**: Improves `savePlan.ts` and plan customizer UI. |

---

## 3. Prioritized Findings-to-Implementation Matrix for OyaPlan

| Priority | Feature / Module | OyaPlan Current State | Proposed OyaPlan Improvement | Risk / Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | **Currency & Landed Cost Formatter** (`lib/utils/currency.ts`) | Scattered template literals (`₦` occasionally rendered as `?`) and inconsistent decimal formatting. | Introduce a resilient `formatNaira(amount, options)` utility matching Chowdeck's `formatToParts` pattern, safe against NaN/Infinity and zero-decimal formatted. | Low / Zero Risk |
| **P2** | **Composite Outing Landed-Cost Breakdown** (`lib/trust/varianceEngine.ts` & `lib/planning/candidateEngine.ts`) | Single `price_per_person` + `TransportEstimate`. Often drifts when venues add mandatory service charges or VAT. | Add structured surcharge decomposition: `Base Venue Spend + Mandatory Service Charge (10%) + VAT (7.5%) + Transport Bracket = Total Landed Budget`. | Low / High Impact |
| **P3** | **Transport Stepped Floor & Cross-Water Fallback** (`lib/services/matching/`) | When route data is unavailable, transport defaults or throws `NO_ROUTE_DATA`. | Implement regional fee-step floors (Mainland: ₦1,500-₦3,000, Island: ₦2,500-₦4,500, Cross-water surcharge: ₦3,500+) mirroring Chowdeck's geographic zone step model. | Medium / High Value |
| **P4** | **PII & Telemetry Masking** (`sentry.client.config.ts`) | Default Sentry integration captures breadcrumbs with potential user outing inputs. | Implement localized key redaction (`bvn`, `nin`, `phone`, `auth`, `token`) for outgoing Sentry error events. | Low / Defensive |

---

## 4. Remaining Questions & Investigation Backlog
1. **Interactive Cart Customization**: How does Chowdeck handle required vs optional menu item modifiers when minimum spend thresholds apply?
2. **Dynamic Surge Estimation**: What thresholds trigger Chowdeck's operational surge multiplier during peak rain or traffic periods in Lagos?
