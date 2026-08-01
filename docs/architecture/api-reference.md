# API & Hook Reference Documentation

This document defines the TypeScript interfaces, function parameters, and class signatures of OyaPlan's core API interfaces and custom React hooks.

---

## 1. Custom React Hooks

### `useRecommendations`
React hook that coordinates location state from `useOrigin()` and executes the recommendation engines.

- **Import**: `import { useRecommendations } from '@/lib/planning/useRecommendations';`
- **Signature**:
  ```ts
  function useRecommendations(props: {
    spots: Spot[];
    request: Omit<PlanningRequest, "startArea">;
    dependencies?: PlanningDependencies;
    isAdjacent?: boolean;
  }): {
    plans: ExplainedPlan[];
    origin: Origin | null;
    status: LocationStatus;
  }
  ```
- **Inputs**:
  - `spots`: Collection of active candidate spots.
  - `request`: User's constraints (squad size, budget, vibe).
  - `dependencies`: Override implementation defaults (e.g. mock estimators in testing).
  - `isAdjacent`: Set to true to include adjacent zone suggestions.

### `useOrigin`
React hook that exposes the active location state and coordinates detection triggers.

- **Import**: `import { useOrigin } from '@/lib/location/OriginContext';`
- **Signature**:
  ```ts
  function useOrigin(): {
    origin: Origin | null;
    status: LocationStatus;
    requestCurrentLocation(): Promise<void>;
    setManualOrigin(slug: string): void;
    clearOrigin(): void;
  }
  ```
- **States**:
  - `status`: Active location phase (`"idle"`, `"locating"`, `"gps"`, `"manual"`, `"permission-denied"`, `"error"`).

---

## 2. Core Domain Interfaces

### `PlanningEngine`
Unified orchestrator executing the planning pipeline in memory.

- **Import**: `import { PlanningEngine } from '@/lib/planning/planningEngine';`
- **Signature**:
  ```ts
  function PlanningEngine(
    context: PlanningContext,
    dependencies: PlanningDependencies = DEFAULT_PLANNING_DEPS,
    spots: Spot[],
    isAdjacent: boolean = false
  ): ExplainedPlan[]
  ```

### `OriginResolver`
Resolves browser GPS coordinates or neighborhood strings into canonical outing origins.

- **Import**: `import { OriginResolver } from '@/lib/location/LocationService';`
- **Methods**:
  - **`resolveGPSOrigin(coordinates: Coordinates): Origin`**
    Calculates closest canonical area slug using Haversine distance.
  - **`resolveManualOrigin(areaSlug: string): Origin`**
    Matches area slug, name, or aliases to return an exact origin struct.

---

## 3. Data Contracts

### `Origin` Struct
```ts
interface Origin {
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
  planningAreaSlug: string; // Snapped canonical ID
  source: "gps" | "manual";
  resolvedName: string;      // Visual name (e.g., "Ikeja")
}
```

### `ExplainedPlan` Struct
```ts
interface ExplainedPlan {
  spot: Spot;
  activityCost: number;
  transportCost: number;
  totalCost: number;
  whyItFits: string;
  decisionSummary: string;
  travelInfo?: string;
  isAdjacentZoneSuggestion: boolean;
}
```
