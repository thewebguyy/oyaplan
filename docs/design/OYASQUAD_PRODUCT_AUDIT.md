# OYAPLAN — OYASQUAD PRODUCT & ARCHITECTURE AUDIT

**Date:** September 2026  
**Status:** Audit Complete — Phase 10 Foundation  
**Auditors:** Senior Product Engineer, Backend Architect, UX Architect & Trust Systems Specialist

---

## 1. EXISTING ARCHITECTURE

OyaPlan currently operates a multi-layered identity and planning stack:
* **Storage / Database**: Supabase PostgreSQL with Row-Level Security (RLS).
* **Identity Platform**: `SessionResolver` (`lib/services/identity/sessionResolver.ts`) resolving authenticated user profiles or anonymous session UUIDs (`oya_session_id`).
* **Planning Engine**: `DefaultCostEngine` (`lib/planning/costEngine.ts`) calculating itemized food/drink spend and Lagos zone transport fares with vehicle batching.
* **Shared Plans**: `shared_plans` (`supabase/migrations/0003_shared_plans.sql`) storing immutable snapshots of generated plans for web link distribution.
* **Groups**: `planning_groups` and `planning_group_members` (`supabase/migrations/0051_planning_groups.sql`) providing schemas for persistent groups.
* **Voting**: `plan_votes` (`supabase/migrations/0030_plan_votes.sql`) tracking session-based upvotes / downvotes on shared plans.

---

## 2. EXISTING GROUP FUNCTIONALITY

* **Implementation**: `GroupService` (`lib/services/identity/groupService.ts`).
* **Capabilities**:
  - `createGroup(name, emoji, initialMemberNames)`: Creates a group owned by an authenticated user.
  - `getUserGroups()`: Lists groups with member counts, plan counts, and latest outing summary.
  - `getGroupDetails(groupId)`: Retrieves group metadata, member records, and attached shared plans.
  - `addMember()`, `removeMember()`, `updateGroup()`: Basic member management.
* **Limits**: Enforces `MAX_GROUPS_PER_USER = 10` and `MAX_MEMBERS_PER_GROUP = 20`.
* **Current Gap**: Groups are strictly tied to authenticated owners (`owner_id = auth.uid()`). A friend receiving a link cannot interact with or join a group without an account.

---

## 3. EXISTING VOTE FUNCTIONALITY

* **Implementation**: `plan_votes` table and `lib/actions/vote.ts`.
* **Capabilities**:
  - Voters are tracked via `voter_session_id` string (from local storage / cookie).
  - Votes are restricted to 3 categories: `'agree'`, `'too_expensive'`, `'different_vibe'`.
  - Unique constraint on `(plan_id, voter_session_id)` ensures idempotent voting per device.
* **Current Gap**: It records feedback on a plan, but does NOT indicate attendance commitment ("I'm in") or update the live squad headcount.

---

## 4. EXISTING SHARED-PLAN FUNCTIONALITY

* **Implementation**: `/plan/[id]` and `lib/queries/plans.ts` (`getSharedPlanWithSpot`).
* **Capabilities**:
  - Publicly accessible via unique UUID without authentication.
  - Displays venue identity, location, verified cost breakdown (Food & Drinks, Transport, Charges/Buffer), and menu highlights.
  - Integrates `PlanCodeSquadPass` for a verifiable Visit Identification Code (`OYA-XXXXXX`).
* **Current Gap**: It is a static, one-way document ("here is what was planned") rather than an interactive group decision room.

---

## 5. EXISTING WHATSAPP FLOW

* **Implementation**: `PlanActionsShare.tsx` and `WhatsAppCopyButton.tsx`.
* **Format**:
  ```text
  *OyaPlan Outing: The House Lagos*

  • *Squad:* 4 people (~₦17,125 each)
  • *Estimated Total Spend:* ~₦68,500
  • *Your Budget:* ₦80,000 (₦11,500 remaining)

  *Verified Breakdown:*
  • Food & Drinks: ₦56,500
  • Estimated Transport (Round-Trip): ₦12,000

  See full breakdown & menu items:
  https://oyaplan.com/plan/4fa1...
  ```
