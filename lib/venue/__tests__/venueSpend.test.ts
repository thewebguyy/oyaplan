import { describe, it, expect } from "vitest";
import { calculateOutsideMath } from "../venueSpend";

describe("Canonical Outside Math Engine (calculateOutsideMath)", () => {
  it("calculates exact 7.5% VAT and 10% service charge for standard food spend", () => {
    const res = calculateOutsideMath({
      foodSubtotal: 20000,
      vatPct: 7.5,
      serviceChargePct: 10,
      transportCost: 4000,
      headcount: 2,
    });

    expect(res.foodSubtotal).toBe(20000);
    // VAT 7.5% of 20,000 = 1,500
    expect(res.vatAmount).toBe(1500);
    // Service charge 10% of 20,000 = 2,000
    expect(res.serviceChargeAmount).toBe(2000);
    expect(res.transportCost).toBe(4000);
    expect(res.surgeCost).toBe(0);
    // Total = 20,000 + 1,500 + 2,000 + 4,000 = 27,500
    expect(res.totalCost).toBe(27500);
  });

  it("handles surge multiplier accurately with integer kobo rounding", () => {
    const res = calculateOutsideMath({
      foodSubtotal: 10000,
      surgeMultiplier: 1.25, // Friday night 25% surge
      vatPct: 7.5,
      serviceChargePct: 10,
      transportCost: 2000,
    });

    // Base = 10,000; Surge food = 12,500
    expect(res.surgeCost).toBe(2500);
    // VAT 7.5% of 12,500 = 937.5 -> Math.round = 938
    expect(res.vatAmount).toBe(938);
    // Service charge 10% of 12,500 = 1,250
    expect(res.serviceChargeAmount).toBe(1250);
    // Total = 12,500 + 938 + 1,250 + 2,000 = 16,688
    expect(res.totalCost).toBe(16688);
  });

  it("clamps edge-case headcounts (0, negative, huge numbers)", () => {
    const resZero = calculateOutsideMath({ foodSubtotal: 15000, headcount: 0 });
    expect(resZero.headcount).toBe(1);

    const resNeg = calculateOutsideMath({ foodSubtotal: 15000, headcount: -5 });
    expect(resNeg.headcount).toBe(1);

    const resHuge = calculateOutsideMath({ foodSubtotal: 50000, headcount: 1000 });
    expect(resHuge.headcount).toBe(1000);
  });

  it("guarantees integer values without floating point precision drift", () => {
    const res = calculateOutsideMath({
      foodSubtotal: 33333.33,
      vatPct: 7.5,
      serviceChargePct: 10,
      transportCost: 1555.55,
      headcount: 3,
    });

    expect(Number.isInteger(res.foodSubtotal)).toBe(true);
    expect(Number.isInteger(res.vatAmount)).toBe(true);
    expect(Number.isInteger(res.serviceChargeAmount)).toBe(true);
    expect(Number.isInteger(res.transportCost)).toBe(true);
    expect(Number.isInteger(res.totalCost)).toBe(true);
  });
});
