# ADR 0002: Domain-Driven Architecture (Lite)

## Status
Accepted

## Context
In early prototyping phases, Next.js Server Actions were heavily mixed with UI components, and raw Supabase client insertions were scattered throughout the presentation layer. As the application grows, mixing data access, business logic, and UI rendering creates untestable and brittle code, particularly when expanding to new domains like gamification (OyaScore) or Growth (Referrals).

## Decision
We will enforce a "Lite" Domain-Driven Design (DDD). 
1. The UI (`app/` and `components/`) must never contain raw database queries.
2. All data access and business logic must be encapsulated in `lib/services/` (e.g., `SavedPlanService.ts`, `GrowthEngine.ts`) or `lib/queries/`.
3. Next.js Server Actions (`lib/actions/`) act only as the controller/glue layer between the UI and the Services.

## Alternatives Considered
- **Full ORM (Prisma/Drizzle)**: Rejected for now due to the excellent automatic type generation provided by Supabase CLI, and the desire to keep bundle sizes small and Edge compatibility high.
- **MVC Pattern**: Rejected as it fights against the grain of the Next.js App Router paradigm.

## Consequences
- **Positive**: Code is highly testable.
- **Positive**: Security rules are centralized.
- **Negative**: Slight boilerplate increase for simple operations (e.g., creating a file in `services` just to run a single `insert`).

## Future Review Trigger
Review this if we decide to migrate off Supabase or if the boilerplate becomes overwhelming for the engineering team.
