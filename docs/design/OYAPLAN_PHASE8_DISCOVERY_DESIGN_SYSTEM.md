# OyaPlan Phase 8 — Discovery Design System Specification

**Status:** Canonical  
**Role:** Design Systems Engineer & Senior Product Designer  
**Date:** September 2026  
**Scope:** Search, Filter Controls, Result Cards, Bottom Sheets, Mobile Responsive Patterns

---

## 1. Brand Tokens & Color Palette

The OyaPlan discovery design system strictly extends the canonical color palette and design tokens:

### Primary Colors
- **OyaPlan Primary Green:** `#008751` (Nigerian green — sacred primary action and verification token)
- **Midnight Lagoon:** `#010528` (Deep navy ink — primary headline and high-contrast structural element)
- **White Sand:** `#FAFAF8` / `#FAF7F2` (Warm neutral page canvas)
- **Surface Crisp White:** `#FFFFFF` (High-elevation card containers)
- **Surface Muted:** `#F4F3EF` / `#F0EDE8` (Secondary chips and input backgrounds)

### Category & Trust Accent Colors
- **Restaurant / Dining:** `#008751` (Green)
- **Bar & Nightlife:** `#7C3AED` / `#9C27B0` (Purple)
- **Cafe & Quick Bites:** `#0284C7` (Sky Blue)
- **Activity & Entertainment:** `#EA580C` / `#FF5722` (Orange)
- **Nature & Beach:** `#0D9488` (Teal)
- **High Trust / Verified:** `#008751` (Badge bg: `#EAFDF3`, border: `#A3F3C6`, text: `#0A7C3F`)
- **Estimated / Historical:** `#D97706` (Badge bg: `#FFFBEB`, border: `#FDE68A`, text: `#B45309`)

---

## 2. Typography Hierarchy

Using font family **Outfit** (`font-sans`):

| Level | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Header** | 32px / 40px (Mobile / Desktop) | 900 (Black) | 1.15 | -0.03em | Explore hero: "Find somewhere worth going." |
| **Section Title** | 20px / 24px | 800 (ExtraBold) | 1.25 | -0.02em | Section headers & area groupings |
| **Card Title** | 18px / 20px | 800 (ExtraBold) | 1.2 | -0.01em | Venue Name in decision cards |
| **Financial Highlight** | 22px / 26px | 900 (Black) | 1.1 | -0.02em | Total / per-person spend badge |
| **Body Primary** | 14px / 15px | 500 (Medium) | 1.45 | normal | Address, descriptions, why it fits |
| **Metadata & Subtext** | 12px / 13px | 600 (SemiBold) | 1.3 | normal | Verification timestamps, squad breakdown |
| **Pill / Badge Label** | 10px / 11px | 800 (ExtraBold) | 1.0 | +0.05em | Category pills, Trust badges, Filter chips |

---

## 3. Search Field Component (`DiscoverySearchInput`)

### Behavior & Constraints:
- **Height:** 52px on mobile (min 48px touch target), 56px on desktop.
- **Visuals:** Pure white background, subtle border `#E5E7EB`, 16px radius (`rounded-2xl`).
- **States:**
  - *Default:* Search icon, placeholder "Search venue name, area, or vibe...", clear button hidden.
  - *Active / Focused:* Border `#008751`, subtle green glow `ring-2 ring-[#008751]/15`.
  - *Filled:* Clear `(X)` icon button appears, instantly clearing input on tap without closing keyboard.
- **Mobile Keyboard Behavior:** `inputmode="search"`, `enterKeyHint="search"`, auto-correct disabled for Nigerian slang and foreign venue names.

---

## 4. Filter Surface & Controls

### Horizontal Area & Category Strip (Mobile & Desktop)
- Sticky top container below header.
- Tap targets min 44px height.
- Active pill: `#010528` background with `#FFFFFF` text.
- Inactive pill: `#FFFFFF` background with `#E5E7EB` border, text `#4B5563`.
- Smooth scroll horizontally with snap points and hidden scrollbars.

### Mobile Bottom Sheet Filter (`DiscoveryFilterSheet`)
- Slides up smoothly with spring animation (`framer-motion`).
- Background backdrop: `rgba(1, 5, 40, 0.45)` with `backdrop-blur-sm`.
- Touch swipe-to-dismiss handle at the top.
- Includes:
  - **Squad Size Stepper:** Big tactile `-` and `+` buttons (44px min), current squad count centered.
  - **Max Total Outing Budget:** Presets (₦20k, ₦40k, ₦60k, ₦100k, ₦150k+) or Custom input.
  - **Experience / Vibe Selector:** Grid of tactile buttons with active indicators.
  - **Deterministic Sort Selector:** "Best Fit", "Spend: Low to High", "Spend: High to Low", "Recently Verified".
- Sticky bottom footer with **Reset All** (secondary) and **Apply Filters (N results)** (primary `#008751` button).

---

## 5. Result Card Design (`DiscoveryVenueCard`)

The result card is engineered for **2-second scannability**:
**Name → Area → Category → Spend → Verification**

### Layout & Information Architecture:
```
┌────────────────────────────────────────────────────────┐
│ [ Category Badge ]                    [ Trust Badge ]  │
│                                                        │
│                  VENUE IMAGE (16:10)                   │
│                                                        │
│ [ Thumbnail 1 ] [ Thumbnail 2 ] [ +2 More ]            │
├────────────────────────────────────────────────────────┤
│ VENUE NAME                                     [SAVE]  │
│ 📍 Area & Address • Category                           │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Estimated Outing (Squad of 4)                      │ │
│ │ ₦48,000 Total   •   ~₦12,000 / person             │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ✓ Why It Fits: "Spacious seating • Great for groups"  │
│ 🕒 Verified this week by community receipt             │
│                                                        │
│ [ View Venue Details ]            [ Plan in Forge → ]  │
└────────────────────────────────────────────────────────┘
```

### Card Constraints:
- Card radius: 24px (`rounded-3xl`).
- Container elevation: `shadow-sm` transitioning to `shadow-md` on hover.
- Buttons: Primary link to `/venue/[id]` (clean decision transition), secondary link to `/forge?pinned=[id]`.

---

## 6. Affordability Framing & Budget Context

Never overstate precision. Always use canonical framing:
- If squad = 1: `Typical spend ~₦15,000`
- If squad > 1: `Estimated outing: ₦60,000 for 4 (~₦15,000/person)`
- If user entered a budget:
  - Within budget: `✓ Fits your ₦70k budget (₦10k left)`
  - Over budget: `₦5k over your ₦50k target`

---

## 7. Empty State & "Relax One Thing"

When no venues match the exact combination of filters, show an **actionable recovery surface**:
1. **Headline:** "No venues match all these filters"
2. **Context:** "We couldn't find a verified spot matching Lekki + ₦20,000 for 4 people + Fine Dining."
3. **One-Tap Relaxation Actions:**
   - `[ Increase Budget to ₦40,000 ]`
   - `[ Expand to All Lagos Areas ]`
   - `[ Clear Vibe Constraint ]`
4. **Safety Rule:** Never silently modify filters in the background. Every relaxation must be an explicit user tap.

---

## 8. Mobile Responsiveness Standards

- Strict validation on **360px, 390px, and 412px** viewports before desktop scaling.
- **Zero horizontal page overflow** (`overflow-x-hidden`).
- **Minimum 44px touch targets** on all interactive elements.
- **Safe Area padding** (`pb-safe`) for iOS and Android home indicator navigation bars.
- `prefers-reduced-motion` compliance across all transitions.
