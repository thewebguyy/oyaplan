# CONTEXT RECONCILIATION REPORT
**Purpose**: This appendix details claims from previous historical documents that were audited against the active repository and found to be Stale, Unverified, or Contradicted.

## 1. Next.js Version
- **Historical Claim**: The stack runs on "Next.js 14+ (App Router)".
- **Audit Result**: ⚠ STALE.
- **Repository Truth**: `package.json` confirms the project runs precisely on **Next.js 16.2.4**.
- **Action Taken**: The `Claude Context Package` and `Project Transition Report` have been updated to explicitly state v16.2.4.

## 2. Session / Identity Architecture
- **Historical Claim**: Identity was summarized as a single bullet point regarding anonymous onboarding.
- **Audit Result**: ⚠ STALE / INCOMPLETE.
- **Repository Truth**: The repository implements a highly sophisticated `SessionResolver` serving as a platform primitive. Plans are saved using relational `shared_plans` lookups, entirely avoiding JSON blob anti-patterns.
- **Action Taken**: 
  - Generated `docs/adr/0001-anonymous-first-identity-model.md`.
  - Expanded Section 3 of the `Claude Context Package` to document the full domain flow.

## 3. Transport Matrix Normalization
- **Historical Claim**: The transport matrix was assumed by some historical context to be a routing table.
- **Audit Result**: ✗ CONTRADICTED.
- **Repository Truth**: According to `lib/types.ts` and `scripts/import-verified-venues.ts`, the `transport_matrix` is currently an unnormalized JSON column (`Record<string, number>`) residing directly on the `spots` table.
- **Action Taken**: Explicitly documented as Technical Debt in the `Claude Context Package` and flagged for future normalization.

## 4. Architecture Decision Records (ADRs)
- **Historical Claim**: ADRs exist for major architectural shifts.
- **Audit Result**: ✗ CONTRADICTED.
- **Repository Truth**: The `/docs/adr` directory did not exist.
- **Action Taken**: Created the directory and the first ADR (`0001-anonymous-first-identity-model.md`).

*Note: All generated context packages have been scrubbed of these contradictions and now represent a VERIFIED source of truth.*
