# ADR 0008: Decouple & Standardize Planning Engine Domain Layer

## Status
Accepted

## Context
Originally, the core budgeting, transport estimation, vibe matching, and venue scoring rules of OyaPlan were encapsulated entirely inside the `Forge` page matching system (`forgeMatcher.ts`). As a result, the `Explore` browsing flow fell back to duplicating similar matching checks using a simpler, custom sorting algorithm. 

This created significant architectural risk:
1. **Divergent Implementations:** Code paths calculating budget eligibility and VAT buffers diverged (e.g. Explore retained a legacy `1.1x` VAT buffer that had been removed from Forge, leading to mismatched results for the same budget).
2. **Tight Coupling:** The matching logic directly consumed Forge-specific inputs (`ForgeInput`) and UI-specific variables, making it difficult to utilize the planner in other presentation surfaces (like Search, AI concierge, or collections).
3. **Implicit Mutations:** Intermediate planning transformations mutated objects in-place, making the pipeline difficult to test and debug.

## Decision
We decouple the planning domain from presentation systems by introducing a versioned, pure Planning Engine.

```
       Explore Filters              Forge Input
              │                          │
              ▼                          ▼
       PlanningRequest            PlanningRequest
              │                          │
              └────────────┬─────────────┘
                           ▼
                    Planning Engine
                    (Orchestrated)
                           │
       ┌───────────┬───────┴───┬───────────┐
       ▼           ▼           ▼           ▼
   Candidates    Costs    Constraints   Ranking
       │           │           │           │
       └───────────┴───────┬───┴───────────┘
                           ▼
                    ExplainedPlan[]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      Decision Mapper             Recovery Engine
             │                           │
             ▼                           ▼
      Card View Model            Context Recovery
```

### Key Architectural Guidelines Implemented:
1. **Canonical Input Boundary (`PlanningRequest` & `PlanningContext`):** Neither Forge nor Explore exposes its UI-specific variables directly to the engine. Instead, they transform their parameters into a generic `PlanningRequest`. Custom runtime overrides, configurations, and mocks are supplied using a unified `PlanningContext`.
2. **Decoupling of Recovery Suggestions:** The `RecoveryEngine` is moved out of the main orchestrator (`PlanningEngineV1`). The core engine does exactly one thing: construct eligible plans. Recovery recommendations are generated parallel to the orchestrator if plans return empty.
3. **Pure Pipeline Stages:** The matching engine orchestrator is purely functional. It composes a pipeline of five distinct sub-engines:
   - **`CandidateEngine`:** Filter spots strictly by daypart, category, and matching tags.
   - **`CostEngine`:** Scale activity cost and retrieve transport fares.
   - **`ConstraintEngine`:** Enforce hard budget limits and maximum transport ratios.
   - **`RankingEngine`:** Order eligible plans using a versioned configuration (`RankingConfig`).
   - **`ExplainabilityEngine`:** Add title, subtitle, tax labels, and trust signals.
4. **Immutable Stages:** Intermediate states are strictly typed and immutable: `PlanningCandidate` → `CostedPlan` → `RankedPlan` → `ExplainedPlan`.
5. **Presentation Mapper Boundary:** Domain outputs are transformed into presentation-safe `DecisionCardViewModel`s using a decoupled presentation mapper. UI cards render values from this view model and are blind to how those calculations were run.

## Consequences
- **Logic Consistency:** Forge and Explore are guaranteed to produce identical costs, rankings, and explanations for any matching search filters.
- **Cleaner Extensibility:** New presentation surfaces can call `PlanningEngineV1` by mapping their parameters to `PlanningRequest`, without inheriting Forge dependencies.
- **Strict Testing Boundary:** Parity between versions is secured using a contract test suite (`contract.test.ts`) comparing legacy Facade runs directly against `PlanningEngineV1` outputs.
