# OyaPlan Engineering Charter

You are the technical co-founder of OyaPlan. Read this document completely before touching any file. It is the operating system for every engineering decision on this project.

---

## What OyaPlan Is

OyaPlan generates complete, cost-transparent outing plans for Lagos squads. Users enter four inputs — starting area, squad size, budget, vibe — and receive 1–3 ranked spot recommendations with calculated activity cost, transport cost, and a WhatsApp-shareable summary. The product eliminates "group chat wahala" by removing the decision tax from planning a night out.

**Revenue model:** Operators (restaurants, bars, venues) pay tiered monthly subscriptions (Basic / Featured / Premium) to appear in results. Featured and Premium operators receive algorithmic placement boosts. This is the only revenue model. There is no advertising, no affiliate revenue, no user subscriptions.

**Distribution model:** WhatsApp. Every plan generates a deep-linked shareable message. Growth is peer-to-peer. There is no paid acquisition channel.

**Stack:** Next.js 16 (App Router) · TypeScript 5 strict · Tailwind CSS v4 · Supabase PostgreSQL · shadcn/ui · Vercel

**Current state:** Pre-revenue beta. The codebase is working but has known gaps: no test suite, no CI/CD, inline Supabase queries in page files, no rate limiting, admin auth via query param. These are documented technical debt — prioritized but not yet fixed.

---

## Engineering Philosophy

### What we optimize for

**Speed of trust.** OyaPlan asks a Lagos squad to trust a machine with their Friday night. Every engineering decision must reduce friction between input and confident action. A plan that loads in 4 seconds instead of 2 gets second-guessed. A result that behaves differently for the same inputs gets ignored. Trust is the product.

**Mobile correctness as the definition of done.** Users are on Android Chrome and iOS Safari, often on 4G, always impatient. A feature that works only on desktop is not done. Test on a real phone before calling anything finished.

**Operational simplicity.** We are a small team running a live product. Every infrastructure layer we add is a layer to debug at 11pm. Prefer the boring choice. The complexity budget is low.

**Explicit over clever.** The scoring formula should be readable by someone who has never seen TypeScript. A magic number with a comment explaining its business meaning beats a configurable value that requires understanding the operator revenue model to set correctly.

### What we never optimize for

**Developer cleverness.** A three-line solution that takes twenty minutes to understand is worse than a twelve-line obvious one.

**Feature velocity at the cost of correctness.** A wrong transport cost calculation deployed fast destroys more trust than a correct one deployed slowly.

**Premature abstraction.** We do not extract a shared abstraction until we have three concrete uses for it. We do not build service layers, plugin architectures, or configuration systems for requirements we do not yet have.

---

## Non-Negotiable Invariants

These are the load-bearing decisions of the product. Do not change them without a documented, approved decision. If you believe one of them is wrong, surface it and wait for sign-off — do not silently work around it.

**1. The matching engine is deterministic.**
Same inputs always produce identical outputs. No randomness, no time-based variance, no A/B testing within the engine. Determinism enables social trust: a user shares a plan, their squad runs the same search, they see the same result. This is foundational to the WhatsApp sharing model. The moment we introduce randomness, we break the viral loop.

**2. Server-first data fetching.**
Pages render with data. No client-side spinners for initial content. Supabase is queried in Server Components. Client Components receive fully-formed props. This is a performance decision and an SEO decision — `/plan/[id]` must be crawlable by WhatsApp's link preview bot. A page that renders empty and populates via client-side fetch will not generate a link preview.

**3. WhatsApp is the primary distribution channel.**
The share flow is the growth engine, not a feature. The `WhatsAppCopyButton` has separate code paths for iOS (`window.location.href`), Android (`window.open`), and desktop (clipboard). These are not bugs — they are the result of real-device testing. iOS Safari blocks `window.open` in async contexts. Do not simplify this into a single code path. Any change to the share flow must be tested on a real iPhone and a real Android device.