* **Strength**: High open rate, clean text hierarchy, and zero link friction.
* **Opportunity**: The link should route guests to an active decision room where they can tap "I'm in".

---

## 6. EXISTING ANONYMOUS-USER CAPABILITIES

* Anonymous users receive a deterministic `oya_session_id` cookie via middleware.
* Anonymous users can generate plans, view venues, access shared plans, save spots locally (`useSavedSpots`), and submit actual spend reports.
* Anonymous users have read access to `shared_plans`, `spots`, and `plan_votes`.

---

## 7. EXISTING AUTHENTICATION REQUIREMENTS

* **Anonymous Allowed**: Browsing, searching, generating plans, opening shared plans, viewing venue profiles, casting votes, submitting receipts.
* **Authenticated Required**: Creating persistent account profiles, cloud-syncing saved spots across devices, claiming business venues, operating partner dashboards.
* **Squad Mandate**: A friend joining a squad room must **NOT** be forced to authenticate.

---

## 8. EXISTING RLS / SECURITY

* `planning_groups`: Authenticated owners can manage (`auth.uid() = owner_id`).
* `planning_group_members`: Authenticated owners can manage members.
* `plan_votes`: Public insert/select allowed with `voter_session_id` deduplication.
* `shared_plans`: Public insert/select allowed.
* **Security Invariant**: Never allow client-side tampering of squad budget, total costs, or member authorization.

---

## 9. EXISTING PLAN SNAPSHOT BEHAVIOR

* When a plan is created in Forge, a record is written to `shared_plans` capturing `spot_id`, `start_area`, `squad_size`, `budget`, `vibe`, `food_cost`, `transport_cost`, `total_cost`, and `why_it_fits`.
* This snapshot is immutable so that links shared on WhatsApp maintain historical integrity.

---

## 10. EXISTING SQUAD ECONOMICS

* Activity / Dining Cost = `(price_per_person * squadSize)`.
* Total Outing Cost = `Activity Cost + Transport Cost + Mandatory Service Charges / Buffer`.
* Per-Person Share = `Total Cost ÷ Current Headcount`.

---

## 11. EXISTING TRANSPORT SCALING

* Implemented in `lib/planning/transport.ts` (`calculateZoneFare`).
* Vehicle capacity formula:
  $$\text{Vehicles Required} = \left\lceil \frac{\text{Squad Size}}{4} \right\rceil$$
* 1 to 4 people = 1 ride-hailing vehicle.
* 5 to 8 people = 2 vehicles (transport cost doubles).
* 9 to 12 people = 3 vehicles.

---

## 12. EXISTING TABLE POLICY BEHAVIOR

* Implemented in `lib/planning/tablePolicyValidation.ts`.
* Identifies group size thresholds where venues require fixed minimum spend per table or group cover charges.

---

## 13. EXISTING TRUST MODEL

* Preserves strict trust vocabulary: **Verified**, **Estimated**, **Limited data**, **Reported spend**.
* Prohibits misleading claims: "Guaranteed", "Exact", "10% VAT".
* Disclaims reservations: Squad Pass is a *Visit Identification Code*, not a table reservation.

---

## 14. EXISTING ACTUAL-SPEND MODEL (PHASE 9)

* Post-outing contribution loop (`/plan/[id]?feedback=true` or `/venue/[id]?feedback=true`).
* Captures actual bill total, squad size, receipt evidence, and dish breakdown to improve OyaPlan's baseline estimates.

---

## 15. WHAT IS GENUINELY REUSABLE

1. `DefaultCostEngine` and `calculateZoneFare` for live headcount cost recalculation.
2. `shared_plans` table for immutable plan parameters.
3. `SessionResolver` and anonymous session cookies for visitor tracking.
4. `WhatsAppCopyButton` logic for formatted distribution.
5. `PlanCodeSquadPass` for visit identification tokens.

