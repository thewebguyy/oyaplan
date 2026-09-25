# OyaPlan Business Design System

> **Document Status:** Approved Business Product Design Specification (v2.0)  
> **Relationship:** Extends `OYAPLAN_DESIGN_SYSTEM.md` (shared brand tokens)  
> **Scope:** Business-specific visual language, component patterns, navigation, and motion system  
> **Brand Invariant:** `#008751` OyaPlan Green — non-negotiable

---

## 1. Product Identity & Two-World Architecture

### 1.1 Brand Expression
OyaPlan Business and OyaPlan Consumer are **two distinct product worlds** built on the exact same underlying venue data:
- **Consumer World:** "Where should we go, and what will we spend before we leave home?"
- **Business World:** "Be there when people decide where to spend."

### 1.2 Visual Wordmark
The Business header and shell always display:
```
[OyaPlan Logo] For Business
```
"For Business" is styled as an integral secondary wordmark in the same brand typography (`font-bold text-slate-900 dark:text-white`), separated by a subtle vertical divider or baseline lockup. It is never a generic SaaS pill or floating badge.

---

## 2. Color Tokens & Theme Integration

### 2.1 Shared Brand Tokens
| Token | Hex | Usage |
|---|---|---|
| `--brand-green` | `#008751` | Primary CTA, verified badges, active brand highlights |
| `--midnight-lagoon` | `#010528` | Primary text, dark backgrounds, high-contrast headings |
| `--white-sand` | `#FAFAF8` | Page background |
| `--lagos-warm-surface` | `#FAF7F2` | Card backgrounds, secondary grouping panels |
| `--lagos-warm-border` | `#EAE4DC` | Card borders, structural dividers |
| `--lagos-clay` | `#7A3E1D` | Warm editorial accents, tags |

### 2.2 Business-Specific Tokens
| Token | Hex | Usage |
|---|---|---|
| `--biz-surface-dark` | `#0B1E14` | Deep green business dark panels and footers |
| `--biz-border-dark` | `#1B3828` | Borders on dark business surfaces |
| `--biz-badge-bg` | `#EAFDF3` | Verified badge / Available feature background |
| `--biz-badge-text` | `#0A7C3F` | Verified badge / Available feature text |
| `--biz-badge-border` | `#A3F3C6` | Verified badge border |
| `--biz-coming-soon-bg` | `#F1F5F9` | Coming soon badge background (slate-100) |
| `--biz-coming-soon-text` | `#64748B` | Coming soon badge text (slate-500) |

---

## 3. Typography & Copy Standards

### 3.1 Typographic Hierarchy
- **Hero Headline:** `text-4xl sm:text-6xl font-black tracking-tight text-slate-900`
- **Section Headline:** `text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900`
- **Card Titles:** `text-lg sm:text-xl font-bold text-slate-900`
- **Body Text:** `text-sm sm:text-base text-slate-600 leading-relaxed`
- **Eyebrow / Category Tag:** `text-xs font-bold uppercase tracking-widest text-emerald-700`
- **Price Numerals:** `font-mono font-bold tracking-tight text-slate-900`

### 3.2 Copy Voice
- **Direct & Grounded:** "Keep your prices current." "Be there when people decide where to spend."
- **Lagos-Native & Commercial:** Understands the real dynamics of Lagos dining and nightlife (corkage, minimum spends, table reservations, weekend rushes) without forced slang.
- **Commercially Honest:** Never manufacture metrics ("1,200 bookings") or promise features not yet built (POS, automated booking engines).

---

## 4. Header & Mega Menu Specifications

### 4.1 Header Layout
```
[ OyaPlan | For Business ]   [ Business Types ▾ ] [ Features ▾ ]    [ Marketplace ↗ ] [ Sign Up ] [ Menu ]
```

### 4.2 Business Types Mega Menu
Categorized strictly from `VenueCategory` in `lib/types.ts`:
- **Dining:** Restaurants, Cafés (`restaurant`, `cafe`)
- **Nightlife:** Lounges & Bars, Clubs, Rooftops (`bar`, `club`, `rooftop`)
- **Experiences:** Activities, Entertainment, Cinema, Spa, Arts & Culture (`activity`, `entertainment`, `cinema`, `spa`, `arts_culture`)
- **Outdoor:** Beaches, Nature Experiences (`beach`, `nature`)

