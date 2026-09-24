# OyaPlan Design System & Visual Constitution (2026)

> **Document Status:** Approved Design System Specification  
> **Brand Color Invariant:** `#008751` (OyaPlan Green)  
> **Typography System:** Disciplined Editorial Hierarchy  
> **Target Form Factors:** Mobile First (360px, 390px, 412px) $\rightarrow$ Tablet $\rightarrow$ Desktop  

---

## 1. Brand Philosophy & Identity

### 1.1 Core Mission
OyaPlan delivers **Budget Confidence through planning.**  
Primary user outcome: **"Know what I'll probably spend before I leave home."**

### 1.2 The Core Visual Object
The core visual object of OyaPlan is **the Decision**, not the venue card.
* **Bad**: A photo, venue name, 4 star icons, and a "View" button.
* **Good**: An outing proposal showing what you get, what it will cost (food + transport + VAT/service), whether it fits your budget, how recently prices were confirmed, and a one-tap WhatsApp share.

### 1.3 Localization & Lagos Character
* **Lagos Native, Not a Tourist Poster**: Lagos presence is felt through authentic geography (Admiralty Way, Isaac John, Sabo, Adeola Odeku), realistic peak-hour traffic buffers, real Naira prices with VAT/service charge factored in, and familiar Nigerian social dynamics ("wahala-free outings").
* **Restraint**: No cartoonish danfo illustrations in every corner, no flag banners on every header, no forced slang in instructional copy. Speak with the warmth and wit of an informed Lagos friend.

---

## 2. Color Palette & Semantics

### 2.1 The Non-Negotiable Brand Anchor
* **OyaPlan Green**: `#008751` (HSL: 156°, 100%, 26%)
  * **Role**: Primary brand identity, primary call-to-action buttons, verified status dots, within-budget affirmations.
  * **Rule**: Never replace it, never shift hue toward teal or olive, never use gradients over it.

### 2.2 Supporting Palette (Lagos Editorial)
* **Midnight Lagoon**: `#010528` (HSL: 236°, 95%, 8%)
  * **Role**: High-contrast editorial headers, primary text, dark anchor surfaces (Footer, Plan Dossier headers).
* **White Sand (Base Background)**: `#FAFAF8` (HSL: 60°, 10%, 98%)
  * **Role**: Default application background. Warm, natural, easy on eyes in bright Lagos sunlight.
* **Warm Canvas**: `#FAF7F2` (HSL: 38°, 33%, 97%)
  * **Role**: Secondary surfaces, grouped cards, subtle panel highlights.
* **Lagos Clay / Warm Border**: `#EAE4DC` (HSL: 34°, 22%, 89%)
  * **Role**: Defined structural borders, separators, subtle container outlines.
* **Lagos Earth / Deep Ochre**: `#7A3E1D` (HSL: 21°, 61%, 30%)
  * **Role**: Muted tags, occasion labels, operational badges, warm contrast accents.