---

## 16. WHAT IS INCOMPLETE

1. **Interactive Participation**: No mechanism for a guest friend to enter their name and toggle "I'm in" on a shared plan.
2. **Dynamic Squad Headcount**: When 3 out of 5 friends confirm, the per-person cost does not dynamically adjust on the shared room view.
3. **Squad Room Interface**: `/plan/[id]` is purely an itinerary sheet; it lacks a dedicated "Decision & Attendance" state.

---

## 17. WHAT SHOULD BE REMOVED / DEFERRED

* **DO NOT BUILD NOW**:
  - Blind budget consensus engine.
  - Multi-option voting showdowns (A vs B vs C) with countdown timers.
  - In-app payment collection, bank account storage (GTBank/Kuda), and wallet settlement.
  - Social graphs, squad follower feeds, chat, or gamified badges.

---

## 18. PROPOSED OYASQUAD V1.5 ARCHITECTURE

```
┌────────────────────────────────────────────────────────┐
│ 1. PLANNER SHARES                                      │
│    Planner builds plan on Forge → taps "Share Squad"   │
│    Generates WhatsApp message with link to /squad/[id] │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. SQUAD ROOM (/squad/[id] or /plan/[id]?squad=true)   │
│    Friend opens link on mobile browser.                │
│    Sees: Venue, Time, ~₦68,500 total (~₦17,125 each),  │
│          Current Headcount: 2 of 4 In.                 │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. 1-TAP GUEST JOIN                                    │
│    Guest enters Display Name ("Bode") → taps "I'm in"  │
│    Secure participant token issued via session cookie. │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. LIVE HEADCOUNT & COST SYNC                          │
│    Headcount increments (e.g. 2 → 3 confirmed).        │
│    CostEngine recalculates per-person share.           │
│    Transport capacity updates if threshold crossed.    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 5. DECISION CONFIRMED → OUTING                         │
│    Planner sees actual attendance.                     │
│    Squad accesses full Plan & Venue details.           │
└────────────────────────────────────────────────────────┘
```

---

## 19. PROPOSED FUTURE V2 ARCHITECTURE (DOCUMENT ONLY)

* **V2.1**: Anonymous Blind Budget Consensus (sweet-spot overlap calculation).
* **V2.2**: 3-Option Showdown Voting.
* **V2.3**: Split & Settle Bank Account Details Copy (read-only settlement helper).
* **V2.4**: Persistent Squad Circles for recurring friend groups.

---

## 20. RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Guest Impersonation** | Malicious participant toggling another person's RSVP | Store cryptographically secure `participant_token` in cookie upon join. |
| **Duplicate Membership** | Same person tapping multiple times creates multiple rows | Deduplicate by participant session token; update existing row if name changes. |
| **Price Confusion** | Recalculated cost mistaken for venue price hike | Explicit UI callout: "Per-person share adjusted for current confirmed headcount". |
| **Network Failure** | Unstable Lagos LTE drops RSVP | Optimistic UI update with retry capability and clear error toast. |

---

## 21. OPEN QUESTIONS

1. *Should the Squad Room live at `/squad/[id]` or within `/plan/[id]`?*  
   **Decision**: Implement `/squad/[id]` as a dedicated, focused decision room that deep-links to `/plan/[id]` for the complete itinerary.
2. *How long does a squad stay active?*  
   **Decision**: Squads remain active for 14 days from creation, after which they transition to an archived state.

---

## 22. EVIDENCE NEEDED BEFORE V2 EXPANSION

Before building Blind Budget or Multi-Option Voting, we must observe:
1. **Link Open Rate**: At least 40% of generated squad links opened by secondary devices.
2. **Participation Rate**: At least 30% of squad link visitors tap "I'm in".
3. **Multi-Person Consensus**: At least 25% of squads achieve $\ge 2$ confirmed attendees.
