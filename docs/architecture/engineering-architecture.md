# Engineering Architecture & Repository Reference

This document defines the architectural patterns, directory structures, dependency rules, and module boundaries of the OyaPlan codebase. It serves as the primary technical blueprint for engineering.

---

## 1. System Topology & Architectural Philosophy

OyaPlan uses a Clean Architecture pattern, isolating pure business rules (the planning core) from runtime frameworks, database configurations, and UI environments.

```
                  ┌──────────────────────────────┐
                  │      Next.js App Router      │  ◄── Presentation Framework
                  └──────────────────────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │    React Hook Orchestration  │  ◄── State & Lifecycle Glue
                  │     (useRecommendations)     │
                  └──────────────────────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │    Deterministic Core Engine │  ◄── Pure Domain Logic (Framework-free)
                  │       (PlanningEngine)       │
                  └──────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
     ┌───────────────────────┐       ┌───────────────────────┐
     │  Location / Snapping  │       │   Travel Estimators   │  ◄── Semantic Adapters
     │    (OriginResolver)   │       │(MatrixTravelEstimator)│
     └───────────────────────┘       └───────────────────────┘
```

---

## 2. Directory Layout & Boundaries

The codebase is structured to preserve boundaries between presentation layers and domain cores:

```
├── app/                  # Next.js App Router (Routes, Server Pages, Page Layouts)
│   ├── explore/          # Explore page route paths
│   └── layout.tsx        # Root HTML wrapper and global context hydration
├── components/           # Presentation UI Layer (Framer Motion, React Layouts)
│   ├── explore/          # Venue stack decks and detail sheets
│   └── ui/               # Reusable primitive design system components
├── hooks/                # Framework-specific React hooks (e.g. useTransportCost)
├── lib/                  # Business Domain and Data Layer
│   ├── location/         # Proximity and snapping resolution logic (Framework-free)
│   ├── planning/         # Core planning engines (pure functions, no side-effects)
│   │   ├── presentation/ # Presentation mappers (Decision card models)
│   │   ├── types.ts      # Pure engine types
│   │   └── planningEngine.ts # Unified recommendation pipeline
│   ├── storage/          # Local caching and envelope storage adapters
│   ├── travel/           # Semantic travel estimators and distance math
│   └── types.ts          # Core entity representations (Spots, Zones, Areas)
```

---

## 3. Strict Boundary Rules

To prevent code corruption and ensure test stability, the following rules are enforced:

### Rule 1: Zero External Dependencies in the Planning Core
The files inside `lib/planning/` must not import React, Next.js page routing functions, browser storage protocols (localStorage), or environment variables. All context parameters must be injected explicitly via the `PlanningContext` and `PlanningDependencies` parameters.

### Rule 2: Strict Typings
No use of TypeScript's `any` keyword. All database, api, or matching structures must declare strict interfaces. Avoid raw type inferences on boundaries.

### Rule 3: Zero Database Operations in the Engine
The recommendation pipeline operates purely in-memory. Database queries (using Supabase server clients) must execute outside the engine (e.g., inside page routes or API endpoints), passing raw arrays down to the domain wrappers.

---

## 4. Module Ownership Map

| Module | Core Responsibility | Primary Tests |
| :--- | :--- | :--- |
| **`lib/planning/`** | Filtering, costing, ranking, and explanation engine orchestration. | `lib/planning/contract.test.ts`<br>`lib/planning/benchmark.test.ts` |
| **`lib/location/`** | Geographic coordinates snapped area lookups. | `lib/location/origin.test.ts` |
| **`lib/travel/`** | Distance math and travel duration estimations. | `lib/travel/travel.test.ts` |
| **`components/`** | User interaction widgets and UI presentation states. | Component rendering checks |
