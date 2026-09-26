import { describe, it, expect } from "vitest";
import { VarianceEngine } from "../varianceEngine";

describe("OyaPlan Phase 9 — Trust & Variance Intelligence Engine", () => {
  describe("Mathematical Variance Calculation", () => {
    it("Scenario A: Accurate plan (₦50k estimated, ₦49k actual) -> -2% variance, no action required", () => {
      const result = VarianceEngine.analyzeVariance({
        estimatedTotal: 50000,
        actualTotal: 49000,
      });

      expect(result.varianceAmount).toBe(-1000);
      expect(result.variancePercentage).toBe(-2);
      expect(result.severity).toBe("accurate");
      expect(result.operationalTrigger.actionRequired).toBe(false);
      expect(result.operationalTrigger.urgency).toBe("none");
    });

    it("Scenario B: 12% variance (₦50k estimated, ₦56k actual) -> mild drift, no 15% reverification trigger", () => {
      const result = VarianceEngine.analyzeVariance({
        estimatedTotal: 50000,
        actualTotal: 56000,
      });

      expect(result.varianceAmount).toBe(6000);
      expect(result.variancePercentage).toBe(12);
      expect(result.severity).toBe("mild_drift");
      expect(result.operationalTrigger.actionRequired).toBe(false);
      expect(result.operationalTrigger.urgency).toBe("routine");
    });

    it("Scenario C: 20% variance (₦50k estimated, ₦60k actual) -> >15% reverification trigger within 48h", () => {
      const result = VarianceEngine.analyzeVariance({
        estimatedTotal: 50000,
        actualTotal: 60000,
      });

      expect(result.varianceAmount).toBe(10000);
      expect(result.variancePercentage).toBe(20);
      expect(result.severity).toBe("reverification_required");
      expect(result.operationalTrigger.actionRequired).toBe(true);
      expect(result.operationalTrigger.urgency).toBe("urgent");
      expect(result.operationalTrigger.recommendedAction).toContain("48h");
    });

    it("Scenario D: 40% variance (₦50k estimated, ₦70k actual) -> >30% serious discrepancy / escalation", () => {
      const result = VarianceEngine.analyzeVariance({
        estimatedTotal: 50000,
        actualTotal: 70000,
      });

      expect(result.varianceAmount).toBe(20000);
      expect(result.variancePercentage).toBe(40);
      expect(result.severity).toBe("severe_discrepancy");
      expect(result.operationalTrigger.actionRequired).toBe(true);
      expect(result.operationalTrigger.urgency).toBe("critical");
      expect(result.operationalTrigger.recommendedAction).toContain("founder review");
    });

    it("Scenario E: Transport-only variance (Menu correct, transport surged) -> transport source, does not penalize venue", () => {
      const result = VarianceEngine.analyzeVariance({
        estimatedTotal: 50000,
        actualTotal: 58000, // ₦8,000 diff
        estimatedFood: 40000,
        actualFood: 40000,
        estimatedTransport: 10000,
        actualTransport: 18000, // Driven by transport surge
      });

      expect(result.source).toBe("transport_surge");
      expect(result.operationalTrigger.recommendedAction).toContain("transport calibration");
    });

    it("Scenario F: Squad size changed (Plan 4 people, Actual 6 people) -> squad source, no venue penalty", () => {
      const result = VarianceEngine.analyzeVariance({
        estimatedTotal: 40000,
        actualTotal: 60000,
        plannedSquadSize: 4,
        actualSquadSize: 6,
      });

      expect(result.source).toBe("squad_size_change");
      expect(result.operationalTrigger.actionRequired).toBe(false);
      expect(result.operationalTrigger.recommendedAction).toContain("squad/choice variance");
    });

    it("handles zero and negative estimate edge cases safely without crashing", () => {
      const { amount, percentage } = VarianceEngine.calculateVariance(0, 0);
      expect(amount).toBe(0);
      expect(percentage).toBe(0);

      const invalid = VarianceEngine.calculateVariance(50000, 0);
      expect(invalid.amount).toBe(0);
      expect(invalid.percentage).toBe(0);
    });
  });

  describe("North Star Metric & Sample Size Discipline", () => {
    it("returns 'insufficient_data' when fewer than 3 reports exist", () => {
      const reports = [
        { actualTotal: 50000, estimatedTotal: 48000 },
        { actualTotal: 30000, estimatedTotal: 29000 },
      ];

      const metric = VarianceEngine.calculateNorthStarAccuracy(reports);
      expect(metric.status).toBe("insufficient_data");
      expect(metric.accuracyPercentage).toBeNull();
      expect(metric.sampleSize).toBe(2);
    });

    it("calculates accurate percentage when >= 3 reports exist", () => {
      const reports = [
        { actualTotal: 50000, estimatedTotal: 50000 }, // 0% (within 10%)
        { actualTotal: 52000, estimatedTotal: 50000 }, // 4% (within 10%)
        { actualTotal: 47000, estimatedTotal: 50000 }, // -6% (within 10%)
        { actualTotal: 70000, estimatedTotal: 50000 }, // 40% (out of 10%)
      ];

      const metric = VarianceEngine.calculateNorthStarAccuracy(reports);
      expect(metric.sampleSize).toBe(4);
      expect(metric.status).toBe("emerging");
      expect(metric.withinTenPctCount).toBe(3);
      expect(metric.accuracyPercentage).toBe(75);
    });
  });

  describe("Freshness Evaluation & Stale Thresholds", () => {
    it("evaluates data < 30 days as fresh", () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const freshness = VarianceEngine.evaluateFreshness(tenDaysAgo);
      expect(freshness.status).toBe("fresh");
      expect(freshness.isStale).toBe(false);
      expect(freshness.daysAgo).toBe(10);
    });

    it("evaluates data between 31 and 60 days as needs_reverification", () => {
      const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
      const freshness = VarianceEngine.evaluateFreshness(fortyDaysAgo);
      expect(freshness.status).toBe("needs_reverification");
      expect(freshness.isStale).toBe(true);
    });

    it("evaluates data > 60 days as stale_deprioritize", () => {
      const seventyDaysAgo = new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString();
      const freshness = VarianceEngine.evaluateFreshness(seventyDaysAgo);
      expect(freshness.status).toBe("stale_deprioritize");
      expect(freshness.isStale).toBe(true);
    });
  });
});
