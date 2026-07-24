import { describe, it, expect } from "vitest";
import { allocateBudgetAcrossStops, sequenceStopsGeographically } from "./chainPlanner";
import { Spot } from "@/lib/types";

describe("Chain Planner Service", () => {
  describe("allocateBudgetAcrossStops", () => {
    it("should split budget equally when vibe sequence is not found", () => {
      const budget = 30000;
      const result = allocateBudgetAcrossStops(budget, "unknown_vibe", 3);
      expect(result).toEqual([10000, 10000, 10000]);
    });

    it("should allocate budget according to config weights", () => {
      const budget = 100000;
      const result = allocateBudgetAcrossStops(budget, "date_night", 3);
      // Weights for date_night are [0.55, 0.25, 0.20]
      expect(result).toEqual([55000, 25000, 20000]);
    });
  });

  describe("sequenceStopsGeographically", () => {
    it("should correctly order unvisited spots by proximity to current location", () => {
      const startCoords = { lat: 6.4474, lng: 3.4723 }; // Lekki

      const spots: Spot[] = [
        {
          id: "spot-yaba",
          name: "Yaba Spot",
          address: "Yaba",
          area_id: "yaba",
          price_per_person: 5000,
          transport_matrix: {},
          is_featured: false,
          active: true,
          coordinates: { lat: 6.5095, lng: 3.3711 }, // Medium distance
        },
        {
          id: "spot-lekki",
          name: "Lekki Spot",
          address: "Lekki",
          area_id: "lekki",
          price_per_person: 8000,
          transport_matrix: {},
          is_featured: false,
          active: true,
          coordinates: { lat: 6.4480, lng: 3.4730 }, // Very close to start
        },
      ];

      const ordered = sequenceStopsGeographically(spots, startCoords);
      expect(ordered[0].id).toBe("spot-lekki");
      expect(ordered[1].id).toBe("spot-yaba");
    });
  });
});
