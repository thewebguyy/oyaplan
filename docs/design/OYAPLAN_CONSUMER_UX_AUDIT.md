# OyaPlan Consumer UX & Information Architecture Audit

**Document Date:** September 2026  
**Auditor:** Senior Product Designer & Senior Frontend Engineer  
**Objective:** Comprehensive diagnostic and architectural analysis of OyaPlan's Consumer Experience based on beta-tester feedback, usability friction, information density problems, and visual discovery gaps.

---

## 1. Executive Summary & Ground Truth Feedback

A recent beta tester provided raw, actionable feedback after generating a plan on OyaPlan:

> *“This thing is giving me headache.”*  
> *“Nobody has the energy to calm down and read through.”*  
> *“So much details but it is put in a way nobody will read.”*  
> *“The way it was the last time I checked it was way better.”*  
> *“I put a budget for 90k. Why are you reducing it to 14k? If I wanted to spend that amount, I would have put it.”*  
> *“I don't know how possible it is ... where the users get to see what the restaurant looks like, the aesthetics and the menu if possible.”*  
> *“If you can't add the menu, let them know what they can order or how much food and drinks they can get at that price.”*

### The 3 Core Architectural Problems Identified:
1. **The "Audit Report" Problem (Density Without Hierarchy)**: The current plan page presents more than 15 stacked widgets and cards with dense paragraphs of algorithmic explanation, trade-off breakdowns, transport assumptions, and verification stats. It reads like a compliance document rather than an exciting Lagos squad outing.
2. **The "Budget Replacement" Problem (Constraint vs. Target Confusion)**: When a user enters a budget of ₦90,000, and OyaPlan finds a solid option costing ₦14,000, the UI prominently replaces ₦90,000 with ₦14,000 without clearly communicating: *"Your budget: ₦90,000 — Recommended plan: ₦14,000 — ₦76,000 left over"*. The user feels their intent was ignored.
3. **The "Aesthetic & Menu Blindspot" Problem**: Users are making spending and social decisions in Lagos where ambience, vibe, and menu choice are paramount. The current experience lacks visual tangibility (editorial image galleries) and menu tangibility (*“What can we actually order for this amount?”*).

---

## 2. Surface-by-Surface UX Diagnostic

### Surface 1: Plan Presentation (`/plan/[id]` & `/forge`)
* **Current State**:
  * Loads 16 separate components in a single vertical stack: `VenueImage`, Zero-Context explainer, `LedgerCard`, `ReceiptStructure` with nested toggles, `PlanCodeSquadPass`, `RouteCard`, `PlanCTAs`, `SaveAsSquadPrompt`, `PlanVoting`, `RecommendationFeedback`, Beta feedback form, "Create My Own Plan", `WhyWePickedThis`, `BeforeYouGo`, `SpendAccuracyBadge`, `ActualSpendCapture`.
  * The user's original inputs (Budget: ₦90k, Squad: 4 people, Area: Lekki, Vibe: Dinner) are buried or disconnected from the primary total.
  * `WhyWePickedThis` outputs multi-paragraph justifications (`evaluated_count`, candidate rankings) that overwhelm mobile users.
* **Target State**:
  * **Level 1 (Decision - 3 Seconds Scan)**: 
    * Header: *"Friday night in Lekki · 4 people · ₦90,000 budget"*
    * Estimated Total: *"~₦68,500 total · You're within budget (₦21,500 left over)"*
    * Quick Venue Card: Image + Ambience + Primary "Plan This Venue" / Share actions.
  * **Level 2 (Understanding - What can we get?)**:
    * Clean category breakdown: Food (~₦40k), Drinks (~₦12k), Rides (~₦16.5k).
    * *"What ₦40k could look like"* sample orders drawn directly from verified menu data.
  * **Level 3 (Evidence - Expandable on demand)**:
    * Collapsible / accordion drawer for transport assumptions, house taxes, and verification proof.

---