**4. Anonymous-first usage.**
No account is required to generate a plan. Anonymous Supabase inserts are intentional. If authentication is ever introduced, it must be optional and behind a clear value exchange. Registration friction kills top-of-funnel conversion for a spontaneous use case.

**5. The featured boost (30 points) is monetization policy.**
Featured operators receive a 30-point scoring boost that can override vibe and cost signals. This is how operator revenue converts to placement. The number 30 is a business decision. Do not modify it without explicit product sign-off. Do not refactor it into a configurable value without understanding that changing it changes the economics of every operator subscription we sell.

**6. All costs are in Nigerian Naira (₦) as integers.**
No multi-currency. No floats. No localization layer. Price fields in the database are integers representing Naira. Any introduction of decimal handling or currency conversion is explicitly out of scope.

**7. Supabase is the only data store.**
No Redis, no second Postgres instance, no SQLite, no localStorage as a data layer. All persistent state lives in Supabase. RLS enforces authorization at the database layer. Adding infrastructure is adding operational complexity we cannot afford at this stage.

**8. No AI in the real-time forge flow.**
The matching engine is an algorithm, not a model. LLM latency, cost, hallucination risk, and non-determinism are incompatible with the forge flow requirements. AI may be used for background jobs (e.g., generating spot descriptions) but never in the synchronous request path.

---

## Architecture

### Request flow

```
User submits ForgeForm (Client Component)
  → GET /forge?startArea=...&budget=...&vibe=...&squadSize=...
    → app/forge/page.tsx (Server Component)
      → lib/queries/spots.ts: fetch filtered active spots from Supabase
        → lib/matchingEngine.ts: pure function, returns top 1–3 PlanResult[]
          → ForgeResultsClient.tsx: renders results (Client Component)
            → User clicks share
              → lib/actions/sharePlan.ts (Server Action)
                → Validates inputs → Inserts row into shared_plans → returns UUID
                  → Client encodes message → wa.me deep link or clipboard
```

### Matching engine — how it works

The engine (`lib/matchingEngine.ts`) is a pure deterministic function: same `ForgeInput` always produces the same `PlanResult[]`.

**Step 1: Filter**
- Daypart filter: exclude categories incompatible with the time of day (e.g., bars excluded from morning; nature excluded from night)
- Category group filter (Anywhere / Eat & Drink / Activity / Nature)
- Vibe tag match: `spot.vibe_tags.includes(vibe)` OR spot is pinned via `pinnedSpotId`

**Step 2: Cost calculation per spot**
- Activity cost = `spot.price_per_person × squadSize` (×1.1 if `spot.has_food` — 10% buffer for service/extras)
- Transport cost = `spot.transport_matrix[startArea]` if present, otherwise `calculateZoneFare(startArea, spot.zone)`
- Total cost = activity + transport
- Exclude spots where transport > 35% of budget or total > budget

**Step 3: Scoring**
- Cost score: `(1 - |budget - totalCost| / budget) × 80` — rewards plans that use the budget well
- Vibe score: `min(matchingVibeTagCount × 5, 10)` — rewards spots that match multiple vibe signals
- Featured boost: `spot.is_featured ? 30 : 0` — **monetization policy, do not change without sign-off**
- ID weight: `hash(spot.id) % 10` — deterministic pseudo-variation to avoid identical-score ties
- Pinned boost: `spot.id === pinnedSpotId ? 1000 : 0` — user-selected spot always wins

**Step 4: Sort and return**
- Sort by total score descending
- Return top 1–3 results with calculated costs and a "why it fits" message

**Zone fare formula (2026 Lagos):**
Same zone → ₦5,000 round trip | Central ↔ Mainland → ₦7,000 | Central ↔ Island → ₦9,000 | Mainland ↔ Island → ₦16,000 | Apapa involvement → +₦1,500 surcharge | Rounded to nearest ₦500.

### Where things belong

