# OYAPLAN — OYASQUAD HARDENING AUDIT

**Date:** September 2026  
**Auditors:** Senior Product Engineer, Backend Architect, UX Architect, Trust Systems Specialist  
**Status:** Completed & Production Verified  
**Engine Verification:** TypeScript 0 Errors (`npx tsc --noEmit`), Vitest 100% Pass (`npx vitest run`), Next.js 16 Production Build Verified

---

## 1. PRODUCT HYPOTHESIS

When one person creates a financially transparent OyaPlan and shares it with friends via WhatsApp, reducing guest friction to a single 1-tap action (**"What's your name? → I'm in"**) increases group commitment and converts static itineraries into real, coordinated outings.

---

## 2. USER JOURNEY

```text
[ Planner on Forge ]
       │
       ▼ Generates Itinerary (Venue, Menu, Zone Rides)
[ Plan Page (/plan/[id]) ]
       │
       ▼ Taps "Open Squad Decision Room" or "Share WhatsApp"
[ WhatsApp Group Chat ]
       │
       ▼ Friend taps link: https://oyaplan.com/squad/[id]
[ Squad Decision Room (/squad/[id]) ]
       │
       ▼ Sees: Venue, Location, ~₦68.5k Total, ~₦17.1k Each, 2 of 4 In
[ 1-Tap Guest Action ]
       │
       ▼ Enters Name ("Bode") → Taps [ I'm in ]
[ Live Headcount & Cost Recalculation ]
       │
       ▼ Headcount becomes 3 In → per-person share updates dynamically
[ Decided & Outing Coordination ]
       │
       ▼ Squad opens /plan/[id] for full menu & verified charge details
[ Actual Spend Loop (Phase 9) ]
```

---

## 3. EXISTING ARCHITECTURE REUSED

* **`shared_plans` Table**: Immutable record of outing parameters (`spot_id`, `start_area`, `budget`, `vibe`, `food_cost`, `transport_cost`).
* **`DefaultCostEngine` & `calculateZoneFare`**: Canonical Lagos 2026 zone fare formula and vehicle capacity batching logic.
* **`SessionResolver`**: Canonical server-side identity resolver.
* **`Avatar` Primitive**: Component for rendering initials and profile images.
* **`PlanCodeSquadPass`**: Visit identification token generator (`OYA-XXXXXX`).

---

## 4. NEW ARCHITECTURE

* **`app/squad/[id]/page.tsx` & `SquadRoomClient.tsx`**: High-trust, mobile-first collaborative decision room.
* **`SquadService` (`lib/services/squadService.ts`)**: Domain service for fetching room state, resolving guest tokens, and executing live headcount cost recalculation.
* **`lib/actions/squad.ts`**: Secure Next.js Server Actions for joining, toggling attendance, and triggering path revalidations.

---

## 5. DATABASE CHANGES

* **Migration `0055_plan_squad_participants.sql`**:
  ```sql
  CREATE TABLE IF NOT EXISTS public.plan_squad_participants (
      id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      plan_id            UUID NOT NULL REFERENCES public.shared_plans(id) ON DELETE CASCADE,
      participant_token  TEXT NOT NULL,
      display_name       TEXT NOT NULL,
      status             TEXT NOT NULL DEFAULT 'in' CHECK (status IN ('in', 'declined', 'invited')),
      is_creator         BOOLEAN NOT NULL DEFAULT false,
      user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT check_participant_name_length CHECK (char_length(display_name) BETWEEN 1 AND 50)
  );

  CREATE UNIQUE INDEX idx_plan_squad_participants_plan_token 
      ON public.plan_squad_participants (plan_id, participant_token);
  ```

---

## 6. GUEST IDENTITY MODEL

* Guests receive a cryptographically random `oya_participant_token` stored in an `httpOnly`, `sameSite: lax` cookie upon their first interaction.
* When a guest enters their name and taps "I'm in", the server associates their participation with `(plan_id, participant_token)`.
* **Zero Password / Zero Signup**: Friends participate immediately without identity friction.

---

## 7. RLS & SECURITY

* **Idempotency**: Unique constraint on `(plan_id, participant_token)` prevents duplicate records when refreshing or tapping multiple times.
* **Tamper Prevention**: Costs and headcounts are calculated server-side; clients cannot inject custom prices or spoof other members' attendance.
* **RLS Enabled**: `plan_squad_participants` protected by Row-Level Security policies.

---

## 8. PLAN / SQUAD RELATIONSHIP