* **Lasgidi Accent Yellow**: `#F6C642` (HSL: 44°, 91%, 61%)
  * **Role**: Sparse, high-energy accents (Editor's picks, celebratory moments). Never used for primary text.

### 2.3 Semantic States
* **Verified / Confirmed**: `#008751` (Background: `#EAFDF3`, Border: `#A3F3C6`)
* **Estimated / Needs Review**: `#D97706` (Amber-600) (Background: `#FEF3C7`, Border: `#FDE68A`)
* **Over Budget / Danger**: `#DC2626` (Red-600) (Background: `#FEF2F2`, Border: `#FECACA`)
* **Muted / Inactive**: Text: `#6B7280`, Border: `#E5E7EB`

---

## 3. Typography & Hierarchy

### 3.1 Scale & Tokens
| Token | Size | Line Height | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| `type-display` | 32px (sm) / 44px (lg) | 1.1 | 900 / Black | -0.03em | Major page headlines, Hero statements |
| `type-heading` | 22px (sm) / 28px (lg) | 1.2 | 800 / Extrabold | -0.02em | Section titles, decision headers, venue names |
| `type-subheading` | 16px (sm) / 18px (lg) | 1.35 | 700 / Bold | -0.01em | Subsection titles, card headers |
| `type-price-lg` | 28px (sm) / 36px (lg) | 1.0 | 900 / Black | -0.02em | Total budget numbers, total spend |
| `type-price-md` | 18px (sm) / 22px (lg) | 1.1 | 800 / Extrabold | -0.01em | Per-person prices, stop allocations |
| `type-body` | 14px (sm) / 16px (lg) | 1.55 | 400 / Regular | normal | Explanations, review notes, guidance |
| `type-caption` | 12px | 1.4 | 500 / Medium | normal | Secondary metadata, dates, addresses |
| `type-label` | 11px | 1.2 | 800 / Extrabold | 0.08em | Eyebrows, category tags, step indicators (uppercase) |

### 3.2 Rules of Typographic Structure
1. **Never rely on cards alone for hierarchy**: Use size, weight, and color contrast to guide the eye.
2. **Numbers Are Scannable**: Naira amounts (`₦`) are always formatted with commas (`₦27,800`) and rendered with bold monospace or heavy sans numerals.
3. **No Decorative Font Clutter**: Keep to one clean, modern sans typeface (Inter / Outfit) with strict weight disciplines (400, 600, 700, 900).

---

## 4. Spacing, Borders & Radius Scale

### 4.1 Strict Spacing Grid (8pt System)
* `2px` (`0.5`), `4px` (`1`), `8px` (`2`), `12px` (`3`), `16px` (`4`), `24px` (`6`), `32px` (`8`), `48px` (`12`), `64px` (`16`).
* **Container Gutters**: Mobile: `16px` (`px-4`); Tablet/Desktop: `24px` (`px-6`).
* **Section Gap**: Mobile: `32px` (`space-y-8`); Desktop: `48px` (`space-y-12`).

### 4.2 Radius Hierarchy
Do **not** apply `rounded-2xl` to everything. Use strict physical levels:
* **Micro Elements (Pills, Chips, Tags, Badges)**: `rounded-full` or `rounded-lg` (8px).
* **Interactive Controls (Inputs, Buttons, Dropdowns)**: `rounded-xl` (12px).
* **Cards & Containers (Decision cards, Review sections)**: `rounded-2xl` (16px) or `rounded-3xl` (24px).
* **Modal Sheets & Overlays**: `rounded-t-[28px]` or `rounded-[28px]`.

### 4.3 Elevation & Shadows
* Prefer subtle structural borders (`border border-border-default` or `border border-lagos-warm-border`) over floating dropshadows.
* **`shadow-xs`**: `0 1px 2px 0 rgb(0 0 0 / 0.04)` for subtle separation.
* **`shadow-card`**: `0 4px 12px -2px rgba(1, 5, 40, 0.06)` for decision cards on hover.
* **`shadow-elevated`**: `0 16px 32px -8px rgba(1, 5, 40, 0.12)` for sticky action bars and modals.

---

## 5. Core Components

### 5.1 `OyaPrice`
* Formats integer amounts into clean Naira values with per-person / squad context.
* Supports visual budget states: `within_budget` (green), `over_budget` (red), `neutral` (midnight).

### 5.2 `OyaBudgetBreakdown`
* Displays the complete financial picture in a compact ledger:
  * Food & Drinks
  * Leg-to-leg Transport (Bolt / zone fare)
  * VAT & Service buffer (7.5% + 10%)
  * Total & Budget remaining

### 5.3 `OyaTrustIndicator`
* Three standardized formats:
  * **Verified**: Green dot + *"Verified 3 days ago"*
  * **Estimated**: Amber dot + *"Estimated · menu review pending"*
  * **Operator**: Green shield + *"Operator confirmed"*

### 5.4 `OyaDecisionCard`
* Combines authentic photography with the complete outing brief.
* Highlights squad size, occasion, cost ledger, verified status, and a primary action button ("Lock In Plan", "View Details", "Share").

### 5.5 `OyaHoursEditor`
* Comprehensive 7-day schedule editor for operators.
* Features quick presets ("Standard Evenings", "Weekend Only", "Daily 12pm-11pm") and custom time pickers per day.

---

## 6. Photography & Imagery Standard

1. **Authentic Lagos Reality**: Prefer natural lighting, real dining tables, bustling outdoor terraces, Lagos waterfronts, and genuine ambience.
2. **Standardized Aspect Ratios**:
   * Hero / Detail View: `16:9` or `21:9` wide cover.
   * Decision Cards / Feed: `4:3` or `16:10` framed container.
   * Gallery Grid: `1:1` square or `4:5` vertical portrait.
3. **No Heavy Tinting**: Avoid heavy dark overlay gradients that muddy the photos. Use clean bottom gradients only when text directly overlays the image.

---

## 7. Motion & Interaction Standards

* **Timing**:
  * Micro-interactions (hover, tap feedback): `120ms` ease-out.
  * Card expansions & tab switches: `200ms` cubic-bezier(0.25, 1, 0.5, 1).
  * Modal/Sheet entrance: `300ms` cubic-bezier(0.16, 1, 0.3, 1).
* **Tactile Feedback**:
  * Tap feedback class: `.tap-feedback` (`active:scale-[0.98] transition-transform duration-150`).
  * Respect user preference: `@media (prefers-reduced-motion: reduce) { transform: none; }`.

---

## 8. Mobile Responsiveness Standards

| Breakpoint | Typical Device | Design Priority |
|---|---|---|
| **360px** | Small Android (Samsung Galaxy A series, budget devices) | Full-width buttons, compact font scales, single-column layouts, strict 12px gutters. |
| **390px** | Modern iPhone (iPhone 13/14/15/16) | Standard base design, 16px gutters, sticky thumb-friendly CTA. |
| **412px** | Modern Large Android (Google Pixel, Galaxy Plus/Ultra) | Comfortable padding, high tap targets (min 48px). |
| **768px** | iPad / Tablet | 2-column decision grids, split input panels. |
| **1024px+** | Desktop / Laptop | Max-width content containers (`max-w-4xl` / `max-w-5xl`), side-by-side ledgers. |

---

## 9. Visual Do's & Don'ts

| Do | Don't |
|---|---|
| Use `#008751` as the primary action and verification anchor | Don't invent secondary shades of green or replace it with teal/olive |
| Show total estimated spend with itemized transparency | Don't hide transport or mandatory fees in fine print |
| Use clear, calm language: "Verified 2 days ago" | Don't litter screens with flashy fake gold certification badges |
| Design around the decision: "Dinner for 2 in VI · ₦28,000" | Don't design generic restaurant directory cards with rating stars |
| Provide mobile navigation for both consumers and business operators | Don't disable mobile bottom nav on business pages without providing a mobile header |
| Use honest empty states when data is insufficient | Don't fake activity numbers or use arbitrary multipliers |