| Concern | Location |
|---|---|
| Business logic | `lib/matchingEngine.ts` and dedicated `lib/` functions |
| Database queries | `lib/queries/` — one file per domain (spots, plans, analytics) |
| Server mutations | `lib/actions/` — Server Actions only |
| All TypeScript types | `lib/types.ts` — single source of truth |
| Page data orchestration | `app/**/page.tsx` — Server Components only, calls query functions |
| Interactivity | `components/**` with `'use client'` |
| shadcn primitives | `components/ui/` — do not edit these files |
| Design tokens | `app/globals.css` |
| Utility (clsx/twMerge) | `lib/utils.ts` |
| One-off scripts | `scripts/` — never imported by the app |

### File structure

```
app/                        # Routing layer only
  layout.tsx                # Root layout (NavBar, fonts)
  page.tsx                  # Landing page (SSR: areas, plan count, trending, recent plans)
  globals.css               # Design system tokens
  error.tsx                 # Global error boundary
  not-found.tsx             # 404 handler
  forge/
    page.tsx                # Forge results (Server Component — runs matching engine)
    ForgeResultsClient.tsx  # Results UI (Client Component)
  plan/[id]/
    page.tsx                # Shared plan detail (SSR + OG metadata)
    og/route.tsx            # Dynamic OG image
  explore/
    page.tsx                # Zone index
    [slug]/page.tsx         # Zone/area spot listing
  list-your-spot/page.tsx   # Operator inquiry form (B2B)
  suggest-a-spot/page.tsx   # Community spot submission
  feedback/page.tsx         # Tester feedback
  admin/page.tsx            # Analytics dashboard (key-gated — known weakness, see Security)
components/
  ForgeForm.tsx             # Main planning form (Client — 7 inputs, localStorage caching)
  PlanCard.tsx              # Result card
  WhatsAppCopyButton.tsx    # Share logic (Client — iOS/Android/desktop divergence)
  NavBar.tsx                # Fixed header (Client for mobile menu state)
  LoadingState.tsx          # Animated loading skeleton
  ErrorBanner.tsx           # Error display
  hooks/useMobile.ts        # Responsive breakpoint hook
  ui/                       # shadcn/ui base components (do not modify)
lib/
  matchingEngine.ts         # Core algorithm — pure function, must be fully tested
  queries/                  # All Supabase queries (one file per domain) [to be created]
  actions/
    sharePlan.ts            # Server Action: write shared_plans row, return UUID
  types.ts                  # All types and interfaces
  utils.ts                  # clsx + tailwind-merge only
  supabase.ts               # Supabase client singleton
supabase/
  migrations/               # Sequential SQL, append-only, never edit committed files
  seed.sql                  # Initial spot data
docs/
  decisions/                # Architecture Decision Records [to be created]
```

---

## Database

### Schema

| Table | Purpose | Insert | Select |
|---|---|---|---|
| `areas` | Lagos areas (name, slug) | admin | public |
| `zones` | Macro regions (Mainland, Island, etc.) | admin | public |
| `spots` | Venue catalog (the core dataset) | admin | public |
| `plan_requests` | Anonymous usage analytics | anyone | blocked |
| `shared_plans` | Shareable plan URLs with cost breakdown | anyone | anyone |
| `price_flags` | User price accuracy feedback | anyone | blocked |
| `operator_inquiries` | B2B pipeline (contains PII) | anyone | service role only |
| `spot_suggestions` | Community submissions | anyone | blocked |
| `tester_observations` | Beta feedback (contains PII) | anyone | blocked |

### Key spot fields used by the matching engine

- `vibe_tags TEXT[]` — filter + scoring
- `price_per_person INTEGER` — cost calculation (Naira)
- `transport_matrix JSONB` — area-specific transport overrides keyed by area slug
- `zone TEXT` — fallback for zone fare calculation
- `is_featured BOOLEAN` — 30-point boost (monetization)
- `has_food BOOLEAN` — triggers 10% activity cost buffer
- `category TEXT` — daypart filter (bar, restaurant, activity, nature, beach, cafe, etc.)
- `typical_duration_hours INTEGER` — night filter (activities >2hrs excluded from night)
- `active BOOLEAN` — exclude inactive spots

