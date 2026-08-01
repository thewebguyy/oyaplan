# Product & Business Roadmap: From MVP to African Expansion

This document outlines the strategic phases, operational milestones, and product timelines for OyaPlan. It provides cross-functional guidance on how the product evolves from its current Lagos MVP to regional scale.

---

## 1. Roadmap Horizon Overview

OyaPlan scales systematically across four strategic execution horizons:

```
                  ┌──────────────────────────────────────────────┐
  HORIZON 1       │ Stabilization, Hardening, and Core Trust     │ ◄── [We are here]
  (Month 1-2)     │ - Focus: Documentation, test coverage, data  │
                  └──────────────────────────────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
  HORIZON 2       │ Curated Collections & Local Discovery        │
  (Month 3-5)     │ - Focus: Budget-themed discovery decks       │
                  └──────────────────────────────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
  HORIZON 3       │ Contextual Semantic Search                   │
  (Month 6-8)     │ - Focus: Text querying, natural tags matching│
                  └──────────────────────────────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
  HORIZON 4       │ Regional Scaling & West-Africa Expansion     │
  (Month 9-12)    │ - Focus: Multi-city support (Accra, Accra)   │
                  └──────────────────────────────────────────────┘
```

---

## 2. Phase Details & Deliverables

### Phase 1: Stabilization & Hardening (Current Phase)
Ensure that the codebase is robust, predictable, and fully documented.
- **Key Deliverables**:
  - [x] Complete test coverage on matching and costing core.
  - [x] Executive documentation suite.
  - [x] Strict boundary enforcement on the planning engine.
- **Success Metric**: 100% compile correctness and sub-2ms engine execution times.

### Phase 2: Curated Collections (Month 3-5)
Improve engagement by letting users explore pre-compiled, theme-based venue decks.
- **Concepts**:
  - Collections such as *"Romantic Date Nights Under ₦20k"* or *"Mainland Laptop Cafés"*.
  - Curated card stack overrides mapped to the `PlanningEngine` cost formulas.
- **Success Metric**: 30% increase in weekly active planners (WAU).

### Phase 3: Semantic Contextual Search (Month 6-8)
Evolve candidate filtering from absolute vibe tags to semantic search terms.
- **Concepts**:
  - Allow queries like *"quiet place with outdoor seating"* or *"celebrating birthday with 5 friends"*.
  - Map terms to corresponding subcategories and vibe scores.
- **Success Metric**: Match-to-click conversion rate $> 45\%$.

### Phase 4: Regional Expansion (Month 9-12)
Scale the platform to other major urban centers in West Africa.
- **Target Cities**: Accra (Ghana), Nairobi (Kenya), Kigali (Rwanda).
- **Core Strategy**:
  - Establish regional currency conversions in the `CostEngine`.
  - Import localized transportation matrix values (e.g. taxi/boda-boda fare configurations).
  - Mirror the Friday phone-verification operations cycle with local content partners.
- **Success Metric**: Launching in 2 new cities with $>150$ verified venues each.
