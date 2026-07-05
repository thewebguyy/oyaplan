# ADR 0001: Anonymous-First Identity Model

## Status
Accepted

## Context
OyaPlan aims for frictionless onboarding. The primary value proposition (total landed cost for group outings) must be experienced before asking users to create an account. However, users still need to save preferences, save generated plans, and track their referral virality.

## Decision
We will implement an Anonymous-First Identity Model using a `SessionResolver` service.
1. Every unique visitor receives an anonymous session ID stored securely via HttpOnly cookies.
2. All database mutations (e.g., `saved_plans`, `user_preferences`) relate to this session ID rather than a formal user UUID.
3. Upon formal authentication (e.g., Supabase Auth), the `SessionResolver` will execute an `identity merge` workflow, transferring all anonymous associations to the authenticated user UUID.

## Consequences
- **Positive**: Zero-friction onboarding. Immediate time-to-value.
- **Positive**: High virality, as users can share plans without logging in.
- **Negative**: Increased complexity in the database schema (records must support either session IDs or user IDs).
- **Negative**: Risk of orphaned data if anonymous users never return or clear their cookies. Data retention policies must eventually clean up stale anonymous records.
