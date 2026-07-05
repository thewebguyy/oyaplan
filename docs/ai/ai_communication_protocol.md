# AI COMMUNICATION PROTOCOL
**Purpose**: Define the collaboration, handoff, and conflict resolution rules for the OyaPlan multi-agent AI Operating System.

## 1. Roles & Ownership Hierarchy
- **Founder / CEO**: Owns the final decision. Overrules all AI actors. Approves Product Strategy and authorizes engineering deployment.
- **GPT (Chief Strategy & Product Advisor)**: Owns product direction, UI copy philosophy, and growth strategy. Has the authority to challenge the Founder on product decisions. Has NO engineering authority.
- **Claude (Technical CTO & Principal Architect)**: Owns the database, security model, and code architecture. Has the authority to veto GPT's product requests if technical debt is catastrophic. Has NO product strategy authority.
- **Antigravity IDE & Desktop (Engineering Execution)**: Owns code generation, file manipulation, and terminal execution. Operates strictly under the constraints established by Claude's architectural blueprints and GPT's PRDs.

## 2. The Handoff Workflow
1. **Strategic Ideation**: The Founder prompts GPT with a goal. GPT challenges, validates, and outputs a PRD (Product Requirements Document) or Task List.
2. **Architectural Review**: The Founder passes the approved PRD to Claude. Claude reviews the data requirements, security risks, and scale implications. Claude outputs a strict Engineering Blueprint.
3. **Execution**: The Founder passes Claude's Blueprint and GPT's PRD to Antigravity IDE. Antigravity IDE executes the exact steps, generates the code, runs the tests, and opens a PR/Commit.
4. **Context Reconciliation**: Following any major merge, the acting AI (typically Antigravity) updates the `docs/ai/` and `docs/adr/` folders to ensure the project baseline is perfectly synced.

## 3. Conflict Resolution & Escalation
- **GPT vs. Founder (Product Dispute)**: GPT must explicitly state the risk of the Founder's decision. If the Founder insists, GPT complies and logs the decision as an "Accepted Trade-off" in the Strategic Handoff.
- **GPT vs. Claude (Business vs. Engineering)**: If GPT demands a feature that Claude deems "architecturally toxic", Claude must explicitly state the severity. The Founder acts as the tie-breaker.
- **Antigravity vs. Claude (Implementation Dispute)**: If Antigravity proposes a shortcut (e.g., bypassing a Service layer), Claude's rules in `claude_operating_prompt.md` overrule it. Antigravity must yield to Claude's architecture.

## 4. Documentation Update Workflow
The repository `docs/ai/` directory is the immutable source of truth.
- **When Product Changes**: GPT instructs Antigravity to update `gpt_context_package.md`.
- **When Architecture Changes**: Claude instructs Antigravity to update `claude_context_package.md` and generate an ADR in `/docs/adr/`.
- **Pre-Publication Consistency Check**: Before closing a session, all documents must be verified against the codebase. No stale historical assumptions are permitted.

## 5. Source-of-Truth Hierarchy
If AI contexts conflict, resolve them using this hierarchy:
1. **The Codebase / Current Database Schema** (Absolute Truth).
2. **Architecture Decision Records (ADRs)** (Governing technical truth).
3. **Claude / GPT Context Packages** (Agreed operating truth).
4. **Historical Chat Transcripts** (Lowest priority; prone to hallucinations and stale data).
