import { describe, it, expect } from "vitest";
import { generateTrustSignals } from "./trustEvaluator";
import { applyPlanAdjustment } from "./forgeMatcher";
import { ForgeInput, PlanAdjustment, Spot } from "../../types";

describe("trustEvaluator", () => {
  it("should evaluate budget fit correctly", () => {
    const spot = {} as Spot;
    expect(generateTrustSignals(spot, 5000, 5000).budgetFit).toBe("Within budget");
    expect(generateTrustSignals(spot, 4000, 5000).budgetFit).toBe("Within budget");
    expect(generateTrustSignals(spot, 5500, 5000).budgetFit).toBe("Slight stretch");
    expect(generateTrustSignals(spot, 5750, 5000).budgetFit).toBe("Slight stretch");
    expect(generateTrustSignals(spot, 6000, 5000).budgetFit).toBe("Over budget");
  });

  it("should evaluate price freshness correctly", () => {
    const now = new Date();
    
    // Verified this week (within 7 days)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 3600 * 1000);
    const spotWeek = { price_updated_at: threeDaysAgo.toISOString() } as Spot;
    expect(generateTrustSignals(spotWeek, 1000, 1000).priceFreshness).toBe("Verified this week");
    
    // Verified recently (within 90 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    const spotRecent = { price_updated_at: thirtyDaysAgo.toISOString() } as Spot;
    expect(generateTrustSignals(spotRecent, 1000, 1000).priceFreshness).toBe("Verified recently");
    
    // Estimated (over 90 days)
    const hundredDaysAgo = new Date(now.getTime() - 100 * 24 * 3600 * 1000);
    const spotStale = { price_updated_at: hundredDaysAgo.toISOString() } as Spot;
    expect(generateTrustSignals(spotStale, 1000, 1000).priceFreshness).toBe("Estimated");

    // No date
    const spotNone = {} as Spot;
    expect(generateTrustSignals(spotNone, 1000, 1000).priceFreshness).toBe("Estimated");
  });

  it("should evaluate operational confidence correctly", () => {
    expect(generateTrustSignals({ verified_by: "fresh" } as Spot, 1000, 1000).operationalConfidence).toBe("Hours recently confirmed");
    expect(generateTrustSignals({ verified_by: "owner_verified" } as Spot, 1000, 1000).operationalConfidence).toBe("Hours recently confirmed");
    expect(generateTrustSignals({ verified_by: "community_verified" } as Spot, 1000, 1000).operationalConfidence).toBe("Hours may vary");
    expect(generateTrustSignals({ verified_by: "stale" } as Spot, 1000, 1000).operationalConfidence).toBe("Hours may vary");
    expect(generateTrustSignals({} as Spot, 1000, 1000).operationalConfidence).toBe("Hours may vary");
  });
});

describe("applyPlanAdjustment", () => {
  it("should overlay plan adjustments on original inputs", () => {
    const originalInput: ForgeInput = {
      startArea: "ikeja",
      squadSize: 2,
      budget: 10000,
      vibe: "Date Night"
    };

    const adjustment: PlanAdjustment = {
      budget: 15000,
      squadSize: 3
    };

    const result = applyPlanAdjustment(originalInput, adjustment);
    
    expect(result.budget).toBe(15000);
    expect(result.squadSize).toBe(3);
    expect(result.startArea).toBe("ikeja"); // unchanged
    expect(result.vibe).toBe("Date Night"); // unchanged
  });
});
