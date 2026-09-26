# OyaPlan Consumer Design System & Interaction Patterns

**Document Date:** September 2026  
**Purpose:** Canonical specifications for UI components, information hierarchy, layout rules, motion, responsive breakpoints, and copy principles for the OyaPlan Consumer Experience.

---

## 1. Core Visual Tokens & Color Palette

### Primary Color Hierarchy
* **Nigerian Emerald (Primary Action & Trust)**: `#008751` (Hover: `#007043`, Light Tint: `#EAFDF3`, Border: `#A3F3C6`)
* **Midnight Lagoon (Headlines & High Contrast Background)**: `#010528` (Subtle dark: `#0A0F3D`)
* **Warm Lagos Sand / Earth Surface**: `#FAF7F2` (Card surface: `#FFFFFF`, Border: `#EAE4DC`, Divider: `#E5E7EB`)
* **Lasgidi Yellow (Accents & Highlights)**: `#FCC630` (Text dark: `#7A3E1D`, Light: `#FFFBEB`)
* **Amber Operational Alerts (Temporary Closures / Maintenance)**: `#F59E0B` (Surface: `#FEF3C7`, Text: `#78350F`)

### Typography Hierarchy
* **Display Headlines**: `font-black text-midnight-lagoon uppercase tracking-tight`
* **Sub-headings / Cards**: `font-extrabold text-midnight-lagoon text-lg sm:text-xl tracking-tight`
* **Tabular / Spend Numerals**: `font-black tabular-nums tracking-tight`
* **Section Kicker / Badges**: `text-[10px] sm:text-[11px] font-black uppercase tracking-wider`
* **Body Text**: `text-xs sm:text-sm font-medium text-[#4B5563] leading-relaxed`

---

## 2. Information Architecture Patterns

### Pattern A: The Budget Relationship Card
Whenever a plan is rendered, the relationship between the user's budget and the estimated spend must follow this exact formula:

```text
┌────────────────────────────────────────────────────────┐
│ YOUR PLAN                                              │
│ Friday night in Lekki · 4 people · ₦90,000 budget      │
│                                                        │
│ ~₦68,500 estimated spend                               │
│ 🟢 You're within budget · ₦21,500 left over            │
└────────────────────────────────────────────────────────┘
```

* **Rule 1**: Never silently replace the user's budget with the lower total.
* **Rule 2**: If the plan is significantly cheaper than the budget (e.g. ₦14,000 vs ₦90,000), frame it positively:
  * *"This option costs ~₦14,000 — comfortably within your ₦90,000 budget."*
  * Provide optional suggestions (*"You could also add: Cocktails, dessert, or premium rides"*).

---

### Pattern B: The "What Can I Get?" Module
Transforms raw menu lists into decision-making spending scenarios:

```text
WHAT YOU CAN GET FOR ₦40,000
┌────────────────────────────────────────────────────────┐
│ • 2 Main Courses (e.g. Seafood Pasta + Grilled Ribs)   │
│ • 1 Shared Starter / Side (e.g. Peppered Calamari)     │
│ • 2 Signature Cocktails / Drinks                       │
│                                                        │
│ ℹ️ Sample order based on verified venue menu pricing   │
└────────────────────────────────────────────────────────┘
```

* **Rule**: Generated strictly from verified menu items stored in the database. If menu items are unavailable, display an honest notice with the typical spend range.

---

### Pattern C: Horizontal Anchor Navigation (`/venue/[id]`)
Desktop and mobile sticky navigation that allows fast jumping between sections without layout shifts:

```text
[ Overview ]  [ What It Costs ]  [ Menu ]  [ Photos ]  [ Good to Know ]
```

* **Desktop**: Flex row with active underline indicator.
* **Mobile**: Horizontal scrollable strip (`overflow-x-auto no-scrollbar`) with smooth touch scrolling.

---

### Pattern D: Sticky Mobile Conversion Bar
Persistent at the bottom of the mobile viewport on `/venue/[id]` and `/plan/[id]`:

```text
┌────────────────────────────────────────────────────────┐
│ [ Bookmark Icon ]    [ Plan This Venue — ~₦25k/person ] │
└────────────────────────────────────────────────────────┘
```

* Height: `64px`
* Background: `bg-white/95 backdrop-blur-md border-t border-border-default`
* Padding: Safe area aware (`pb-safe`)

---

### Pattern E: The Dual-World Login Selector
When an unauthenticated user taps "Login", they are presented with a clear product-world selector before any form:

```text
┌────────────────────────────────────────────────────────┐
│ WELCOME TO OYAPLAN                                     │
│                                                        │
│ 🟢 OyaPlan for OyaPlanners                             │
│ Plan outings, discover places, and know your spend.    │
│ [ Continue as an OyaPlanner → ]                        │
│                                                        │
│ 🏢 OyaPlan for Businesses                              │
│ Manage your venue profile, sync prices, view demand.   │
│ [ Continue as a Business → ]                           │
└────────────────────────────────────────────────────────┘
```

---

## 3. Responsive Breakpoints & Mobile Touch Rules
* **Minimum Viewport Support**: `360px` (Tecno/Infinix entry-level Androids common in Lagos).
* **Core Mobile Targets**: `390px` (iPhone 14/15/16) and `412px` (Samsung Galaxy / Pixel).
* **Touch Targets**: Minimum `44px × 44px` for all interactive buttons, pills, and dropdown triggers.
* **Typography Scaling**: Never drop below `11px` for helper captions; primary body text minimum `13px` on mobile.

---

## 4. Copy & Tone Principles
* **Lagos-Native & Direct**: Confident, transparent, conversational.
* **Anti-SaaS**: Avoid terms like *“Authentication Required”*, *“Landed Cost Ledger”*, or *“Confidence Score 0.78”*.
* **Honest & Grounded**: Say *"Pricing last checked this week"* instead of pretending to have 100% real-time camera feeds.
