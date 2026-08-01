# Design System & UX Tokens: UI Standards and Layout Specifications

This document defines OyaPlan’s design system tokens, typography rules, spacing standards, primitive cards, and interaction behaviors. It serves as the primary reference for front-end implementation.

---

## 1. Color Palette Tokens

OyaPlan uses a curated, premium color system designed to evoke trust, clarity, and warmth. We avoid raw primary colors.

| Token | HSL / HEX | Role | Usage |
| :--- | :--- | :--- | :--- |
| **`brand-green`** | `#008751` | Primary Accent | Main call-to-actions, checkmarks, success states. |
| **`midnight-lagoon`**| `#0F2C24` | Primary Headers | Large display titles, section headings. |
| **`canvas-bg`** | `#FAFAF8` | Background Canvas | Main page layout backgrounds (creates paper-feel warmth). |
| **`surface-white`** | `#FFFFFF` | Component Containers | Widget bodies, cards, modal sheets. |
| **`border-default`** | `#E5E7EB` | Dividers & Lines | Form borders, card deck segment separations. |
| **`text-primary`** | `#1A1A1A` | Core Text | Body text, titles, numeric cost readouts. |
| **`text-muted`** | `#6B7280` | Subtitle Text | Secondary details, metadata descriptors. |

---

## 2. Typography Hierarchy

We use Google Fonts' **Inter** for clean readability across body copies, forms, and cost tables.

- **System Fonts**:
  ```css
  --font-body: 'Inter', sans-serif;
  --font-display: 'Inter', sans-serif;
  ```

- **Scale Specifications**:
  - **Display 1 (H1)**: `30px - 50px` font size, `900` weight (Black), line-height `1.1`. Tracking `-1px` (used for main landing titles).
  - **Header 2 (H2)**: `24px - 32px` font size, `800` weight (Extra Bold), line-height `1.2`.
  - **Header 3 (H3)**: `18px - 20px` font size, `700` weight (Bold), line-height `1.3`.
  - **Body Text**: `14px - 16px` font size, `500`/`600` weight (Medium/Semi-Bold), line-height `1.5`.

---

## 3. Spacing System (8px Grid)

All layout paddings, gaps, and margins must utilize multipliers of our core 8px grid token:

```
$spacing-xxs:  4px (0.25rem)
$spacing-xs:   8px (0.50rem)
$spacing-sm:  12px (0.75rem)
$spacing-md:  16px (1.00rem)
$spacing-lg:  24px (1.50rem)
$spacing-xl:  32px (2.00rem)
$spacing-xxl: 48px (3.00rem)
```

---

## 4. Interaction Tokens (Micro-Animations)

Transitions and layout state changes must feel premium, responsive, and tactile. We use spring configurations instead of linear timings:

### Framer Motion Spring Constants
- ** tactical-pop (Buttons, Sliders)**:
  - `type: "spring", stiffness: 100, damping: 15`
  - Used for mounting sliders, switching active tabs, and coordinate locating states.
- ** card-drag (Deck interaction)**:
  - `type: "spring", stiffness: 300, damping: 20`
  - Used for card swipes, peek sheet extensions, and layout resets.
- ** fade-in (Page load, Dialog overlays)**:
  - `duration: 0.25, ease: "easeInOut"`
  - Used for modals, analytics load flags, and text-swap overlays.
