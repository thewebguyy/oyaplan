# ADR-001: Standardize on Supabase Auth as the Authentication Platform

**Status:** Accepted  
**Date:** 2026-06-29  
**Deciders:** Technical Founder  
**Supersedes:** N/A  
**Superseded by:** N/A

---

## Context

OyaPlan is a pre-revenue Lagos startup running on a deliberately minimal stack: Next.js 16, Supabase PostgreSQL, and Vercel. The product is anonymous-first — users generate plans without accounts, and the vast majority of the product requires no authentication whatsoever.

However, two surfaces require authenticated access:

1. **The admin dashboard** (`/admin`) — an internal analytics tool showing plan requests, operator inquiries, tester feedback, and spot pricing health. Accessed only by the founding team.
2. **The operator portal** (planned, Month 3 roadmap) — a self-service interface where venue owners manage their listings, view performance data, and update pricing.

The admin dashboard shipped with a query-parameter authentication mechanism: `/admin?key=YOUR_KEY`. This compares the URL parameter against an environment variable (`ADMIN_KEY`). It is documented as a known critical weakness in the engineering charter.

The need to replace this mechanism, combined with the upcoming operator portal requirement, made this a natural moment to make an explicit, documented decision about the authentication platform for the entire project.

---

## Problem

Query-parameter authentication is not authentication. It is a temporary gate that fails in the following ways:

**Credential exposure through normal usage.** The secret key appears in browser history on every device that has ever accessed the admin panel. It appears in Vercel access logs, Supabase request logs, any CDN or analytics tool capturing full URLs, browser autocomplete, and any screenshot taken while on the admin page. There is no realistic threat model under which a URL parameter secret remains secret with regular use.

**No session revocation.** If the key is compromised, the only response is to rotate `ADMIN_KEY` in the Vercel environment, redeploy, and update every bookmark. There is no way to invalidate a specific device or session.

**Does not compose.** The query-parameter approach cannot be extended to support multiple users, roles, or per-session audit logs. Building an operator portal on top of this mechanism is not possible.

The question was not *whether* to replace it, but *what to replace it with* — and whether to make a broader platform decision at the same time or make two separate smaller decisions.

---

## Alternatives Considered

### Alternative A: Custom HMAC-signed HttpOnly cookie

A stateless approach: the server verifies a password, issues a cookie containing a HMAC-signed token (using the Web Crypto API), and re-verifies the signature on each admin request. The token encodes an expiry timestamp.

**Why it was considered.** No new dependencies. ~120 lines of code. Familiar pattern. Immediately solves the query-parameter problem.

**Why it was rejected.**

*Custom cryptographic code carries maintenance risk that grows over time.* The implementation surface for stateless token auth — algorithm selection, key derivation, timing-safe comparison, base64 encoding, expiry enforcement — is small but precise. Each step has a subtly wrong implementation that appears correct. Unlike application logic, cryptographic bugs can be silently exploited for weeks before detection. We are not in the business of writing authentication infrastructure.

*It cannot revoke sessions.* Stateless tokens cannot be individually invalidated. If a laptop is compromised, the only response is rotating the signing secret, which invalidates every session simultaneously. This is an acceptable operational trade-off for a prototype, not for a production product handling operator PII.

*It does not compose.* This approach supports exactly one shared password. The moment a second admin, an operator-specific role, or a per-user audit trail is needed, the entire implementation must be replaced. Given that the operator portal is already on the Month 3 roadmap, choosing this option means building auth twice.

*Low apparent complexity hides high real complexity.* 120 lines that correctly implement a signing scheme are worth more than 120 lines of feature code. They require more careful review, carry more failure modes, and create a category of technical debt — "custom security code" — that is harder to reason about over time.

### Alternative B: Third-party auth library (NextAuth, iron-session, etc.)

NextAuth (now Auth.js) and iron-session are popular Next.js authentication packages.

**Why they were not chosen.** Both introduce a new vendor dependency for functionality that Supabase already provides. `iron-session` is stateless cookie encryption — similar security trade-offs to the HMAC approach. NextAuth is a full framework that solves multi-provider OAuth, email magic links, and multi-tenant role systems — appropriate at scale, but adds ~200KB of dependencies and significant configuration complexity for a single-admin internal tool at pre-revenue stage. More importantly, using NextAuth alongside Supabase means two data layers for auth — NextAuth manages sessions in its own store while Supabase manages everything else. This violates the project invariant that Supabase is the only data store.

### Alternative C: Supabase Auth (chosen)

