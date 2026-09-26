# OyaPlan Plan Experience Design System (Phase 5)

## 1. Design Philosophy & Brand Tokens

The Plan Experience is the ultimate proof point of OyaPlan's value proposition: **Total Landed Cost Transparency & Budget Confidence**.

### Palette Tokens
- **Emerald Green (Brand Action)**: `#008751` / `rgb(0, 135, 81)`
- **Midnight Lagoon (Dark / Text)**: `#010528` / `rgb(1, 5, 40)`
- **Warm Sand (Canvas / Surface)**: `#FAF7F2` / `rgb(250, 247, 242)`
- **Subtle Surface Border**: `#E5E0D8`
- **Soft Accent / Leftover Positive**: `#ECFDF5` with `#065F46` text
- **Muted Evidence Text**: `#6B7280`

### Radius Hierarchy
- **Hero & Card Containers**: `rounded-2xl` (16px / `1rem`)
- **Internal Metric Blocks**: `rounded-xl` (12px / `0.75rem`)
- **Buttons, Badges & Chips**: `rounded-full` (9999px)

---

## 2. Core Financial Relationship Formula

Every budget display in OyaPlan MUST conform to the 3-Pillar Budget Relationship:

```text
┌────────────────────────────────────────────────────────┐
│                      YOUR OUTING                       │
│                                                        │
│   ₦90,000                ~₦74,000             ₦16,000  │
│  your budget          estimated spend        remaining │
└────────────────────────────────────────────────────────┘
```

### Inviolable Rules:
1. **Never strike through the user's budget**: A lower spend is a *savings*, not a budget replacement.
2. **Tabular currency alignment**: Use `font-mono tracking-tight` for Naira amounts to prevent wrapping and visual jitter.
3. **Contextual Under-Spend Explanations**: If `estimated < budget * 0.5`, display an honest explanation:
   - *"This plan comes in well below your budget. You can spend more at this venue or upgrade your scenario."*

---

## 3. Scannable Component Contracts

### `PlanHeroSummary`
- Plan title (e.g. "Friday night in Lekki")
- Squad & Budget metadata (`4 people · ₦90,000 budget · Dinner vibe`)
- Canonical venue photo + Name + Area + Category + Direct Venue Page Link
- Primary 3-pillar Budget Relationship card

### `PlanWhatYouGet`
- Summary badge (e.g., "2 mains · 1 shared side · 4 drinks")
- Itemized menu list with item name, quantity, and verified price
- Fallback state when menu data is limited with honest estimation copy

### `PlanCostBreakdown`
- Itemized cost rows:
  - Food & drinks (`₦58,000`)
  - Ride-hailing transport (`~₦12,000` round trip)
  - Taxes & Service (`₦4,000` - 5% service + 7.5% VAT)
- Estimated Total Landing Cost
- Progressive Disclosure Trigger: "How we estimated this" (Accordion)

### `PlanWhyThisWorks`
- 3 to 4 succinct value bullets:
  - Fits your group size
  - Well within your budget
  - Matches the requested vibe
  - Transport accounted for

### `PlanActionsShare`
- 1-tap WhatsApp Formatted message generator
- Copy Link & Native Web Share API
- Edit Plan in Forge (preserves query params)
- Plan Code badge (`OYA-XXXXXX`)

### `PlanMobileStickyBar`
- Fixed bottom mobile container (`z-30 pb-safe`)
- [Share Plan] and [Edit Plan] primary touch targets (height >= 48px)
