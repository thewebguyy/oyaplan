# ADR-002: Vitest as the Test Runner

**Status:** Accepted  
**Date:** 2026-06-29  
**Author:** Engineering

---

## Context

OyaPlan's matching engine is a pure deterministic algorithm that converts user inputs into ranked spot recommendations. It encodes business rules that directly affect revenue (featured boost), user trust (deterministic output), and product correctness (cost calculation, budget filtering). As of Sprint 1, there are zero automated tests protecting any of this logic.

P1-4 adds a comprehensive test suite. A test runner must be selected that integrates cleanly with the existing stack (Next.js 16, TypeScript 5 strict, ESM modules) and does not introduce operational complexity.

---

## Options Considered

### 1. Jest

The default for many React projects. However:

- **ESM incompatibility:** Next.js 16 uses ESM by default. Jest requires explicit `transform` configuration and `jest.config.ts` complexity to handle ESM modules, TypeScript path aliases (`@/`), and the `next/` imports. This is a known pain point — the Next.js docs explicitly recommend Vitest or Jest with significant config.
- **Speed:** Jest's module system is slower than Vitest's Vite-based transform pipeline, particularly for TypeScript-heavy projects.
- **Maintenance:** The transform and module-resolution configuration adds ongoing maintenance burden every time a new module type is introduced.

### 2. Vitest

- **Native ESM and TypeScript:** No transform configuration needed. Vitest uses the Vite pipeline, which handles TypeScript, ESM, and path aliases out of the box.
- **Configuration simplicity:** A single `vitest.config.ts` with a path alias for `@/` is sufficient. Already configured in P0-3.
- **API compatibility:** Vitest implements the Jest API (`describe`, `it`, `expect`, `beforeEach`, `vi.mock`). Any engineer familiar with Jest is immediately productive.
- **Performance:** Significantly faster cold start and per-test execution than Jest on TypeScript-heavy codebases.
- **No new vendors:** Vitest is part of the Vite ecosystem, already implicitly present via Next.js's build tooling. Adding `vitest` is adding a dev dependency on a stable, widely-adopted tool, not introducing a new technology category.

### 3. Node.js built-in test runner (`node:test`)

- Available without installing a package.
- Lacks the assertion library depth (`expect().toEqual()`, `.toMatchObject()`, etc.) and watch mode ergonomics that make TDD practical.
- No TypeScript integration without additional setup.
- Not suitable for a production test suite.

---

## Decision

**Vitest** is the test runner for OyaPlan.

It was installed as a devDependency in P0-3 (commit 5049cff) as a prerequisite for the CI test gate. The `vitest.config.ts` configures the `@/` alias so test files can import from the app's module system.

---

## Consequences

**Positive:**
- Zero configuration overhead for TypeScript and ESM.
- CI test gate is live and wired (`npx vitest run --passWithNoTests`).
- The Jest-compatible API means no retraining for engineers who know Jest.

**Negative:**
- None material. Vitest is stable (v2+), well-maintained, and used in production by large Next.js codebases.

**Constraints introduced:**
- All tests must live adjacent to the file they test (e.g., `lib/matchingEngine.test.ts`).
- Test files must follow the glob `**/*.{test,spec}.{ts,tsx}` defined in `vitest.config.ts`.
- Do not use `jest` imports — use `vitest` imports (`import { describe, it, expect } from 'vitest'`).

---

## Out of Scope

- E2E testing (Playwright): deferred. The pre-installed Chromium in the remote environment makes this feasible in future, but E2E is not part of Sprint 1.
- Component testing: pages and Client Components are tested manually per the Definition of Done. Vitest is for pure logic units only.
