# OyaPlan Design Migration Audit: The Path to Elite Polish
**Date:** July 12, 2026  
**From:** Creative Director  
**To:** CEO, Engineering & Design Teams  

---

## 1. The Vision: "Linear Utility meets Chowdeck Emotion"

OyaPlan is currently a functional tool that solves a real problem: **price transparency in Lagos social life**. However, the current UI is "utility-heavy" and lacks the "emotional polish" that makes products like Chowdeck, Linear, and Apple feel elite.

### The Three Pillars of the Migration:
1.  **Chowdeck (Trust & Emotion):** We will borrow their "Operationalized Happiness"—using color, micro-copy, and trust signals to reduce the anxiety of planning.
2.  **Linear (Systemic Efficiency):** We will borrow their "Mathematical Correctness"—a strict 8pt grid, high-density layouts, and keyboard-first interactions.
3.  **Apple (Motion & Hierarchy):** We will borrow their "Fluidity"—using motion to explain relationships between data points and creating a clear visual hierarchy.

---

## 2. Global Design Tokens & Foundation

| Token Category | Current State | Recommendation | Strategy | Implementation Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Typography** | Standard Sans-Serif (likely Inter). | **Circular Std** or **Geist Sans**. | **STEAL:** Linear’s Geist Sans for UI, **ADAPT:** Chowdeck’s bold headlines. | High |
| **Color Palette** | Vibrant Green (#16A34A). | **Refined Emerald & Slate.** | **ADAPT:** Shift to a deeper, more sophisticated green (Chowdeck style) + neutral slates (Linear style). | Medium |
| **Grid System** | Loose / Variable. | **Strict 8pt Grid.** | **STEAL:** The "Power of 2" spacing system from Linear. | Critical |
| **Radius** | Mixed (Rounded to Pill). | **Standardized 8px / 12px / 24px.** | **ADAPT:** Chowdeck’s "Soft Modernism" radius scale. | High |
| **Motion** | Static / Instant. | **Functional Spring Motion.** | **STEAL:** Apple’s 250ms spring transitions for modals and sheets. | Medium |

---

## 3. Landing Page Audit & Migration Plan

### Current State
The landing page is a green hero section with a simple "What's the plan today?" grid. It’s functional but feels like a "MVP."

### Problems
*   **Lack of Social Proof:** No evidence that real people are using it (unlike Chowdeck’s "Trending" and "Recently planned").
*   **Visual Noise:** The emoji-heavy grid feels a bit "playful" in a way that might undermine the "Real Price" trust promise.
*   **Weak Value Prop:** The headline is good, but the visual weight is on the category buttons rather than the *outcome* of planning.

### Migration Strategy

| Feature | Reference | Why it Works | How OyaPlan Should Implement | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Section** | **Chowdeck** | Uses high-quality custom illustrations to explain the "Ecosystem." | **ADAPT:** Replace the green block with a "Planning Canvas" illustration showing a squad, a budget, and a map. | High |
| **Trending/Social** | **Chowdeck** | "Recently planned" creates FOMO and trust. | **STEAL:** A live ticker or grid of "Real Plans" being made (anonymized). | High |
| **Category Grid** | **Apple** | Uses depth and subtle shadows to make categories feel "Tappable." | **ADAPT:** Use high-res, blurred background images of the actual locations instead of emojis. | Medium |

**Tailwind Suggestion:**
```html
<!-- Refined Category Card -->
<div class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-xl hover:-translate-y-1">
  <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
  <h3 class="text-xl font-bold text-slate-900">Serious Chop</h3>
  <p class="text-sm text-slate-500">For when the hunger is real.</p>
</div>
```

---

## 4. Discovery & Explore UX (The "Storefront")

### Current State
The "Explore" page is a series of lists and cards. It feels like a standard directory.

### Problems
*   **Low Information Density:** The cards are large but don't show enough "Why" (e.g., specific menu items or transport breakdown).
*   **Friction:** The "Plan around this" button is a heavy commitment.

### Migration Strategy

| Feature | Reference | Why it Works | How OyaPlan Should Implement | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Spot Cards** | **Chowdeck** | High-quality food photography + clear "Verified" status. | **STEAL:** The "Verified Price" badge. Use Chowdeck’s 16:9 image ratio. | Critical |
| **Filters** | **Linear** | "Filter by" is fast, keyboard-accessible, and non-intrusive. | **STEAL:** Use Linear’s "Floating Filter Bar" instead of a sidebar. | High |
| **Empty States** | **Airbnb** | Suggests alternatives rather than just saying "No results." | **ADAPT:** If a neighborhood has no spots, show "Trending spots in nearby [Area]." | Medium |

**Design Token Suggestion:**
*   `verified-badge`: `bg-emerald-100 text-emerald-700 border-emerald-200`
*   `price-tag`: `font-mono font-semibold text-slate-900`

---
*Section 1-4 Complete. Proceeding to Dashboard, IA, and Motion Language in the next segment.*

---

## 5. The "Forge" (Planning Dashboard)

### Current State
(Inferred from "Start Planning" flow) The core planning engine where users add spots, calculate transport, and see the total.

### Problems
*   **Cognitive Overload:** Balancing budget vs. distance vs. preference is hard. The UI needs to "do the math" visually.
*   **Lack of Hierarchy:** The "Total Cost" needs to be the "North Star" of the screen.

### Migration Strategy

| Feature | Reference | Why it Works | How OyaPlan Should Implement | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Data Density** | **Linear** | Shows a lot of info without feeling cluttered through perfect spacing. | **STEAL:** The "Sidebar for Details" pattern. Keep the plan list clean, show price breakdowns in a side-sheet. | High |
| **Total Cost** | **Apple (Wallet)** | Large, clear numbers that update with a "counting" animation. | **STEAL:** Use a "Sticky Footer" for the total cost that pulses when a new item is added. | Critical |
| **Interactive Map** | **Uber/Airbnb** | Connects the "Plan" to the "Physical World." | **ADAPT:** A mini-map showing the "Route" between spots to visualize transport costs. | Medium |

**React Component Suggestion:**
```tsx
// Animated Price Counter
import { motion, useSpring, useTransform } from 'framer-motion';

const PriceCounter = ({ value }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(current)
  );

  useEffect(() => spring.set(value), [value]);

  return <motion.span className="text-3xl font-bold font-mono">{display}</motion.span>;
};
```

---

## 6. Information Architecture & Navigation

### Current State
Simple top-nav: OyaPlan, Start Planning, Explore, Sign In.

### Problems
*   **Persona Confusion:** Is this for the "Organizer" or the "Squad Member"?
*   **Dead Ends:** Once you finish a plan, where do you go?

### Migration Strategy

| Feature | Reference | Why it Works | How OyaPlan Should Implement | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Navigation** | **Linear** | Breadcrumbs that show exactly where you are in the hierarchy. | **STEAL:** `Home > Lagos Island > Lekki > Hard Rock Cafe`. | Medium |
| **Multi-Tenant** | **Chowdeck** | Clearly separates Customer, Vendor, and Rider. | **ADAPT:** Separate "My Plans" (Personal) from "Explore" (Discovery) from "Spot Owners" (B2B). | High |
| **Search** | **Linear (Cmd+K)** | The fastest way to find anything. | **STEAL:** A global search that allows searching for Spots, Areas, or Cuisines instantly. | High |

---

## 7. Motion Language & Microinteractions

OyaPlan is currently "static." To reach the "Apple level of polish," we need a **Motion System**.

### The OyaPlan Motion Manifest:
1.  **Staggered Entrances:** When a list of spots loads, they should "pop" in one by one (100ms delay). **(STEAL: Apple)**.
2.  **Layout Transitions:** When switching from "Explore" to "Forge," elements should morph or slide, not disappear. **(STEAL: Framer)**.
3.  **Feedback Loops:** Clicking "Add to Plan" should show a small flying animation toward the cart/total. **(ADAPT: Chowdeck)**.

### Categories for Migration:

*   **STEAL:** **Skeleton Loaders**. Replace spinning wheels with shimmering grey blocks that match the card layout.
*   **ADAPT:** **Hover Effects**. Instead of just a border color change, use a subtle 3D lift (Y-axis) and a soft drop shadow.
*   **AVOID:** **Heavy Parallax**. It slows down the "Utility" of a planning tool. Keep motion functional.

---

## 8. Engineering Implementation Strategy

### Sprint 1: The Foundation (Design Tokens)
*   Implement the 8pt grid in Tailwind config.
*   Standardize Typography (Geist/Circular) and Color Palette.
*   Build the "OyaCard" and "OyaButton" base components.

### Sprint 2: The Core UX (Discovery & Forge)
*   Migrate the Explore page to the new high-density grid.
*   Implement the "Sticky Total" and Animated Price Counter.
*   Add the "Verified Price" badge system.

### Sprint 3: The Polish (Motion & Trust)
*   Add Framer Motion staggered animations.
*   Implement Skeleton Loaders.
*   Build the "Recently Planned" social proof engine.

---

## 9. Final Recommendations

**The "Elite" Checklist for the Team:**
*   [ ] Does every card have a consistent 16px padding?
*   [ ] Is every price formatted with the correct NGN symbol and thousands separator?
*   [ ] Does the site load in under 2 seconds? (Use Next.js Image optimization).
*   [ ] Can a user make a full plan without touching their mouse? (Linear-style keyboard nav).

**Creative Director's Note:**
We are not building a clone of Chowdeck. We are building the **most reliable social planning engine in Africa**. We use Chowdeck’s trust, Linear’s efficiency, and Apple’s beauty to make OyaPlan the only tool people use when they ask, *"What's the plan today?"*
