# OyaPlan Venue Design System & Component Specifications

**Document Date:** September 2026  
**Status:** Canonical Design System for Phase 4 (Venue Experience)  
**Surface:** `/venue/[id]`

---

## 1. Visual Tokens & Color Palette

* **Primary Action / Trust**: Nigerian Emerald `#008751` (Hover: `#007043`, Light Tint: `#EAFDF3`, Border: `#A3F3C6`)
* **Headlines & Text**: Midnight Lagoon `#010528` (Subtle Muted: `#4B5563`, Light Muted: `#6B7280`)
* **Surfaces & Cards**: Warm Lagos Sand `#FAF7F2` (Card White: `#FFFFFF`, Border: `#EAE4DC`, Divider: `#E5E7EB`)
* **Highlights & Accents**: Lasgidi Yellow `#FCC630` (Text dark: `#7A3E1D`, Light: `#FFFBEB`)
* **Operational Alerts (Temporary Closures)**: Amber `#F59E0B` (Surface: `#FEF3C7`, Text: `#78350F`)

---

## 2. Component Specifications

### 2.1 Editorial Asymmetric Gallery
* **Desktop (≥768px)**:
  - 3-Pane Asymmetric Grid (Main large landscape 2/3 width, 2 stacked thumbnails 1/3 width).
  - Subtle zoom on hover (`scale-102 transition-transform duration-300`).
  - Badge overlay: `[ Category ]`, `[ Trust Badge ]`, `[ Save Button ]`.
  - View All Photos button at bottom right of gallery.
* **Mobile (<768px)**:
  - Horizontal swipe track with snap (`scroll-snap-type: x mandatory`).
  - Rounded container (`rounded-[24px]`).
  - Photo counter pill (`1 / 5 Photos`).
* **Empty / Missing State**:
  - Warm neutral card with subtle camera icon and badge: *"Photos coming soon — We're gathering verified photos for this space."*

### 2.2 Sticky Horizontal Anchor Bar
* **Position**: Sticky at top (`top-[56px] z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE4DC]`).
* **Items**: `[ Overview ]` `[ What It Costs ]` `[ Menu ]` `[ What You Can Get ]` `[ Good to Know ]`.
* **Mobile**: `overflow-x-auto no-scrollbar` with smooth horizontal scroll and active underline indicator.

### 2.3 Financial Decision Summary Card
* **Header**: Typical Spend: `~₦15,000 – ₦25,000 / person`
* **Group Multiplier**: `~₦60,000 – ₦100,000 for 4 people`
* **Confidence Badge**:
  - **Verified**: Green pill (`✓ Pricing verified recently · Last updated Aug 2026`)
  - **Estimated**: Grey pill (`ℹ Estimated from available menu data`)
  - **Limited**: Amber pill (`⚠ Limited pricing data`)

### 2.4 "What Can I Get For ₦X?" Scenario Engine
* **Interactive Budget Simulator**:
  - Selector for budget (`₦30,000`, `₦50,000`, `₦90,000`, `₦150,000`) and squad size (`2 people`, `4 people`, `6 people`).
  - Data-Driven Composition:
    - Mains: `1 × per person` (e.g. 2 Mains)
    - Sides/Starters: `1 × per 2 people` (e.g. 1 Peppered Snails / Starter)
    - Drinks: `1 × per person` (e.g. 2 Signature Cocktails / Soft Drinks)
    - Mandatory Charges: Auto-computed from `service_charge_pct` and `vat_pct`.
    - Estimated Total vs. User Budget with surplus/difference calculation.
* **Fallback for Venues with Limited Menu Data**:
  - Displays honest budget tier cards explaining what each budget typically covers in this area/category.

### 2.5 Scannable Category Menu
* **Category Tabs**: `All`, `Food`, `Drinks`, `Sides`, `Activities`, `Other`.
* **Item Row**: Name, Description (if present), Price formatted with Nigerian locale (`₦12,500`), and category tag.
* **Trust Tag**: Clear badge if item is partner-verified.

### 2.6 Good to Know (House Charges, Hours & Policies)
* **Charges Grid**: VAT (`7.5%`), Service Charge (`5%`), Corkage (`₦10,000/bottle`), Cake Fee (`₦5,000`), Minimum Spend (`₦50,000`). Never render NULL as ₦0.
* **Operating Hours**: Current open/closed status with live countdown (*"Open until 11:00 PM"*), full weekly table with today highlighted.
* **Table Policies**: Human-friendly translation of bottle service, reservation rules, and rooftop minimum spends.
* **Actionable Contact**: Direct Call button and WhatsApp availability inquiry button.
* **Location & Map**: Address, area badge, and direct Google Maps directions link.

### 2.7 Mobile Sticky Action Bar
* **Position**: Fixed at bottom of viewport (`bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE4DC] p-3 pb-safe`).
* **Layout**: `[ ♡ Save Spot ]` (outline rounded-xl) + `[ Plan This Venue — ~₦25k/person → ]` (Primary Green `#008751`).

---

## 3. Responsive Breakpoints & Accessibility

* **Breakpoints**: `360px`, `390px`, `412px` (Mobile), `768px` (Tablet), `1280px`, `1440px` (Desktop).
* **Touch Targets**: Minimum `44px × 44px`.
* **Motion**: All animations (gallery zoom, drawer slide, anchor scroll) wrapped with `motion-reduce:transform-none` and respect `prefers-reduced-motion`.
* **A11y**: Proper ARIA landmarks, roles, keyboard focus outlines, and image alt attributes.
