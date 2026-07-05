# ADR 0005: Venue Intelligence Schema

## Status
Accepted

## Context
The OyaPlan matching engine currently routes queries based on a narrow set of criteria (daypart, squad budget, and vibe tags). To transition the product to support richer queries and curated matches (such as date-night suitability, group capacities, dress code requirements, and indoor/outdoor options), the matching engine requires more granular venue semantics.

We need to add structured venue metadata to support these product features. The active database schema stores spots/venues in a `venues` table, which includes categorical vibes (`vibe_tags TEXT[]`) and basic category fields (`category TEXT`), but lacks metadata on suitability (e.g. date-suitability, group capacity constraints, layout environments, dress code).

## Decision
We will extend the `venues` table schema with the following fields:
1. **Demographic/Intent Filters**:
   - `audience_tags TEXT[]`: constrained list of target demographics (e.g., `'squads'`, `'couples'`, `'families'`, `'solo'`).
   - `activity_tags TEXT[]`: list of active venue attractions (e.g., `'dining'`, `'dancing'`, `'board_games'`, `'arcade'`, `'live_music'`).
2. **Layout & Environmental Filters**:
   - `indoor_outdoor TEXT CHECK (indoor_outdoor IN ('indoor', 'outdoor', 'mixed'))`: layout environment constraint.
3. **Style & Vibe Boundaries**:
   - `dress_code TEXT CHECK (dress_code IN ('casual', 'smart_casual', 'formal', 'nightlife'))`: style requirements.
4. **Contextual Suitability**:
   - `date_suitability BOOLEAN DEFAULT FALSE`: flag marking romantic vibe alignment.
   - `group_suitability_min INT DEFAULT NULL` / `group_suitability_max INT DEFAULT NULL`: capacity limits for matching group/squad size. `NULL` means no capacity data has been verified for this venue — `forgeMatcher.ts` must treat `NULL` as "no constraint applies" and skip group-size filtering entirely for that venue, rather than silently coercing to a range.

These fields will be declared as first-class columns on the `venues` table using PostgreSQL native types and check constraint enums, maintaining pattern consistency with the `operational_status` and `category` fields introduced in migration `0012_phase2_pricing_and_transport.sql`.

## Alternatives Considered
- **Generic JSONB Meta Column**: Store these fields inside a single `meta JSONB` blob on the `venues` table.
  - *Rejected*: While JSONB offers schema flexibility, it loses PostgreSQL check constraint validation at the database boundary, degrades indexing performance for multi-tag filters (e.g., GIN index on `TEXT[]`), and reduces type-safety validation inside the application query layer (`lib/types.ts`).
- **Normalized Join Tables**: Create separate join tables (e.g., `venue_audiences`, `venue_activities`).
  - *Rejected*: At our current pre-revenue beta scale, the performance cost and query complexity of multiple SQL joins for every Forge generation request outweighs the benefits. Flat columns on the `venues` table are easier to fetch and filter.

## Consequences
- **Positive**: Centralizes metadata validation inside the database via check constraints.
- **Positive**: Enables fast, indexed pre-filtering using standard GIN indexes (`audience_tags`, `activity_tags`) and B-Tree indexes (`dress_code`, `indoor_outdoor`).
- **Positive**: Maintains clean mappings inside `lib/types.ts` type-safe boundaries.
- **Negative**: Requires executing a new migration (`0025_venue_intelligence_schema.sql`) against the database.
- **Negative (Integration Scope)**: The new columns will feed `forgeMatcher.ts` ranking and scoring algorithms (e.g., adjusting `totalScore` via custom confidence, suitability, or vibe/intent bonuses). This will require significant matching engine logic modifications, which are out of scope for this schema ADR and will be defined and scoped separately once the schema is approved.
- **Design Decision — group_suitability NULL vs. verified-flag (Option A chosen over Option B)**:
  `group_suitability_min/max` default to `NULL`, not `1/20`. This was a deliberate choice over the alternative of `NOT NULL DEFAULT 1 / DEFAULT 20` with a companion `group_suitability_verified BOOLEAN NOT NULL DEFAULT FALSE` column (Option B, modelled on `operational_status`).

  Option B was rejected because `operational_status` describes *state* — every venue always has an operational state, so `NOT NULL` with a default is correct there. `group_suitability_min/max` describes *unverified capacity data* that simply has not been collected yet. Defaulting to `1/20` would silently assert a concrete capacity range for every venue in the database the moment the migration runs — exactly the same bug class as the `vibe_tags: ["Unknown"]` fallback that caused `semantic_classification_missing` in `forgeMatcher.ts` (fixed in commit `743bb4a`): data that looks real but was fabricated by the default.

  `NULL` is the correct sentinel here. It forces `forgeMatcher.ts` to make an explicit `if (spot.group_suitability_min !== null)` guard before applying any capacity filter or ranking boost, preventing silent inclusion of unverified range constraints. `date_suitability BOOLEAN DEFAULT FALSE` is kept as-is — it fails safe by *exclusion* (opt-in), whereas a non-null capacity default would fail by *silent inclusion*.

  **Implementation contract**: `forgeMatcher.ts`'s group-size filtering logic MUST treat NULL as "no constraint — do not exclude," consistent with existing `??` null-coalescing patterns (e.g. `transport_matrix` fallback). NULL must never be coerced to `0` or treated as a failed truthy check.

## Future Review Trigger
Review this schema when the matching engine is updated to support natural language query parsing (e.g., pgvector semantic matching) or if multi-location expansion requires localized, city-specific tag configurations.