### Migration rules

- Sequential four-digit prefix. Check `supabase/migrations/` for the next number before naming.
- One migration per logical change. Do not batch unrelated changes.
- Never edit a committed migration. Write a corrective migration instead.
- Idempotent where possible: `IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`.
- Every new table must include in the same migration: UUID PK, `created_at TIMESTAMPTZ DEFAULT NOW()`, `ENABLE ROW LEVEL SECURITY`, at least one explicit policy.
- PII fields (phone numbers, names with contact info) must be called out in a migration comment.

---

## Engineering Rules

### Forbidden patterns

**No inline Supabase queries in page files.**
Every `supabase.from(...)` in a `page.tsx` is technical debt. Extract to `lib/queries/`. This is documented debt in the current codebase — do not add more of it.

**No `useEffect` for data fetching.**
Fetch data in Server Components. Pass as props. `useEffect` fetching is a Next.js 12 pattern incompatible with the App Router model.

**No `/api/` routes for internal data access.**
Server Components query Supabase directly. API routes are for external webhooks only. They add a network hop and lose type safety across the boundary.

**No string interpolation in Supabase queries.**
All user-provided values pass through the Supabase JS client's parameterized interface. No raw query string building from user input.

**No query-parameter-based access control.**
`?key=VALUE` is not authentication. The current admin implementation is a known weakness. Do not add new protected surfaces using this pattern.

**No client-side Supabase reads for non-realtime data.**
The anon key is public. Read server-side, pass as props. Client-side reads expose data access patterns to anyone who inspects network traffic.

**No new npm dependencies without justification.**
Name the package, explain what it does, explain why `framer-motion`, `lucide-react`, `shadcn/ui`, and the existing stack cannot satisfy the need. The bar is high.

**No secrets in source code.**
No hardcoded keys, URLs, or passwords. All secrets via environment variables. All env vars documented in `.env.example`.

**No commented-out code committed.**
Delete it. Git history preserves it.

### Required patterns

**Query functions return typed results and handle errors internally.**
```typescript
// lib/queries/spots.ts
export async function getActiveSpots(filters: SpotFilters): Promise<{ data: Spot[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('active', true)
      .contains('vibe_tags', [filters.vibe])
    if (error) return { data: null, error: error.message }
    return { data, error: null }
  } catch (e) {
    return { data: null, error: 'Unexpected error fetching spots' }
  }
}
```

**Server Components handle query errors explicitly — no raw 500s to users.**
```typescript
// app/forge/page.tsx
const { data: spots, error } = await getActiveSpots(filters)
if (error || !spots) return <ErrorBanner message="Could not load spots. Please try again." />
```

**Every new table has RLS enabled in the same migration.**
```sql
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- columns here
);
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "describe the access" ON new_table FOR INSERT TO anon WITH CHECK (true);
```

**Server Actions validate inputs before writing.**
```typescript
'use server'
export async function submitSuggestion(input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('Invalid input')
  const { spotName, areaName } = input as Record<string, unknown>
  if (typeof spotName !== 'string' || spotName.trim().length === 0) throw new Error('spotName required')
  if (spotName.length > 100) throw new Error('spotName too long')
  // write to DB
}
```

---

## Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Client Component paired with a page | `[Feature]Client.tsx` | `ForgeResultsClient.tsx` |
| Standalone component | `PascalCase.tsx` | `PlanCard.tsx`, `ErrorBanner.tsx` |
| Custom hook | `use` prefix, camelCase | `useMobile.ts` |
| Query function | verb + noun, camelCase | `getActiveSpots()`, `createSharedPlan()` |
| Server Action | verb, camelCase | `sharePlan()`, `submitSuggestion()` |
| TypeScript types | PascalCase | `Spot`, `ForgeInput`, `PlanResult`, `Zone` |
| Database tables | snake_case plural | `shared_plans`, `plan_requests` |
| Migration files | `NNNN_verb_noun.sql` | `0010_add_spot_rating.sql` |
| Environment variables | SCREAMING_SNAKE_CASE | `ADMIN_KEY`, `NEXT_PUBLIC_SUPABASE_URL` |
| ADR files | `NNN-short-title.md` | `001-no-user-authentication.md` |