### Surface 2: Venue Detail Page (`/venue/[id]`)
* **Current State**:
  * Functions like a database profile card rather than an aspirational Lagos venue destination.
  * Image presentation is limited to a single cover photo banner.
  * Operating hours and policies are displayed in rigid tabular formats.
  * Lacks horizontal anchor navigation (Overview, Menu, Pricing, Photos, Good to Know).
  * Missing sticky mobile conversion bar.
* **Target State**:
  * **Editorial Hero & Image Grid**: High-impact asymmetric gallery with swipeable mobile preview.
  * **Anchor Navigation**: Clean horizontal sticky bar (`Overview`, `What It Costs`, `Menu`, `Photos`, `Good to Know`).
  * **"What A Visit Could Cost"**: Clear typical spend range per person and for squads of 2, 4, and 6.
  * **"What Can I Get?" Module**: Dynamic scenarios (*With ₦30k / With ₦50k / With ₦80k*) populated strictly from authentic menu items.
  * **Sticky Mobile CTA Bar**: Floating pill with Save + "Plan This Venue".

---

### Surface 3: Consumer Navigation & Authentication
* **Current State**:
  * Generic `NavBar` with "Sign In" button that immediately opens a single modal.
  * No distinction between consumer outing planners and business operators looking to claim or manage listings.
  * Social login (Google) can complete without capturing first/last name or Nigerian mobile number, leaving empty profile attributes.
  * The account menu is a minimal dropdown without clear categorization (Profile, Activity, Saved Spots, Saved Plans, Settings).
* **Target State**:
  * **Deliberate World Selector**: Clicking "Login" opens a visual selector:
    * *OyaPlan for OyaPlanners* (Plan outings, discover places, track squad budget)
    * *OyaPlan for Businesses* (Manage venue, sync menu prices, view planning demand)
  * **Lagos Editorial Visual Cues**: Restrained Nigerian emerald `#008751`, midnight lagoon `#010528`, warm sand `#FAF7F2`, subtle linework without tourist clichés.
  * **Social Auth Completion Flow**: If Google/Apple does not supply full profile details, routes to a clean *"Finish signing up"* step (First Name, Last Name, Phone +234 country selector, Terms consent).
  * **Rich Logged-in Header**: Displays user avatar/initials, with dedicated links to Profile, Activity, Saved Spots, Saved Plans, and Settings.

---

### Surface 4: Saved Spots vs. Saved Plans vs. Recently Viewed
* **Current State**:
  * Saved spots live in `localStorage` (`oyaplan_saved_ideas`), while saved plans live in Supabase (`user_saved_plans`).
  * There is no "Recently Viewed" section on the homepage, causing users who browse multiple venues to lose track of what they just explored.
* **Target State**:
  * **Clear Concept Separation**:
    * **Saved Spots** = Individual venues saved for future inspiration.
    * **Saved Plans** = Generated outing itineraries with budget math and squad links.
  * **Homepage "Places You Checked Out"**:
    * Lightweight, deduplicated horizontal row on the homepage showing the last 4-8 venues the user inspected.
    * Persisted locally for anonymous guests, seamlessly connected for authenticated users.
    * Only renders when the user has actually viewed venues (zero empty space reservation).

---

## 3. Information Density Layering Architecture

| Information Level | User Mindset | What Surfaces Immediately | What Stays Collapsible |
| :--- | :--- | :--- | :--- |
| **Level 1: Decision** | *“Should we do this?”* | Venue name, cover photo, estimated spend vs original budget, room left over, why it fits in 1 sentence. | All formulas, candidate counts, raw database stats. |
| **Level 2: Understanding** | *“What is this experience like?”* | Menu item examples, drinks/food split, ambience photos, parking/dress code basics. | Extended menus with 50+ items. |
| **Level 3: Evidence** | *“How did you calculate this?”* | Tap `How we estimated this` / `Cost breakdown` to view VAT, service charge, transport surge, and partner sync dates. | Fully expanded mathematical ledger tables. |
