# OyaPlan Spot Data Guide: Transport Matrix Policy

To ensure scalability and maintainability of the OyaPlan database, we use a **Sparse Transport Matrix** strategy.

## The Policy
The `transport_matrix` field in the `spots` table should only be populated for spots where transport costs genuinely deviate from the standard **Lagos 2026 Zone Fare Formula**.

### When to use an override (populate the matrix):
- **Gated / Restricted Access:** Spots with mandatory access fees or limited entry points (e.g., Eko Atlantic).
- **Waterfront / Island access:** Spots requiring boat fares (e.g., Tarkwa Bay, Ilashe).
- **Deep Expressway Locations:** Spots far beyond standard area centroids (e.g., LCC deep into Lekki-Epe).
- **Premium Parking:** Venues where valet or secure parking is a mandatory part of the transport cost.

### When to leave it empty (`{}`):
- **Standard Access:** Restaurants, bars, and cafes with direct road access in typical area clusters (Ikeja GRA, Lekki Phase 1 core, etc.).
- **Common Areas:** Most spots in Mainland, Central, and Island zones are correctly handled by the `calculateZoneFare` function.

## Maintenance
Leaving the matrix empty allows the system to automatically benefit from formula updates (e.g., fuel price adjustments) without requiring a manual update of every spot record.
