# OyaPlan Plan Experience & Architecture Audit (Phase 5)

## 1. Executive Summary & Problem Diagnosis

### The Core Problem
The OyaPlan Plan output (`/plan/[id]` and `/forge` results) is the single most critical decision-making surface for consumers. However, user testing revealed severe information fatigue:
> *"This thing is giving me headache."*
> *"Nobody has the energy to calm down and read through."*
> *"So much details but it is put in a way nobody will read."*

The root cause is not lack of information—it is **16+ vertically stacked unstructured cards**, confusing accounting terminology ("Verified Receipt" vs Outing Estimate), and poor financial hierarchy that crossed out the user's budget.

### The ₦90k → ₦14k Bug (Root Cause Analysis)
**Tester Report:** *"I put a budget for 90k. Why are you reducing it to 14k? If I wanted to spend that amount, I would have put it."*

**Investigation Findings:**
1. **Financial Semantics Confusion**: The planning engine selects a venue and constructs a conservative menu allocation (e.g. ₦14,000 for 1-2 people).
2. **UI Anti-Pattern (`BudgetConfidenceCard.tsx`)**: The UI displayed the user's budget with `<p className="line-through text-[#9CA3AF]">₦90,000</p>` and placed `₦14,000` as the main bold headline.
3. **Misleading Receipt Framing**: The old plan titled itself "OyaPlan Verified Receipt", giving the false impression that OyaPlan had unilaterally rewritten the user's outing budget down to ₦14k, rather than communicating:
   - **Your Budget**: ₦90,000
   - **Estimated Outing Spend**: ₦14,000
   - **Remaining Left Over**: ₦76,000

---

## 2. Current Architecture vs. Target Clean Architecture

### Existing Fragmented Components (16+ Cards)
- `LedgerCard` (Duplicated financial numbers)
- `ReceiptStructure` (Overly bureaucratic invoice framing)
- `PlanCodeSquadPass` (Detached from share actions)
- `RouteCard` (Raw transport math exposed up-front)
- `PlanCTAs` (Cluttered multiple button actions)
- `SaveAsSquadPrompt` (Premature popup/card)
- `PlanVoting` (Disconnected interaction)
- `RecommendationFeedback` (Inline rating clutter)
- `WhyWePickedThis` (Long walls of generic text)
- `BeforeYouGo` (Duplicated venue rules)
- `VerificationReceiptLoader` (Fake certainty animation)

### Target Clean Component Architecture (Unified Plan Itinerary)
```text
PLAN (/plan/[id] & /forge)
│
├── 1. Plan Context & Decision Hero (PlanHeroSummary.tsx)
│      - Header: "Friday night in Lekki · 4 people · ₦90,000 budget"
│      - Canonical Venue Visual & Direct Link
│      - The 3-Pillar Budget Relationship Card (Budget | Spend | Remaining)
│
├── 2. What You're Getting (PlanWhatYouGet.tsx)
│      - Scannable Summary ("2 mains · 1 shared side · 4 drinks")
│      - Real Menu Items with Nigerian Naira Pricing
│      - Honest handling for missing / limited menu data
│
├── 3. Cost Breakdown & Landing Total (PlanCostBreakdown.tsx)
│      - Food & Drinks
│      - Ride-Hailing Transport (Round trip)
│      - Mandatory Charges (5% Service + 7.5% VAT)
│      - Landing Total vs Remaining Budget
│      - Progressive Disclosure: "How we estimated this" (Collapsed by default)
│
├── 4. Why This Plan (PlanWhyThisWorks.tsx)
│      - 3-4 crisp checkmarks grounded in actual planner inputs
│
├── 5. Sharing & Squad Attribution (PlanActionsShare.tsx)
│      - Direct WhatsApp formatted share generator
│      - One-tap link copy & Native Share sheet
│      - Edit plan in Forge (preserving inputs)
│      - Official OYA-XXXXXX Plan Code
│
├── 6. Post-Outing Feedback (PlanActualSpendPrompt.tsx)
│      - Lightweight attribution & actual spend contribution
│
└── 7. Mobile Persistent Sticky Bar (PlanMobileStickyBar.tsx)
       - [Share Plan] and [Edit Plan] always accessible (44px+ touch targets)
```

---

## 3. Mobile-First Ergonomics Audit (360px / 390px / 412px)

1. **First-Viewport Comprehension**:
   - At 360px width, the user must immediately see: Context + Venue + Estimated Spend + Remaining Budget + Primary Share CTA without scrolling.
2. **Typography Wrap Prevention**:
   - Tabular Naira numbers (`font-mono tracking-tight`) to prevent wrapping.
   - Menu item names flex-shrink gracefully while preserving price column alignment.
3. **Corner Radius System**:
   - Hero media: `rounded-2xl` (16px)
   - Core cards: `rounded-2xl` (16px)
   - Inner metric surfaces: `rounded-xl` (12px)
   - Buttons / pills: `rounded-full` (9999px)
4. **Touch Target Sizing**:
   - All interactive touch targets strictly >= 44px with safe-area bottom padding.
