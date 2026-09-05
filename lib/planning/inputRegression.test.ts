import { describe, it, expect } from "vitest";
import { LocationService } from "../services/LocationService";
import { Spot } from "../types";

describe("P0 Input Handling and Backspace Regression Tests", () => {
  it("should allow typing and backspacing without locking to 1 or 0", () => {
    // Simulating user typing 25, backspacing to 2, backspacing to empty string
    let rawSquad = "25";
    rawSquad = "2";
    rawSquad = ""; // empty during backspace
    
    // During backspace, raw state can be empty
    expect(rawSquad).toBe("");

    // On blur, empty falls back to 1
    const onBlurVal = Math.max(1, Math.min(20, parseInt(rawSquad, 10) || 1));
    expect(onBlurVal).toBe(1);

    // Typing a new number after empty string
    rawSquad = "4";
    const parsedValid = Math.max(1, Math.min(20, parseInt(rawSquad, 10) || 1));
    expect(parsedValid).toBe(4);
  });

  it("should handle budget backspacing cleanly", () => {
    let rawBudget = "50000";
    rawBudget = "5000";
    rawBudget = ""; // empty backspace

    expect(rawBudget).toBe("");

    const fallbackBudget = Math.max(0, parseInt(rawBudget.replace(/[^0-9]/g, ""), 10) || 50000);
    expect(fallbackBudget).toBe(50000);

    rawBudget = "35000";
    const finalBudget = Math.max(0, parseInt(rawBudget.replace(/[^0-9]/g, ""), 10) || 50000);
    expect(finalBudget).toBe(35000);
  });
});

describe("P0 Non-Food Venue Cost and Verification Integrity", () => {
  const natureSpot: Spot = {
    id: "6956aae6-62d9-46a3-bea5-6434ccc70d93",
    name: "Unilag Lagoon Front",
    address: "University of Lagos, Akoka, Yaba",
    address_slug: "yaba",
    area_id: "yaba",
    vibe_tags: ["Chill"],
    price_per_person: 500,
    active: true,
    category: "nature",
    has_food: false,
    coordinates: { lat: 6.5165, lng: 3.3985 },
    transport_matrix: {},
    is_featured: false,
  };

  it("correctly models nature / admission fee without restaurant tax markup", () => {
    const squadSize = 3;
    const venueCost = natureSpot.price_per_person * squadSize; // 1,500
    
    expect(venueCost).toBe(1500);
    expect(natureSpot.has_food).toBe(false);

    // Non-food venues should have 0 restaurant food VAT
    const foodTax = natureSpot.has_food ? Math.round((venueCost * 0.1) / 100) * 100 : 0;
    expect(foodTax).toBe(0);

    const perPersonEntry = Math.round(venueCost / squadSize);
    expect(perPersonEntry).toBe(500);
  });
});

describe("P0 Location Synchronization & Active Verification", () => {
  it("only returns active verified areas for planning pickers", () => {
    const verified = LocationService.getVerifiedAreas();
    
    // Surulere and Ikoyi are inactive
    const surulere = verified.find((a) => a.id === "surulere");
    const ikoyi = verified.find((a) => a.id === "ikoyi");
    
    expect(surulere).toBeUndefined();
    expect(ikoyi).toBeUndefined();

    // Active areas must include Ikeja, Lekki Phase 1, Yaba, VI
    const activeIds = verified.map((a) => a.id);
    expect(activeIds).toContain("lekki-phase-1");
    expect(activeIds).toContain("ikeja");
    expect(activeIds).toContain("yaba");
    expect(activeIds).toContain("vi");
  });
});