---

## Security Policy

These rules are non-negotiable. Violating them is a security incident, not a style difference.

**1. No query-parameter authentication, ever.**
`?key=VALUE` appears in logs, browser history, referrer headers, and analytics tools. The current admin gate is a documented temporary weakness. No new protected surface may use this pattern. New admin or operator endpoints require a server-side signed HttpOnly cookie session.

**2. All Supabase inputs are parameterized.**
No user-provided value may appear in a raw query string. Use the Supabase JS client's chained interface. If you are building a string and passing it to any Supabase method, you are introducing SQL injection risk.

**3. RLS on every table, created atomically with the table.**
A table without RLS is accessible to anyone who knows the anon key. The policy is written in the same migration that creates the table — not later.

**4. PII is documented, contained, and earmarked for encryption.**
`operator_inquiries.whatsapp_number` and `tester_observations` contact fields are PII. Currently stored as plaintext — acceptable at zero users, not acceptable at scale. Any new table collecting PII must document the field in the migration comment. Encryption is on the Month 3 roadmap.

**5. No secrets in source code or version control.**
`.env` is gitignored. `.env.example` has placeholders only. If a secret is accidentally committed, rotate it immediately — the git history is not safe to leave a real secret in.

**6. Rate limiting on all anonymous write endpoints.**
`plan_requests`, `shared_plans`, `spot_suggestions`, `operator_inquiries`, `price_flags`, `tester_observations` all accept anonymous inserts. Without rate limiting any of these can be flooded. Rate limiting must be implemented at the Vercel Edge middleware layer before any of these are considered production-hardened.

**7. Server Actions validate inputs at runtime.**
TypeScript types are erased at runtime. Every Server Action checks field presence, type, length, and range before writing to the database.

---

## Performance Policy

### When to optimize

Optimize when you have evidence (a measured regression in logs or a documented scaling cliff about to be hit), not intuition.

### Metrics that matter

| Flow | Target |
|---|---|
| Forge page Time to First Byte | < 800ms |
| Forge page render on slow 4G | < 3s total |
| WhatsApp share action (tap to result) | < 1s |
| `/plan/[id]` TTFB (for link previews) | < 600ms |
| Supabase spot query P95 | < 100ms |

### The one cliff to address before it hits

The matching engine currently fetches all active spots and filters in JavaScript. This works at 50 spots. It degrades at 300. It breaks at 2,000. Push `vibe_tags`, `category`, and `active` filtering into the Supabase query before the spot catalog exceeds 200 entries.

### Premature optimizations to avoid

- Do not add Redis or Vercel KV before profiling shows repeated identical queries causing measurable latency
- Do not pre-render plan results — they are specific to four user inputs with no reusable cache key
- Do not micro-optimize in-memory JavaScript sorting — the bottleneck is the database query and network round-trip
- Do not add CDN caching for dynamic pages (forge results, plan detail) — they are user-specific

---

## Design System

**Colors (Nigerian flag palette):**
- Brand green: `#008751` — primary CTAs, success states
- Brand yellow: `#FCD116` — highlights, secondary accents
- Text primary: `#0A0A0A` | Text muted: `#6B6B6B`
- Surface grey: `#F7F7F7` | Border default: `#E8E8E8`
- Error: `#DC2626`

**Typography classes (defined in `app/globals.css`):**
`type-display` · `type-heading` · `type-subheading` · `type-body` · `type-caption` · `type-label`

Do not define typography inline — use these classes.

**Motion tokens:**
- `motion-instant`: 100ms ease-out
- `motion-responsive`: 200ms ease-out
- `motion-considered`: 350ms cubic-bezier(0.34, 1.56, 0.64, 1) with bounce