Supabase ships a complete authentication system as part of the platform. It handles password hashing (bcrypt), session storage (server-side in Supabase's managed `auth` schema), JWT signing, token refresh, and session revocation. The SSR-compatible client (`@supabase/ssr`) is the officially supported package for Next.js App Router.

---

## Decision

**OyaPlan standardizes on Supabase Auth as the authentication platform for all authenticated surfaces.**

This decision applies to:
- The admin dashboard (implemented as part of this ADR's associated work)
- The future operator portal
- Any other authenticated surface introduced in the future

### Rationale

**Platform consistency.** The engineering charter's invariant is that Supabase is the only data store. Supabase Auth stores sessions in Supabase's managed `auth` schema — not in a separate vendor, not in a separate database. Using Supabase Auth is not adding a new platform dependency; it is using more of the platform we are already committed to.

**`@supabase/ssr` is an upgrade, not a new dependency.** The project currently uses `@supabase/supabase-js`, which is not designed for server-side cookie handling in Next.js App Router. `@supabase/ssr` is the official Supabase package that adds this capability. It comes from the same vendor, uses the same API surface, and is the recommended migration path for any Supabase project using Next.js App Router. Installing it resolves a pre-existing architectural gap, not a new requirement.

**Lowest long-term engineering cost.** Session refresh, password hashing, token signing, and security patching are handled by Supabase's team. When a vulnerability is found in their session implementation, it is patched via a package update. With custom HMAC code, we find it ourselves — or more likely, someone else finds it for us. The recurring cost of maintaining custom security code is higher than the one-time cost of setting up Supabase Auth correctly.

**Session revocation.** Supabase Auth sessions are server-side. A compromised device can be signed out from the Supabase dashboard immediately, without affecting other sessions or rotating any secrets. This is a meaningful operational capability for a production system handling operator PII.

**Future compatibility.** The operator portal requires authentication. If Supabase Auth is in place for the admin dashboard, extending it to operators is additive — new users, new roles, same infrastructure. If a custom HMAC system is in place, it must be replaced before the operator portal can be built, creating two implementation cycles and a transition risk window.

### What this decision does not change

- OyaPlan remains anonymous-first for end users. Supabase Auth is used exclusively for internal and operator-facing authenticated surfaces. Generating a plan requires no account. This is unchanged.
- The product's anonymous insert flows (`plan_requests`, `shared_plans`, etc.) are unaffected. Supabase Auth does not alter RLS policies on these tables.

---

## Implementation

### Operational prerequisite (one-time, manual)

Create one admin user in the Supabase dashboard under **Authentication → Users → Invite user**. Use a strong, unique password stored in a password manager. No migration is required — Supabase manages the `auth` schema independently.

### Code changes

| Component | Change |
|---|---|
| `@supabase/ssr` | Added as a dependency |
| `lib/supabase.ts` | Add `createServerClient` factory for SSR use alongside existing anon client |
| `middleware.ts` | New — refreshes Supabase Auth session on every request |
| `app/admin/login/page.tsx` | New — email/password login form |
| `lib/actions/adminAuth.ts` | New — `signInAdmin()` and `signOutAdmin()` Server Actions |
| `app/admin/page.tsx` | Replace `searchParams` key check with `supabase.auth.getUser()` |
| `.env.example` | New — documents all environment variables |

### Environment variables

`ADMIN_KEY` is retired as an authentication mechanism. No new environment variables are introduced — Supabase Auth uses the existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` credentials. The admin user's credentials are managed in Supabase's Auth dashboard, not in environment variables.

---

## Consequences

### Positive

- The query-parameter authentication weakness is eliminated
- Admin sessions are revocable
- Authentication infrastructure is provided and maintained by Supabase
- The operator portal can use the same authentication system without rework
- No custom cryptographic code in the codebase

### Negative

- One additional package (`@supabase/ssr`) is now a project dependency
- A Next.js middleware file is now required to handle session refresh on every request
- The admin user must be created manually in the Supabase dashboard (one-time operational step)
- Supabase Auth adds a dependency on Supabase's auth service availability — if Supabase Auth is down, admin login fails. Given that the admin dashboard already depends entirely on Supabase for its data, this does not materially change the operational dependency profile.

### Neutral

- `ADMIN_KEY` remains in the environment as a secret for potential non-auth uses (e.g., internal API verification), but it no longer serves as the authentication gate for the admin dashboard

---

## Future Implications

### Operator portal (Month 3)

When the operator portal is built, new operator users are created in Supabase Auth. RLS policies on relevant tables (`spots`, `operator_inquiries`) are extended to check `auth.uid()` against an operator's claimed listings. No new auth infrastructure is needed. This is additive work on a proven foundation.

### If OyaPlan adds end-user accounts

If the product introduces optional user accounts (e.g., save your plans), the same Supabase Auth infrastructure applies. End-user accounts would be a separate Supabase Auth flow — sign up / magic link rather than admin invite — but using the same platform. This decision does not create any conflict with optional end-user auth in the future.

### If Supabase Auth becomes insufficient

The scenarios under which Supabase Auth would need to be replaced are narrow: multi-tenant enterprise SSO requirements, SAML integration, or a decision to migrate off Supabase entirely. None of these are on the foreseeable roadmap. If they arise, the replacement decision will supersede this ADR.

---

## References

- [Supabase Auth documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR package for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- CLAUDE.md — "Supabase is the only data store"
- CLAUDE.md — Known Technical Debt: "Admin auth via query param | Critical | Replace with cookie session (Month 1)"
