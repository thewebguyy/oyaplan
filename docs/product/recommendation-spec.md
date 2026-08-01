# Recommendation Specification: Input Mapping, Snapping, and Matching Rules

This document defines the functional specification for OyaPlan’s recommendation system. It acts as the product requirements document (PRD) for how inputs map to output recommendations.

---

## 1. Input Interface

The recommendation system consumes a strictly defined input payload. All inputs must be validated at the boundary before being passed to the planning engine.

### JSON Schema Specification
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "startArea": {
      "type": "string",
      "description": "Slug of the starting neighborhood (e.g. 'ikeja')."
    },
    "squadSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 12,
      "description": "Number of participants in the outing."
    },
    "budget": {
      "type": "integer",
      "minimum": 1000,
      "description": "Total spending limit per person (in NGN)."
    },
    "vibe": {
      "type": "string",
      "description": "Requested vibe tag (e.g. 'chill', 'vibrant')."
    },
    "pinnedSpotId": {
      "type": "string",
      "format": "uuid",
      "description": "Optional spot ID that must bypass filtering."
    }
  },
  "required": ["squadSize", "budget"]
}
```

---

## 2. Location Snapping & Proximity Rules

Starting coordinates must be snapped to canonical areas before calculations begin.

### Snapping Flow
1. **Raw Coordinate Retrieval**: The browser Geolocation API returns a coordinate payload:
   ```ts
   { lat: 6.5095, lng: 3.3711 }
   ```
2. **Proximity Search**: The resolver iterates through verified neighborhoods in Lagos:
   - For each neighborhood, compute distance using the Haversine equation.
   - Snap to the closest area.
3. **Proximity States**:
   - **GPS Detection**: If snapped within $3\text{ km}$, output `status: "gps"` and `resolvedName: "Near [Area Name]"`.
   - **Manual Override**: If the user overrides or selects a neighborhood, output `status: "manual"` and `resolvedName: "[Area Name]"`.

---

## 3. Cost Calculations & Budget Rules

Outing cost calculations must include all physical variables to guarantee budget confidence.

### The Formula
$$\text{Total Cost} = (\text{Base Price} \times \text{Squad Size}) + \text{Transit Fare}$$

- **Base Price Inclusions**:
  - Net activity/food cost.
  - Tax multiplier: $1.175$ (representing $7.5\%$ VAT and $10\%$ service charge where applicable).
- **Transit Cost Matrix**:
  Transit cost is determined by zone-to-zone matrix lookups. For example:
  - Mainland to Mainland: ₦1,500 - ₦3,000.
  - Island to Island: ₦2,000 - ₦3,500.
  - Mainland to Island (Cross-bridge): ₦4,500 - ₦7,500.

### Constraint Check
Any spot where $\text{Total Cost} > (\text{Budget} \times \text{Squad Size})$ is excluded from the recommendations list.

---

## 4. Ranking & Selection Logic

Surviving candidates are ranked using the Multi-Objective utility score. The engine returns a sorted array of candidate cards.

### Score Breakdown
- **Vibe Match Score (25% weight)**: Matches user input tag against venue tags.
- **Budget Fit (20% weight)**: Highest score for venues utilizing 50%-90% of the budget ceiling.
- **Data Confidence (20% weight)**: Venues verified within 30 days get maximum trust values.
- **Featured Bias (10% weight)**: Subtle lift for verified partner listings.

---

## 5. Output Card ViewModel

The engine outputs a list of structured decision cards for the presentation layer:

```ts
interface DecisionCardViewModel {
  spotId: string;
  spotName: string;
  heroImage?: string;
  totalCost: number;       // Activity + Transport combined
  venueCost: number;       // Activity cost only
  transportCost: number;   // Transit fare only
  travelInfo?: string;     // e.g. "🚗 About 14 min (3.2 km)"
  budgetFit: string;       // e.g. "Fits ₦15,000 squad budget"
  trustIndicator: {
    level: "high" | "medium" | "low";
    label: string;
    description: string;
  };
}
```
This ensures the presentation layer is isolated and only renders pre-computed visual view models.
