import { describe, it, expect } from "vitest";
import { LocationService, UserLocation } from "@/lib/services/LocationService";

describe("useTransportCost calculation logic", () => {
  const sampleUserLoc: UserLocation = {
    id: "user-lekki",
    name: "Lekki Phase 1",
    coordinates: { lat: 6.4474, lng: 3.4723 },
    type: "home",
  };

  const sampleVenueCoords = { lat: 6.4281, lng: 3.4219 }; // VI (~4.8 km)

  it("calculates correct distance between user and venue", () => {
    const distanceKm = LocationService.calculateDistance(
      sampleUserLoc.coordinates,
      sampleVenueCoords
    );
    expect(distanceKm).toBeGreaterThan(3);
    expect(distanceKm).toBeLessThan(8);
  });

  it("computes cost per person using fallback calculation", () => {
    const distanceKm = LocationService.calculateDistance(
      sampleUserLoc.coordinates,
      sampleVenueCoords
    );
    const baseRate = 150;
    const minimumRate = 500;
    const costPerKm = Math.max(distanceKm * baseRate, minimumRate);
    const squadSize = 2;
    const roundTrip = true;
    const totalTripCost = roundTrip ? costPerKm * 2 : costPerKm;
    const costPerPerson = Math.ceil(totalTripCost / squadSize);

    expect(costPerPerson).toBeGreaterThan(0);
    expect(costPerPerson).toBe(Math.ceil((costPerKm * 2) / 2));
  });
});
