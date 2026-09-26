# OYASQUAD — FUTURE PRODUCT & ARCHITECTURE ROADMAP

**Status:** Strategic Architecture Document  
**Date:** September 2026  
**Guiding Principle:** "Do not build the future before the present proves itself."

---

## 1. THREE-TIER PRODUCT PRIORITIZATION

To prevent feature bloat and ensure capital/engineering efficiency, all OyaSquad initiatives are categorized into three explicit buckets:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BUILD NEXT (Immediate Post-V1.5 Fast Follows)            │
│    High-conviction refinements directly extending the loop. │
├─────────────────────────────────────────────────────────────┤
│ 2. EXPERIMENT FIRST (Hypothesis Testing Required)           │
│    Features requiring behavioral proof before engineering.  │
├─────────────────────────────────────────────────────────────┤
│ 3. DO NOT BUILD YET (Explicit Guardrails)                   │
│    Features that distract from core decision intelligence.  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. TIER 1: BUILD NEXT

These items directly support the core coordination loop (`/squad/[id]`):

### 1.1 Realtime Headcount Presence (Supabase Realtime)
* **Goal**: Instant live visual updates when a friend taps "I'm in" without needing a page refresh.
* **Architecture**: Lightweight Supabase Postgres Broadcast channel listening to `plan_squad_participants` updates on `plan_id`.
* **Standard**: Zero websocket bloat; fallback to polling / manual reload on spotty networks.

### 1.2 Multi-Option Itinerary Showdown
* **Goal**: When a planner generates 2 or 3 distinct options (e.g. *Option A: Lekki Dinner*, *Option B: VI Lounge*), squad members can cast a 1-tap blind preference vote.
* **Prerequisite**: Prove that single-plan squad rooms achieve $>30\%$ friend participation first.

### 1.3 Split & Settle Bank Account Helper (Non-Custodial)
* **Goal**: Eliminate awkward end-of-night bill math without handling customer money.
* **Architecture**: Host adds their preferred account number (e.g. *GTBank / Kuda*), generating a 1-tap "Copy Account Details + Exact Share Amount" card for squad members.
* **Boundary**: OyaPlan does **NOT** process payments, hold funds in escrow, or operate a digital wallet.

---

## 3. TIER 2: EXPERIMENT FIRST

These features will **NOT** be built until quantitative and qualitative validation is achieved:

### 2.1 Blind Budget Consensus Engine
* **Hypothesis**: *Friends under-report or avoid committing to outings because disclosing their personal budget ceiling publicly in WhatsApp creates social anxiety.*
* **Experiment Protocol**:
  1. Manually test a "blind budget slider" with 20 real Lagos social circles.
  2. Measure whether anonymous budget collection reduces group planning drop-off.
* **Trigger to Build**: $>60\%$ of test participants express higher comfort planning via blind input.

### 2.2 Persistent Squad Circles (Squad Memory)
* **Hypothesis**: *Users repeatedly plan outings with the same 3–6 people (e.g. "Friday Boys", "The Girls", "Work Lunch") and want saved group profiles with pre-set dietary preferences and neighborhood affinities.*
* **Trigger to Build**: $>25\%$ of active planners create $\ge 3$ outings with identical member names over 60 days.

### 2.3 Decision Countdown Deadline
* **Hypothesis**: *Setting a strict decision cutoff (e.g. "Deciding by 6:00 PM today") accelerates commitment and reduces weekend flaking.*
* **Trigger to Build**: Evidence that squads with time-sensitive plans convert faster than open-ended plans.

---

## 4. TIER 3: DO NOT BUILD YET (EXPLICIT GUARDRAILS)

The following concepts are explicitly forbidden from the current product scope:

| Forbidden Feature | Rationale |
| :--- | :--- |
| **In-App Payment Processing / Escrow** | Introduces heavy CBN/fintech regulatory burden, AML compliance, chargeback liabilities, and distracts from decision intelligence. |
| **In-App Chat / Messaging** | WhatsApp is already the undisputed communication layer for Nigerian groups. OyaPlan integrates with WhatsApp, never competes with it. |
| **Social Graph / Follower Feeds** | OyaPlan is a high-trust utility, not Instagram. Outing plans are intimate and private to the group. |
| **Gamification / Badges / "OyaPoints"** | Diminishes financial seriousness and trust. Budget Confidence is the reward. |
| **AI Group Chatbots / Automated Personas** | Creates friction and fake consensus. Real friends make real spending decisions. |

---

## 5. NORTH-STAR METRICS FOR SQUAD EXPANSION

No Tier 2 feature will enter development until the following baseline funnel is healthy:

$$\text{Squad Conversion Rate} = \frac{\text{Squads with } \ge 2 \text{ Confirmed Attendees}}{\text{Total Shared Plans Generated}} \ge 25\%$$

$$\text{Guest Activation Rate} = \frac{\text{Guests Tapping "I'm In"}}{\text{Unique Visitors to /squad/[id]}} \ge 30\%$$
