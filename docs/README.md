# OyaPlan Documentation

## Structure

| Folder | Contents | Authority |
|---|---|---|
| `docs/product/` | The five approved product strategy documents (MVP Scope, Launch Playbook, Growth Roadmap, Data Operations Playbook, Business Roadmap). | Canonical product strategy. |
| `docs/decisions/` | Architecture Decision Records, numbered `0001`–`NNNN` in chronological order. | Canonical technical/architecture decisions. |
| `docs/architecture/` | Standing reference documents for how a cross-cutting system works (e.g. identity lifecycle). | Reference — kept in sync with the codebase, not a decision log. |
| `docs/archive/` | Superseded or unreliable historical documents, kept for record only. | **Not authoritative.** See `docs/archive/README.md`. |
| `supabase/SPOT_DATA_GUIDE.md` | Operational policy for the sparse transport-matrix override field. | Canonical, scoped to that one policy. |

## Source-of-truth hierarchy

When documents disagree, resolve in this order:

1. **The codebase and current database schema** — what's actually running is the ground truth for "what is implemented."
2. **`CLAUDE.md`** (repository root) — the engineering charter: invariants, conventions, security rules, and the process for how AI-assisted engineering work happens in this repo.
3. **`docs/product/*`** — the approved product strategy: what OyaPlan is supposed to become.
4. **`docs/decisions/*`** — why a given technical approach was chosen, and what would have to change to revisit it.
5. **`docs/architecture/*`** — how a system currently works, for onboarding/reference.
6. **`docs/archive/*`** — historical record only. Never treat as current fact without checking against 1–5.

`CLAUDE.md` and `docs/product/` are not always in agreement today — see `docs/product/README.md` for the specific, currently-open conflicts between the two. Those require an explicit product decision to resolve; do not silently pick a side by editing code or invariants.
