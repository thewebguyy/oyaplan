# ENGINEERING HANDOFF
**Role**: Antigravity IDE / Desktop | **Project**: OyaPlan

## 1. Current Repository State
- **Branch**: `master`
- **Phase**: 13 (Completed & Pushed)
- **Status**: Compiles cleanly with zero TypeScript errors.

## 2. Architecture & Stack
- **Framework**: Next.js (App Router, v14/v15).
- **Language**: TypeScript (Strict Mode).
- **Styling**: Tailwind CSS v4, `shadcn/ui` components.
- **State**: Zustand (where needed), React Hooks.
- **Database Access**: `@supabase/supabase-js`.

## 3. Folder & Coding Conventions
- `app/`: Next.js App Router structure. UI and route definitions.
- `components/`: React components. `ui/` contains shadcn primitives.
- `lib/`: Core utilities.
  - `lib/actions/`: Server Actions (mutations).
  - `lib/services/`: Domain services (business logic encapsulation).
  - `lib/queries/`: Database read queries (data access layer).
- **Imports**: Use `@/` path aliases.
- **File Extensions**: `.tsx` for React components/routes, `.ts` for logic.
- **Rules**:
  - NO `any` types.
  - Server Actions must validate inputs and handle Supabase errors gracefully.
  - UI components must NOT call Supabase `insert()` or `update()` directly. Always route through a service or action.
  - Match existing conventions when creating new files (e.g., PascalCase for components, camelCase for services).

## 4. Current Implementation Status
- **Completed**:
  - `PlanCard` with dynamic `image_url` rendering and empathetic trust indicators.
  - `ForgeResultsClient` with calculated metrics and graceful empty states.
  - `/api/og/plan/route.tsx` for dynamic Open Graph sharing.
  - `scripts/import-verified-venues.ts` (Zod schema and TS compilation fixed).
  - Global `sonner` toasts integrated into Save and Share flows.
- **Incomplete / Deferred**:
  - Referral Dashboard / OyaScore UI.
  - Advanced filtering on the Forge Form.
  - Global User Preferences UI (Dietary restrictions, etc.).

## 5. Technical Debt & Known Bugs
- **Tech Debt**: Supabase queries in `ForgeResultsClient.tsx` are somewhat heavy (fetching all spots and filtering in-memory). This needs pagination or RPC optimization as the dataset grows.
- **Known Bugs**: None blocking launch.

## 6. Testing Expectations
- **No strict unit test suite** (Jest/Vitest) is currently mandated for every component.
- **Type Checking**: `npx tsc --noEmit` is the primary guardrail. It must pass before any commit.
- **Manual Verification**: Run `npm run dev` and test UI flows in the browser for all changes.

## 7. Immediate Next Engineering Tasks (If Resuming)
1. Set up the production Vercel environment variables.
2. Run the ETL script `scripts/import-verified-venues.ts` to seed the database.
3. Once data is seeded, verify the `ForgeResultsClient` returns logical plans based on real coordinates/pricing.
4. (Optional) Implement `OyaScore` backend tracking triggers for when users share plans or save them.
