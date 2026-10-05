import { describe, it, expect } from "vitest";
import { LocationService, UserLocation } from "@/lib/services/LocationService";
import { LocationService as GeoLocationService } from "@/lib/location/LocationService";
import { getTemporaryTransportEstimate, MAINLAND_TRANSPORT_ESTIMATE, ISLAND_TRANSPORT_ESTIMATE } from "@/lib/planning/temporaryTransport";

describe("useTransportCost calculation logic", () => {
  const sampleUserLoc: UserLocation = {
    id: "user-lekki",
    name: "Lekki Phase 1",
    coordinates: { lat: 6.4474, lng: 3.4723 },
    type: "home",
  };

  const sampleVenueCoords = { lat: 6.4281, lng: 3.4219 }; // VI (Island zone)
  const sampleMainlandCoords = { lat: 6.5095, lng: 3.3711 }; // Yaba (Mainland zone)

  it("calculates distance correctly for geographic reference", () => {
    const distanceKm = LocationService.calculateDistance(
      sampleUserLoc.coordinates,
      sampleVenueCoords
    );
    expect(distanceKm).toBeGreaterThan(3);
    expect(distanceKm).toBeLessThan(8);
  });

  it("computes cost per person using canonical temporary transport rule for Island venue", () => {
    const destinationArea = GeoLocationService.getClosestPlanningArea(sampleVenueCoords);
    const transportInfo = getTemporaryTransportEstimate(destinationArea.id);
    expect(transportInfo.zone).toBe("island");
    expect(transportInfo.cost).toBe(ISLAND_TRANSPORT_ESTIMATE);

    const squadSize = 2;
    const costPerPerson = Math.ceil(transportInfo.cost / squadSize);
    expect(costPerPerson).toBe(5000);
  });

  it("computes cost per person using canonical temporary transport rule for Mainland venue", () => {
    const destinationArea = GeoLocationService.getClosestPlanningArea(sampleMainlandCoords);
    const transportInfo = getTemporaryTransportEstimate(destinationArea.id);
    expect(transportInfo.zone).toBe("mainland");
    expect(transportInfo.cost).toBe(MAINLAND_TRANSPORT_ESTIMATE);

    const squadSize = 4;
    const costPerPerson = Math.ceil(transportInfo.cost / squadSize);
    expect(costPerPerson).toBe(1250);
  });
});
