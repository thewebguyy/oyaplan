# Product Documentation — Canonical Source

The five documents in this folder are the **approved product strategy** for OyaPlan:

- `mvp-scope.md`
- `launch-playbook.md`
- `growth-roadmap.md`
- `data-operations-playbook.md`
- `business-roadmap.md`

They are the source of truth for **what OyaPlan is supposed to become**. `CLAUDE.md` (repository root) remains the source of truth for **how engineering work is executed day to day** — coding conventions, security rules, and a small set of invariants that currently govern the live codebase.

## Known conflicts between this strategy and `CLAUDE.md`

As of this writing, three points in the approved strategy above run directly against invariants `CLAUDE.md` treats as non-negotiable. Both documents are checked in; neither has been silently reconciled. **Do not resolve these by editing code or invariants unilaterally** — they require an explicit Product decision, per `CLAUDE.md`'s own escalation rule ("Stop and ask before... implementing something where two reasonable approaches exist").

1. **Onboarding identity model.** `mvp-scope.md` §2.1/§2.6 requires mandatory phone/OTP signup before a user's first plan. `CLAUDE.md` Invariant #4 requires anonymous-first usage with no required account. The current codebase is anonymous-first (email magic-link / Google OAuth are optional, post-hoc); no phone/OTP exists anywhere.
2. **Monetization model.** `business-roadmap.md` §1.1/§2 names a user-facing premium subscription (₦3k–5k/yr) as Revenue Stream #1. `CLAUDE.md`'s Revenue Model section states operator subscriptions are "the only revenue model... there is no user subscriptions." Neither is currently built.
3. **Matching engine shape.** `mvp-scope.md` §2.2 describes a multi-stop Outing Builder (sequential venues with a running cost total). The live matching engine (`lib/services/matching/forgeMatcher.ts`) returns single-venue recommendations only, and `CLAUDE.md` gates any change to that engine's core behavior behind explicit sign-off.

A fourth item to be aware of, not a conflict but a gap: `business-roadmap.md` §1.1 lists AI-based "Smart suggestions" as a premium feature, while `CLAUDE.md` Invariant #8 forbids AI in the synchronous forge request path. There's a dormant, fully-mocked AI module (`lib/services/ai/`) with zero real imports anywhere in the app — it isn't wired into anything today, but if this feature is ever built, `CLAUDE.md`'s own carve-out requires it to run as a background job, never inline in the forge flow.

## Source-of-truth hierarchy

See `docs/README.md` for how this folder fits into the rest of the repository's documentation.