Each entry features category naming, concise Lagos-relevant descriptions, and clear hover feedback.

### 4.3 Features Mega Menu
Structured around core business jobs-to-be-done:
- **MANAGE:** Venue Profile, Live Pricing & Menus, Operating Hours, Photo Gallery.
- **KEEP CUSTOMERS INFORMED:** Table Policies, Special Events & Closures, Freshness Badges.
- **UNDERSTAND DEMAND:** Planning Activity, Visit Signals, Information Requests.
- **GROW:** Marketplace Presence (`Available`), Verified Partner Status (`Available`), Direct Booking Inquiries (`Coming Soon`), Demand Intelligence (`Coming Soon`).

### 4.4 Marketplace Bridge (`Marketplace ↗`)
- Serves as the primary bridge between the Business operator and the Consumer experience.
- Uses an outward arrow icon (`ExternalLink` or `ArrowUpRight`) indicating the intentional transition to `oyaplan.com`.

---

## 5. Motion System & Horizontal Marquee Specifications

### 5.1 The Continuous Horizontal Marquee
- **Technology:** GPU-accelerated CSS `transform: translate3d(0, 0, 0)` with keyframe animation targeting negative translate X.
- **DOM Architecture:** Exact duplicate of card array to create a continuous 0% → -50% loop with zero jumps or gaps.
- **Performance:** Hardware accelerated; `will-change: transform`.

### 5.2 Desktop Hover Interaction
- When a user hovers over any part of the card track:
  - Animation transitions smoothly into `animation-play-state: paused`.
  - Individual cards highlight with subtle border and elevation shifts.
  - User can inspect real menu items, pricing cards, and policy controls.
- On mouse leave, animation resumes smoothly.

### 5.3 Mobile & Tablet Touch Track
- On screens `< 1024px` (or touch devices), the continuous auto-scroll is disabled in favor of a native touch swipe track:
  - `overflow-x: auto`
  - `scroll-snap-type: x mandatory`
  - `scroll-snap-align: center`
  - `touch-action: pan-x pan-y`
  - Scrollbars styled clean or hidden with native momentum scrolling (`-webkit-overflow-scrolling: touch`).

### 5.4 Reduced Motion Compliance
When `@media (prefers-reduced-motion: reduce)` is detected:
- Marquee auto-animation is completely disabled (`animation: none`).
- Layout falls back to a clean multi-card horizontal track or wrap grid.

---

## 6. Product Cards Inside Motion System

All cards in the motion track represent **authentic OyaPlan interface surfaces**:

1. **Card 1 — Your Venue Profile:** Verified badge, cover photo, neighborhood pill, cuisine tag, operating hours.
2. **Card 2 — Your Pricing & Menus:** Real menu items with naira prices (`₦12,500`), category tabs (Starters, Mains, Cocktails), last-updated date.
3. **Card 3 — Your Venue Policies:** Corkage fee, dress code rules, reservation requirements, celebration notes.
4. **Card 4 — Your Demand Signals:** Real planning metrics (planners considering venue, added to itineraries).
5. **Card 5 — Your Marketplace Presence:** Public listing card with "Add to Plan" button as seen by consumer.
6. **Card 6 — Your Emerging Insights:** Confidence-gated intelligence panel showing audience origin and group size distribution.

---

## 7. Responsive Breakpoint Standards

| Breakpoint | Target Devices | Navigation Treatment | Marquee Treatment |
|---|---|---|---|
| `< 640px` | Mobile (iPhone, Galaxy) | Hamburger → Fullscreen Slide Drawer | Touch-snap swipe track |
| `640px - 1023px` | Tablets & Foldables | Compact Header + Drawer | Touch-snap swipe track |
| `1024px+` | Laptops & Desktops | Full Header with Mega Menus | Continuous auto-scrolling marquee with hover-pause |
