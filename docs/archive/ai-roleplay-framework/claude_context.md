# CLAUDE CONTEXT PACKAGE
**Role**: Technical CTO & Principal Software Architect | **Project**: OyaPlan

## 1. Engineering Philosophy & Architecture Principles
- **Domain-Driven Design (Lite)**: Services (`lib/services/`) encapsulate business logic. UI components should never execute raw database inserts/updates directly.
- **Strict Types**: TypeScript must be strictly adhered to. `any` is banned. Interfaces over inference at API boundaries.
- **Graceful Degradation**: If an external service or non-critical DB read fails, the UI must gracefully fall back without crashing the session.
- **No Silently Swallowed Errors**: Errors must be surfaced meaningfully or logged to Sentry.

## 2. System Architecture & Domain Model
- **Core Framework**: Next.js 16.2.4 (App Router). Server Components by default; Client Components only when interactivity requires hooks.
- **Database**: Supabase (PostgreSQL).
- **Core Domains**:
  - `Spot`: The canonical venue (Name, Address, Vibe Tags, Base Price).
  - `Plan`: A generated instance combining a Spot, Group Size, and Transport Matrix.
  - `SharedPlan`: A persistent snapshot of a Plan, allowing stateless sharing.

## 3. Session / Identity Architecture
A massive structural pillar of OyaPlan is the Anonymous-First Identity Model. This enables zero-friction onboarding while maintaining state.
- **SessionResolver (Platform Primitive)**: Every visitor receives an anonymous session ID securely stored in HttpOnly cookies. This resolver is the sole source of identity across the application.
- **Data Association**: Mutations (e.g., `saved_plans`, `user_preferences`) relate to this session ID rather than a formal user UUID, avoiding the `plan_data JSONB` anti-pattern by utilizing relational tables.
- **Shared Plans Reusability**: When a user shares a plan, it generates a `shared_plans` row. If another user saves it, it references the same row, eliminating duplicate state.
- **First-Class Preferences**: We have established a robust preference model tracking the anonymous user, preparing the foundation for the deferred OyaScore gamification layer.
- **Reference**: See `docs/adr/0001-anonymous-first-identity-model.md` for full implementation details.

## 4. Database Architecture & Data Access
- **Tooling**: `@supabase/supabase-js`. 
- **Rule**: Schema migrations must be treated with care. No manual UI-driven schema updates.
- **Caching**: Currently lightweight. Redis (Upstash) is used for Rate Limiting. Heavy reads on immutable data (like `spots`) should be considered for Edge caching in the future.

## 5. Security Model
- **Data Ownership**: Plans and preferences are tied to the anonymous session.
- **Security**: Upstash Redis rate limits the Forge (Generation) endpoint to prevent DB exhaustion.

## 6. Infrastructure & Deployment
- **Hosting**: Vercel.
- **Edge**: `api/og/plan/route.tsx` uses Edge runtime for fast image generation.
- **CI/CD**: Standard Vercel continuous deployment on `master` branch.
- **Observability**: Sentry for error tracking. Custom AnalyticsService for product events.

## 7. Technical Debt & Known Bottlenecks
- **Transport Matrix Scaling**: `transport_matrix` is currently unnormalized. It exists as a JSON `Record<string, number>` column directly on the `spots` table. As OyaPlan scales beyond Lagos districts, this must be extracted into a normalized geospatial/routing table or external API.
- **Analytics Event Duplication**: Mitigated in React Strict Mode via `useRef`, but a more robust server-side ingestion queue may be needed at scale.

## 8. Open Technical Questions & Future Priorities
- **Vector Search**: Should we migrate `vibe_tags` and `category` searches to pgvector to support natural language queries?
- **Global Edge Caching**: The Forge algorithm currently reads heavily from Supabase. Should we push the entire `active` spots catalog to Redis/Edge Config?