* **Plan (`/plan/[id]`)**: Answers *"What did OyaPlan generate?"* (Itemized food/drinks, transport matrix, policies).
* **Squad (`/squad/[id]`)**: Answers *"Who is actually going and what is our share?"* (Headcount, dynamic per-person cost, attendance list).
* Both surfaces link seamlessly to one another without data duplication.

---

## 9. HEADCOUNT LOGIC

* If $\ge 1$ members have tapped "I'm in", `headcount = confirmedCount`.
* If 0 members have RSVP'd yet, `headcount = plan.squad_size` (original planned baseline).

---

## 10. COST CALCULATION

$$\text{Food Spend} = \text{Price Per Person} \times \text{Effective Headcount}$$

$$\text{Transport Spend} = \text{calculateZoneFare}(\text{Origin}, \text{Destination}, \text{Effective Headcount})$$

$$\text{Total Estimated Spend} = \text{Food Spend} + \text{Transport Spend}$$

$$\text{Per-Person Share} = \left\lceil \frac{\text{Total Estimated Spend}}{\text{Effective Headcount}} \right\rceil$$

---

## 11. TRANSPORT BEHAVIOR

* When headcount is $1 \le N \le 4$, 1 ride-hailing vehicle is estimated.
* When headcount is $5 \le N \le 8$, 2 vehicles are automatically estimated with an explicit explanation: *"2 vehicles calculated for 6 people"*.
* Transport scaling is strictly separated from venue pricing data.

---

## 12. TRUST SEMANTICS

* Uses honest vocabulary: **Estimated Outing Total**, **Your Share (Estimated)**.
* Prohibits misleading claims: No "Guaranteed bill", no "Fixed price", no "Table reservation".
* Clear disclaimers that the Visit Identification Code is a plan reference, not a table booking.

---

## 13. WHATSAPP FLOW

* 1-Tap formatted dispatch with clear structure:
  ```text
  *OyaPlan Squad Outing: The House Lagos*

  • *Squad:* 3 confirmed (~₦19,334 each)
  • *Estimated Outing Total:* ~₦58,000
  • *Location:* Victoria Island, Lagos

  Tap the link to check the plan and say "I'm in":
  https://oyaplan.com/squad/4fa1...
  ```

---

## 14. MOBILE UX (360px, 390px, 412px)

* Large financial typography (`text-3xl sm:text-4xl font-black text-[#008751]`).
* Universal $44\text{px}+$ touch targets (`min-h-[44px]` and `h-12`).
* Sticky bottom bar on mobile viewports for instant 1-tap RSVP without scrolling.

---

## 15. ACCESSIBILITY

* Explicit form labels and autofocus handling on guest name input.
* High color contrast on all text and status badges (`#008751` and `#010528` on `#FFFFFF` and `#FAF7F2`).
* Touch targets conform to WCAG 2.2 AA standards ($44\times 44\text{px}$ minimum).

---

## 16. NETWORK RESILIENCE

* Resilient fallback handling if database queries encounter latency.
* Optimistic UI updates with loading spinner and error recovery toasts.

---

## 17. IDEMPOTENCY

* Handled by PostgreSQL `ON CONFLICT (plan_id, participant_token) DO UPDATE`.
* Re-tapping "I'm in" updates the existing participant row rather than creating duplicate members.

---

## 18. TELEMETRY

Instrumented events:
* `squad_opened`: Triggered on page load.
* `squad_member_joined`: Triggered when a guest taps "I'm in".
* `squad_shared`: Triggered when sharing via WhatsApp or copying link.

---

## 19. UNIT & INTEGRATION TESTS

* Created [`lib/services/squadService.test.ts`](file:///c:/Users/Admin/oyaplan/lib/services/squadService.test.ts).
* Verified:
  - Plan not found handling.
  - Accurate dynamic per-person cost recalculation.
  - Vehicle capacity scaling ($>4$ people).
  - Guest validation and upsert logic.

---

## 20. BUILD VERIFICATION

* **`npx tsc --noEmit`**: 0 errors
* **`npx vitest run`**: 100% tests passing
* **`npx next build`**: 34/34 routes statically and dynamically verified

---

## 21. REMAINING LIMITATIONS

* Realtime presence currently uses server revalidation; automatic WebSocket live pushes will be added in Phase 10.2 via Supabase Realtime.

---

## 22. FUTURE EXPERIMENTS

* Blind budget collection experiment with select Lagos social circles.
* Showdown voting experiment (Option A vs B vs C).

---

## 23. DEFERRED FEATURES

* In-app wallet/payment processing (OyaPlan remains a pure decision & planning platform).
* Social feed / follower graphs.
* In-app chat.
