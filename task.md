# Tasks: Sprint 2 — Extract the Planning Engine

- [x] Create domain types & interfaces (`lib/planning/types.ts`)
- [x] Implement transport provider abstraction (`lib/planning/transport.ts`)
- [x] Implement sub-engines:
  - [x] Candidate Engine (`lib/planning/candidateEngine.ts`)
  - [x] Cost Engine (`lib/planning/costEngine.ts`)
  - [x] Constraint Engine (`lib/planning/constraintEngine.ts`)
  - [x] Ranking Engine (`lib/planning/rankingEngine.ts`)
  - [x] Explainability Engine (`lib/planning/explainability.ts`)
  - [x] Recovery Engine (`lib/planning/recoveryEngine.ts`)
- [x] Implement main Orchestrator (`lib/planning/planningEngine.ts`)
- [x] Implement presentation mappers (`lib/planning/presentation/decisionCardMapper.ts` and `types.ts`)
- [x] Write Contract and Regression Tests (`lib/planning/contract.test.ts`)
- [x] Migrate Forge to use the new Planning Engine
- [x] Migrate Explore to use the new Planning Engine
- [x] Delete/Clean up legacy filtering & sorting logic in `forgeMatcher.ts`
- [x] Verify test suite passes perfectly

# Tasks: Sprint 2.5 — Architecture Consolidation & Baselines

- [x] Write Architecture Decision Record (ADR)
- [x] Add Planning Engine performance benchmarks (`lib/planning/benchmark.test.ts`)
- [x] Add snapshot test for `DecisionCardViewModel` mapper mapping validations (`lib/planning/presentation/mapper.test.ts`)
- [x] Run test suite and check baselines
