# OYAPLAN — CANONICAL DESIGN SYSTEM

## 1. Brand Identity & Color System

OyaPlan is built with a restrained, premium, Lagos-inspired visual language. No neon redesigns, no AI gradient fads, no generic SaaS blues.

### Core Palette
- **Primary Brand Green:** `#008751` (Nigerian Green — Action, Trust, Verification)
- **Primary Dark / Midnight Lagoon:** `#010528` (Editorial contrast, header accents, strong frames)
- **Lasgidi Yellow / Accent:** `#FCC630` (Tactile highlights, badges, moment accents)
- **Warm Neutral Backgrounds:**
  - `#FAF9F6` / `#FAFAF8` (Warm sand surface — default background)
  - `#FAF7F2` (Card surface / container neutral)
  - `#FFFFFF` (Primary elevation surface)
- **Border / Neutral System:**
  - `#EAE4DC` / `#E5E7EB` (Subtle boundary borders)
  - `#F3F4F6` (Muted chip & pill backgrounds)
- **Text Hierarchy:**
  - Primary: `#1A1A1A` / `#010528`
  - Secondary: `#4B5563` / `#6B7280`
  - Muted: `#9CA3AF` / `#64748B`

---

## 2. Typography

- **Primary Font Family:** Outfit, sans-serif
- **Scale:**
  - Display: `32px` – `48px` (font-black, tracking tight)
  - Heading 1: `24px` – `32px` (font-extrabold)
  - Heading 2: `18px` – `22px` (font-bold)
  - Body: `14px` – `16px` (font-normal / font-medium)
  - Label / Caption: `11px` – `13px` (font-bold / font-semibold, uppercase tracking-wide where appropriate)

---

## 3. Touch Targets & Mobile Ergonomics

- **Minimum Touch Target:** `44 × 44px` (Prefer `48px` for primary actions)
- **Safe Area Insets:** Support `env(safe-area-inset-bottom, 0px)` across all bottom navigation bars and sheets.
- **Form Controls:** Large tap areas, numeric keyboard hints (`inputMode="numeric"`), tactile active scale (`active:scale-[0.98]`).
- **Validated Viewports:**
  - 360 × 800 (Small mobile - zero horizontal overflow, fluid text)
  - 390 × 844 (Standard mobile - comfortable thumb reach)
  - 412 × 915 (Large mobile - clean card proportions)
  - 768px+ (Tablet & Desktop expansion)

---

## 4. Iconography Standards

Functional symbols must use vector icons (**Lucide React**) rather than platform emojis.

| Category / Action | Icon Primitive | Usage |
| :--- | :--- | :--- |
| **Location** | `MapPin` | Starting areas, venue addresses, distance markers |
| **Budget / Money** | `Wallet`, `Coins` | Budget presets, spend breakdown, total landed cost |
| **Date Night** | `Heart` | Romantic, date-night vibe presets |
| **Squad / Social** | `Users` | Squad size selection, group outings |
| **Party / Celebration** | `PartyPopper` | Turn up, birthday celebrations |
| **Quick Linkup** | `Zap` | Quick bites, fast linkups |
| **Food / Dining** | `Utensils` | Foodie, serious chop |
| **Brunch** | `Sun` | Brunch vibes |
| **Transport** | `Car`, `Bus` | Ride-hailing, public transit estimates |
| **Verification** | `ShieldCheck`, `Check` | Verified pricing, audited menus |
| **Warning / Notice** | `AlertTriangle` | Budget warnings, operational notices |

---

## 5. Trust & Financial Hierarchy

Every price and estimate on OyaPlan follows a strict semantic hierarchy:

1. **Your Budget** — What the user or squad set (never rewritten or crossed out).
2. **Estimated Landed Spend** — Probable outing spend (venue items + transport + mandatory fees).
3. **Left Within Budget / Remaining** — Safety buffer remaining.

### Verification States:
- **Verified:** Audited directly from latest menu or venue operator.
- **Estimated:** Estimated from verified algorithms and historical evidence.
- **Limited Data:** Clearly disclosed when insufficient data exists.
