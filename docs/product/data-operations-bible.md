# Data Operations Bible: Verification, Confidence, and Data Quality Playbook

This document defines the operational procedures, data schemas, verification workflows, and moderation guidelines for OyaPlan's venue and transportation data registry. It serves as the primary playbook for operations teams and data auditors.

---

## 1. The Venue Data Lifecycle

All physical venues (spots) in the OyaPlan registry progress through a strict, audited state machine to guarantee that only trustworthy recommendations are displayed.

```
       [Raw Submission]
              │
              ▼
   ┌──────────────────────┐
   │       Drafted        │ ───► Missing core coordinates, menu items, or pricing
   └──────────────────────┘
              │
              ▼ (Verify location & base menu pricing)
   ┌──────────────────────┐
   │      Unverified      │ ───► Core data present, but pending confirmation call
   └──────────────────────┘
              │
              ▼ (Audited call or site receipt uploaded)
   ┌──────────────────────┐
   │       Verified       │ ───► Displayed in active recommendation pools
   └──────────────────────┘
         │          │
         │          ▼ (Unverified for 60+ days or high variance reported)
         │   ┌──────────────┐
         │   │  Suspended   │ ◄── [Pulled from recommendations pool]
         │   └──────────────┘
         │          │
         ▼ (Permanent closing)
   ┌──────────────────────┐
   │       Archived       │
   └──────────────────────┘
```

### State Transitions
- **Drafted**: Venue has basic descriptors (Name, Category) but lacks pricing arrays or snapping geocoordinates.
- **Unverified**: Core coordinates and historical pricing are present, but the venue has not been called/audited within 60 days.
- **Verified**: Active state. Pricing was audited via direct phone check, venue partner API, or audited receipt within 30 days. Available for recommendations.
- **Suspended**: Pricing variance exceeds ±15% based on user receipt feedback, or manual audit fails. Automatically hidden from engine suggestion loops.
- **Archived**: Venue is permanently closed or out-of-service.

---

## 2. Ingestion & Verification Workflows

### 2.1 The Weekly Operations Rhythm
Every week, the Operations team runs the following cycle:
1. **Monday (Auditing Queue)**: Pull the top 20% high-traffic venues and any venues with active `variance_flag === true`.
2. **Tuesday - Thursday (Active Verification)**: Call or visit target venues. Update menu pricing arrays in the database.
3. **Friday (Transport & Snap Check)**: Test average Uber/Bolt fares across primary Lagos routes (Mainland to Island corridors) and update the regional pricing matrix.

### 2.2 Audited Ingestion Checklist
When verifying a venue, the operator must confirm:
- [ ] **Menu Conformity**: Ensure the listed price includes local consumption tax (e.g. Lagos State hotel occupancy tax if applicable).
- [ ] **Service Overlays**: Document whether the venue enforces a mandatory 10% service charge or automatic gratuity.
- [ ] **Active Coordinates**: Verify that the snapped neighborhood matches the physical entrance of the venue, ensuring correct travel snapping.

---

## 3. The OyaScore Confidence Engine

The user-facing confidence rating represents the statistical trust of the underlying pricing data.

### Mathematical Components
The confidence score $C$ (scaled between 0% and 100%) is calculated using:
$$C = 0.50 \times F_{\text{score}} + 0.30 \times A_{\text{score}} + 0.20 \times V_{\text{score}}$$

- **Freshness Score ($F_{\text{score}}$)**:
  - Last verified $\le 15\text{ days}$: 100 points.
  - Last verified $16 - 30\text{ days}$: 80 points.
  - Last verified $31 - 60\text{ days}$: 40 points.
  - Last verified $> 60\text{ days}$: 0 points.
- **Accuracy Score ($A_{\text{score}}$)**:
  - Median variance of user-reported actual spend vs. estimate:
    - Variance $\le 5\%$: 100 points.
    - Variance $\le 10\%$: 85 points.
    - Variance $\le 15\%$: 50 points.
    - Variance $> 15\%$: 0 points.
- **Volume Score ($V_{\text{score}}$)**:
  - Calculated based on the log count of receipts submitted:
    $$V_{\text{score}} = \min\left(100, \frac{\ln(\text{receipts} + 1)}{\ln(10)} \times 100\right)$$

### Minimum Data Bar
A venue will show `"Limited Data"` rather than a percentage score if it has fewer than **2 verified audits** or **1 user receipt feedback submit**. This prevents showing misleading high-confidence ratings on sparse inputs.

---

## 4. Audits & Governance Loops

### Quarterly Audit Cadence
1. **Random Sampling**: Every quarter, the operations lead pulls a random sample of 15% of all "Verified" spots to run independent checks.
2. **Estimator Evaluation**: Audit the accuracy of the transport matrix. Ensure the zone fares configured in `MatrixTransportProvider` are within a 10% tolerance limit of actual real-world ride-hail averages.
3. **Audit Trail Integrity**: Every price adjustment must log the operator's ID, change timestamp, and evidence source URL (e.g., link to a digital menu photo or receipt audit image).
