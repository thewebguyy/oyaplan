# OyaPlan Identity Lifecycle

This document serves as the canonical reference for how identity flows across the OyaPlan platform. All new features must adhere to this flow to preserve the anonymous-first experience.

## The Anonymous-First Pipeline

1. **Anonymous Visitor**
   - User lands on `oyaplan.com` (potentially via a Referral Link).
   - Edge Middleware intercepts the request, assigns a secure `oya_session_id` UUID, and writes it to a persistent HttpOnly cookie.
   - *Data Created:* `attribution_sessions` (Growth).

2. **Forge & Exploration**
   - User searches for venues and generates plans.
   - *Data Created:* `raw_product_events` (Analytics), `plan_requests` (Analytics). All records log the `session_id`.

3. **Share Plan**
   - User shares the generated plan URL to friends.
   - *Data Created:* `shared_plans`. Sharing requires **no state**; it is entirely anonymous. K-Factor is maximized.

4. **Progressive Trigger (e.g. Save Plan)**
   - The user decides they want to save the plan.
   - The UI intercepts the action and presents the **Magic Link Auth Modal**.

5. **Authentication (Magic Link)**
   - User enters their email and receives a magic link.
   - User clicks the link on their device.
   - Supabase provisions the `auth.users` row and issues a JWT session.

6. **Account Creation & Ownership Transfer (Identity Merge)**
   - The Next.js `/api/auth/callback` endpoint successfully completes the PKCE flow.
   - **Immediately**, the server invokes the `IdentityMergeService`.
   - *Analytics Merge:* All historical `raw_product_events` tied to the cookie `oya_session_id` are explicitly assigned to `auth.users.id`.
   - *Growth Merge:* Any pending referral loops in `attribution_sessions` are credited to `auth.users.id`.
   - *Saved Plan Linked:* The system inserts a row into `user_saved_plans` linking the user's ID to the `shared_plans.id`.

7. **Future Sessions**
   - The user returns via a new device or expired cookie.
   - Their session is reconstructed via the `SessionResolver` utilizing their JWT.
   - The user can seamlessly explore as a `planner`.

8. **Role Escalation (Scout & Venue Owner)**
   - If the user decides to submit price intelligence, the `RoleService` checks if they have the `scout` role. If not, the system grants it, and they begin accruing points in `user_reputation`.
   - If the user claims a business, Operations upgrades their profile to `venue_operator`. The `SessionResolver` automatically issues them authorization to view business portals.
