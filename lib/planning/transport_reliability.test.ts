import { describe, it, expect } from "vitest";
import {
  TransportPricingProvider,
  TransportConfidenceProvider,
  TransportDisplayFormatter,
} from "./transport";

describe("Transport Fallbacks & Boundary Reliability", () => {
  describe("Successful route estimates", () => {
    it("returns deterministic available zone fare for Mainland destinations", () => {
      const range = TransportPricingProvider.calculateRange("ikeja", "surulere", "ride-hailing", undefined, undefined, 2);
      expect(range.status).toBe("available");
      expect(range.minCost).toBe(5000);
      expect(range.maxCost).toBe(5000);
      expect(range.midpointCost).toBe(5000);
      expect(range.costPerPerson).toBe(2500);

      const confidence = TransportConfidenceProvider.evaluate("ikeja", "surulere", "ride-hailing", false, undefined, undefined, range.status);
      expect(confidence.score).toBe(90);
      expect(confidence.label).toBe("Deterministic zone estimate");
      expect(confidence.badgeColor).toBe("green");
    });

    it("returns deterministic available zone fare for Island destinations", () => {
      const estimate = TransportPricingProvider.calculateEstimate("ikeja", "vi", 4);
      expect(estimate.status).toBe("available");
      expect(estimate.midpointCost).toBe(10000);
      expect(estimate.costPerPerson).toBe(2500);
      expect(estimate.isCrossWater).toBe(true);
    });
  });

  describe("Missing route data & honest unavailable semantics", () => {
    it("marks status unavailable with NO_ROUTE_DATA when both origin and destination are anywhere/unknown", () => {
      const range = TransportPricingProvider.calculateRange("anywhere", "unknown");
      expect(range.status).toBe("unavailable");
      expect(range.reason).toBe("NO_ROUTE_DATA");
      expect(range.minCost).toBe(0);
      expect(range.maxCost).toBe(0);
      expect(range.midpointCost).toBe(0);
      expect(range.costPerPerson).toBe(0);

      // Verify that TransportConfidenceProvider honestly marks unavailable rather than claiming high confidence
      const confidence = TransportConfidenceProvider.evaluate("anywhere", "unknown", "ride-hailing", false, undefined, undefined, range.status);
      expect(confidence.score).toBe(0);
      expect(confidence.label).toBe("Transport unavailable");
      expect(confidence.badgeColor).toBe("orange");

      // Verify display formatter does not output ₦0 as a fake price
      const formatted = TransportDisplayFormatter.formatRange(range.minCost, range.maxCost);
      expect(formatted).toBe("Unavailable for this route");
    });
  });

  describe("Boundary inputs & non-finite sanity", () => {
    it("safely handles NaN, negative, or zero partySize without producing NaN costs", () => {
      const nanRange = TransportPricingProvider.calculateRange("yaba", "ikeja", "ride-hailing", undefined, undefined, NaN);
      expect(Number.isFinite(nanRange.costPerPerson)).toBe(true);
      expect(nanRange.costPerPerson).toBe(5000);

      const zeroRange = TransportPricingProvider.calculateRange("yaba", "ikeja", "ride-hailing", undefined, undefined, 0);
      expect(Number.isFinite(zeroRange.costPerPerson)).toBe(true);
      expect(zeroRange.costPerPerson).toBe(5000);

      const negativeRange = TransportPricingProvider.calculateRange("yaba", "ikeja", "ride-hailing", undefined, undefined, -4);
      expect(Number.isFinite(negativeRange.costPerPerson)).toBe(true);
      expect(negativeRange.costPerPerson).toBe(5000);
    });

    it("formats known range cleanly without string degradation", () => {
      expect(TransportDisplayFormatter.formatRange(5000, 5000)).toBe("₦5,000");
      expect(TransportDisplayFormatter.formatRange(5000, 8000)).toBe("₦5,000 – ₦8,000");
    });
  });
});
