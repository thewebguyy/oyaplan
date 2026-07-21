import { describe, it, expect, beforeEach, vi } from "vitest";
import { LocationService, UserLocation } from "./LocationService";

describe("LocationService", () => {
  beforeEach(() => {
    // Mock localStorage in Node/Vitest env if undefined or reset mock store
    const store: Record<string, string> = {};
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
    });
  });

  it("getVerifiedAreas returns list of 6 verified areas", () => {
    const areas = LocationService.getVerifiedAreas();
    expect(areas).toHaveLength(6);
    expect(areas.map((a) => a.id)).toEqual([
      "lekki",
      "yaba",
      "ikeja",
      "vi",
      "ikoyi",
      "surulere",
    ]);
  });

  it("searchAreas filters areas correctly by name and alias", () => {
    const lekkiMatch = LocationService.searchAreas("Phase 1");
    expect(lekkiMatch).toHaveLength(1);
    expect(lekkiMatch[0].id).toBe("lekki");

    const yabaMatch = LocationService.searchAreas("yaba");
    expect(yabaMatch).toHaveLength(1);
    expect(yabaMatch[0].id).toBe("yaba");

    const emptyMatch = LocationService.searchAreas("");
    expect(emptyMatch).toHaveLength(6);
  });

  it("calculateDistance calculates Haversine distance in km", () => {
    const lekkiCoords = { lat: 6.4474, lng: 3.4723 };
    const viCoords = { lat: 6.4281, lng: 3.4219 };
    const dist = LocationService.calculateDistance(lekkiCoords, viCoords);
    expect(dist).toBeGreaterThan(3);
    expect(dist).toBeLessThan(8);
  });

  it("getNearestArea returns the closest verified location", () => {
    const nearYabaUser: UserLocation = {
      id: "test-user-1",
      name: "Near Yaba",
      coordinates: { lat: 6.51, lng: 3.372 },
      type: "current",
    };

    const nearest = LocationService.getNearestArea(nearYabaUser);
    expect(nearest.id).toBe("yaba");
  });

  it("isValidArea validates existing and non-existing area IDs", () => {
    expect(LocationService.isValidArea("lekki")).toBe(true);
    expect(LocationService.isValidArea("yaba")).toBe(true);
    expect(LocationService.isValidArea("unknown_area")).toBe(false);
  });

  it("saveUserLocation and getUserLocation work with localStorage", () => {
    const sampleUserLoc: UserLocation = {
      id: "saved-1",
      name: "Home",
      coordinates: { lat: 6.4474, lng: 3.4723 },
      type: "home",
      savedAt: 123456789,
    };

    LocationService.saveUserLocation(sampleUserLoc);
    const retrieved = LocationService.getUserLocation();
    expect(retrieved).toEqual(sampleUserLoc);
  });
});