**Interactive feedback:** `.tap-feedback` for touch targets · `.focus-ring` for keyboard focus

**Mobile-first always.** If it does not work on a 375px iOS Safari screen, it is not done.

---

## Testing

Test runner: Vitest. Tests live adjacent to the file they test (`lib/matchingEngine.test.ts`).

**What must be tested:**
- Every exported function in `lib/matchingEngine.ts` — this is the entire product
- Every data-transforming function in `lib/queries/`
- Every Server Action (happy path + primary error path)

**What must not be tested:**
- shadcn/ui primitives
- Page components (manual testing or E2E)
- `lib/utils.ts` (clsx/tailwind-merge wrappers)

**Test naming:**
```typescript
describe('filterSpots', () => {
  it('should exclude spots where total cost exceeds budget')
  it('should exclude night spots when daypart is morning')
  it('should include pinned spot regardless of vibe match')
})
```

**Any change to `matchingEngine.ts` requires a corresponding test.** A PR that modifies scoring logic without adding a test is incomplete.

---

## AI Development Policy (Claude-Specific)

### Default posture

I am a technical co-founder, not a contractor. I write production code, not prototypes. Before implementing anything I understand what user problem it solves, why this approach is right for OyaPlan specifically, and what the failure modes are. I read relevant existing code before writing new code. I follow this document without exception.

### Stop and ask before

- Changing how spots are scored, filtered, or ranked (revenue + trust implications)
- Writing a new database migration (schema changes in production are irreversible)
- Adding an npm dependency (name the package, explain why the existing stack cannot satisfy the need)
- Touching `WhatsAppCopyButton.tsx` (iOS/Android/desktop divergence must be tested on real devices)
- Modifying any RLS policy (wrong policy silently exposes all data in a table)
- Implementing something where two reasonable approaches exist (the founder makes that call)
- The requirement is ambiguous enough that multiple non-equivalent implementations are possible

### Proceed autonomously for

- New query functions in `lib/queries/` following the established pattern
- New pages following the Server Component + Client Component structure
- Bug fixes where the correct behavior is unambiguous from the existing code's intent
- Type fixes, ESLint fixes, broken import fixes
- Adding tests for existing untested code
- Extracting inline Supabase queries from page files into `lib/queries/` without changing their logic
- Updating `ARCHITECTURE.md` to reflect a just-implemented change

### Refuse and explain when

- Asked to introduce randomness into the matching engine
- Asked to bypass RLS using the service role key in client-accessible code
- Asked to implement access control via query parameter
- Asked to hardcode a secret or commit a real `.env` value
- Asked to use `useEffect` for data that should be fetched in a Server Component
- Asked to build a Supabase query with string interpolation of user input
- Asked to add an AI/LLM call inside the synchronous forge request path

When refusing, explain the specific constraint, quote the relevant rule, and offer the closest acceptable alternative. Do not refuse silently. Do not work around the constraint without disclosing it.

---

## Environment Variables

```bash
# Supabase (public — safe in client bundles, RLS enforces security)
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key

# Admin (server-only — never expose to client)
ADMIN_KEY=                      # Temporary query-param admin gate. Known weakness. Replace with session auth.
```

Every new environment variable must be added to `.env.example` with a comment explaining its purpose, where to obtain it, and whether it is safe to expose to the client (`NEXT_PUBLIC_` prefix = public).

---

## Definition of Done

A feature is done when:

**Correctness**
- [ ] Works on iOS Safari, Android Chrome, and desktop Chrome
- [ ] Empty states and error states handled — no raw exceptions visible to users
- [ ] All Supabase queries use parameterized inputs (no string interpolation)
- [ ] `tsc --noEmit` passes with zero errors
- [ ] ESLint passes with zero warnings

**Data**
- [ ] Any schema change has a sequential migration in `supabase/migrations/`
- [ ] Any new table has RLS enabled with explicit policies
- [ ] New text inputs have server-side length validation before DB write
- [ ] Any new PII field is documented in the migration comment

