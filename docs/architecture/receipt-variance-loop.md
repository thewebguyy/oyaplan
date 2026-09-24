# Receipt-to-Estimate Variance Intelligence Loop

## 1. Trust Hierarchy & Fact Separation

OyaPlan maintains a strict separation of facts across the outing lifecycle:

```text
┌──────────────────────┐
│        PLAN          │  Customer intent & estimated cost calculated before leaving home.
│ (shared_plans)       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     ATTRIBUTION      │  Venue operator confirms squad arrived with an OyaPlan code.
│(venue_attributed_    │  * Does NOT prove money was collected.
│      visits)         │  * Does NOT mean a reservation was held.
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     ACTUAL SPEND     │  Customer or venue submits till receipt or verified total spend.
│(actual_spend_reports)│  * Proves real cash spent.
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ VARIANCE INTELLIGENCE│  Mathematical delta between estimate and actual bill.
│ (audit triggers)     │  * Directly refines future planning confidence.
└──────────────────────┘
```

---

## 2. Mathematical Definition of Variance

For any attributed visit with a corresponding actual spend report:

$$\text{Variance \%} = \frac{\text{Actual Total} - \text{Estimated Total}}{\text{Estimated Total}} \times 100$$

### Interpretation Bands

| Variance Range | Classification | System Action |
| :--- | :--- | :--- |
| **-10% to +10%** | **High Confidence** | Venue trust score increases; listed pricing is confirmed accurate. |
| **+10% to +20%** | **Mild Drift** | Likely squad ordered additional items or surge tax occurred. |
| **> +20%** | **Bill Shock Risk** | Triggers automatic price review flag in Operator Portal. |
| **< -20%** | **Under-Spend Drift** | Indicates over-estimation or squad left early; reviewed for menu accuracy. |

---

## 3. Data Model Connectivity

### 1. Plan Creation
```sql
shared_plans (
  id UUID PRIMARY KEY,
  plan_code TEXT UNIQUE, -- e.g. OYA-7K4M2P
  spot_id UUID REFERENCES venues(id),
  squad_size INT,
  total_cost INT -- Estimated outing total
)
```

### 2. Attribution at Venue
```sql
venue_attributed_visits (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES venues(id),
  shared_plan_id UUID REFERENCES shared_plans(id),
  plan_code TEXT,
  confirmed_at TIMESTAMPTZ,
  confirmed_by TEXT,
  UNIQUE(venue_id, shared_plan_id) -- Idempotent
)
```

### 3. Spend Evidence Submission
```sql
actual_spend_reports (
  id UUID PRIMARY KEY,
  shared_plan_id UUID REFERENCES shared_plans(id),
  spot_id UUID REFERENCES venues(id),
  estimated_total INT,
  actual_total INT,
  notes TEXT,
  submitted_at TIMESTAMPTZ
)
```

---

## 4. Closed-Loop Operator Intelligence

When the rolling median variance for a venue exceeds 15% across 3 or more squad outings:

1. **Information Freshness Degradation**:
   * The venue's freshness indicator shifts from `Fresh` to `Verification Recommended`.
2. **Action Center Notice**:
   * The venue's portal displays an Action Card:
     > *"Planners at your venue report spending ~18% higher than current listed menu items. Confirm your prices or check mandatory service fees to maintain recommendation priority."*
3. **Transparent Consumer Warning**:
   * If unaddressed, consumer decision cards display:
     > *"Planners frequently report bills slightly higher than listed menu prices."*

This closed loop creates an organic, self-healing incentive for venues to keep pricing and policies accurate without relying on manual field agents.