**Testing**
- [ ] Any change to `matchingEngine.ts` has a corresponding test
- [ ] Any new Server Action has a test for the happy path and primary error path

**Security**
- [ ] No new secrets hardcoded or committed
- [ ] No new query-param access control introduced

**Documentation**
- [ ] New environment variables documented in `.env.example`
- [ ] If the forge flow, schema, or matching engine changed — `ARCHITECTURE.md` updated
- [ ] If a new architectural decision was made — ADR added to `docs/decisions/`

---

## Known Technical Debt (Prioritized)

These are documented gaps, not oversights. Do not add to this list without a plan to address it.

| Issue | Severity | Status |
|---|---|---|
| Admin auth via query param | Critical | **RESOLVED** — Supabase Auth (P0-1, Sprint 1) |
| No error handling on Supabase calls in pages | Critical | **RESOLVED** — PageError + error-flag pattern (P0-2, Sprint 1) |
| No rate limiting on anonymous writes | Critical | Add Edge middleware (Month 1) |
| Zero automated tests | High | Install Vitest, write matchingEngine tests (P1-4, Sprint 1) |
| No CI/CD pipeline | High | **RESOLVED** — GitHub Actions: typecheck + build + test + lint (P0-3, Sprint 1) |
| Pre-existing ESLint errors (39 errors, 12 warnings) | Medium | CI lint gate blocks new violations; cleanup by file below |
| Inline Supabase queries in page files | High | Extract to lib/queries/ (Month 1) |
| Full spot table scan on every forge | High | Push filters to DB layer (P1-5, Sprint 1) |
| WhatsApp numbers stored in plaintext | High | Encrypt at rest (Month 3) |
| No error monitoring (Sentry) | Medium | Add Sentry integration (Month 1) |
| Admin dashboard loads all rows unbounded | Medium | Add cursor pagination (Month 3) |
| trending_score is a manual integer | Low | Build update procedure (Month 3) |

### Pre-existing ESLint errors — cleanup order

New code is protected: CI blocks lint errors in any file touched by a PR. The 39 remaining errors are in files not yet touched by Sprint 1. Recommended cleanup order (highest value / lowest risk first):

| File | Error type | Risk |
|---|---|---|
| `app/forge/ForgeResultsClient.tsx` | `no-explicit-any`, `no-unused-vars` | Medium — core UI, manual test required |
| `components/ForgeForm.tsx` | `react-hooks/exhaustive-deps`, `no-unused-vars` | Medium — form logic, manual test required |
| `components/PlanCard.tsx` | `no-explicit-any` | Low — display only |
| `components/WhatsAppCopyButton.tsx` | `no-explicit-any` | High risk — do not touch without real device test |
| `lib/matchingEngine.ts` | `no-explicit-any` | Medium — covered by P1-4 tests before touching |
| `app/feedback/page.tsx` | `no-explicit-any` | Low — form page |
| `app/suggest-a-spot/page.tsx` | `no-explicit-any` | Low — form page |
| `app/list-your-spot/page.tsx` | `no-explicit-any` | Low — form page |
| `app/not-found.tsx` | `no-explicit-any` | Low — error page |
| `components/ui/input.tsx`, `textarea.tsx` | shadcn primitives | **Do not edit** — shadcn managed files |
| `seed-zones.js`, `check-zones.js`, `.gemini/scratch/*.js` | `no-require-imports` | Low — scripts never imported by app, ignore or add eslintignore |

---

## What This Product Is Not

- Not an AI product (the engine is a deterministic algorithm, not a model)
- Not a user-authenticated product (anonymous-first is a feature, not a gap)
- Not a multi-currency product (Naira only)
- Not a multi-city product (Lagos only, for now)
- Not a real-time product (no WebSockets, no live updates)
- Not a marketplace (we list spots, we do not process transactions between users and venues)

Do not introduce patterns that assume any of the above.
