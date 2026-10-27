import { describe, it, expect } from "vitest";
import { calculateOutsideMath } from "@/lib/venue/venueSpend";
import { calculateZoneFare } from "@/lib/planning/transport";

describe("Landed-Cost Composition & Reconciled Outside Math", () => {
  it("reconciles exact total with no additional mandatory fees", () => {
    const foodSubtotal = 40000;
    const transport = 5000;
    const math = calculateOutsideMath({
      foodSubtotal,
      transportCost: transport,
      vatPct: 7.5,
      serviceChargePct: 10,
      headcount: 2,
    });

    expect(math.vatAmount).toBe(3000); // 7.5% of 40,000
    expect(math.serviceChargeAmount).toBe(4000); // 10% of 40,000
    expect(math.transportCost).toBe(5000);
    expect(math.mandatoryFees).toBe(0);

    const reconciledSum =
      math.foodSubtotal +
      math.surgeCost +
      math.vatAmount +
      math.serviceChargeAmount +
      math.transportCost +
      math.mandatoryFees;

    expect(math.totalCost).toBe(52000);
    expect(math.totalCost).toBe(reconciledSum);
  });

  it("includes explicitly supported mandatory fee exactly once without double counting", () => {
    const foodSubtotal = 60000;
    const transport = 10000;
    const mandatoryEntrance = 8000; // e.g. ₦2,000 x 4 headcount
    const math = calculateOutsideMath({
      foodSubtotal,
      transportCost: transport,
      mandatoryFees: mandatoryEntrance,
      vatPct: 7.5,
      serviceChargePct: 10,
      headcount: 4,
    });

    expect(math.mandatoryFees).toBe(8000);
    // VAT and service charge apply only to the food/dining subtotal, not double-applied to mandatory entrance fees
    expect(math.vatAmount).toBe(4500); // 7.5% of 60,000
    expect(math.serviceChargeAmount).toBe(6000); // 10% of 60,000
    expect(math.transportCost).toBe(10000);

    const expectedTotal = 60000 + 4500 + 6000 + 10000 + 8000;
    expect(math.totalCost).toBe(expectedTotal);
    expect(math.totalCost).toBe(88500);
  });

  it("handles tax-inclusive and zero-fee venues honestly without inventing fees", () => {
    const foodSubtotal = 50000;
    const transport = 5000;
    const math = calculateOutsideMath({
      foodSubtotal,
      transportCost: transport,
      vatPct: 0,
      serviceChargePct: 0,
      headcount: 2,
    });

    expect(math.vatAmount).toBe(0);
    expect(math.serviceChargeAmount).toBe(0);
    expect(math.mandatoryFees).toBe(0);
    expect(math.totalCost).toBe(55000); // Exactly food + transport
  });

  it("retains exact component reconciliation across party sizes 1 to 10", () => {
    const partySizes = [1, 2, 3, 4, 5, 6, 8, 10];
    for (const squad of partySizes) {
      const foodPerHead = 12500;
      const foodSubtotal = foodPerHead * squad;
      const transport = calculateZoneFare("yaba", "vi", squad);

      const math = calculateOutsideMath({
        foodSubtotal,
        transportCost: transport,
        headcount: squad,
        mandatoryFees: 5000,
      });

      const componentSum =
        math.foodSubtotal +
        math.surgeCost +
        math.vatAmount +
        math.serviceChargeAmount +
        math.transportCost +
        math.mandatoryFees;

      expect(math.totalCost).toBe(componentSum);
      expect(math.transportCost).toBe(10000); // Island zone transport included exactly once

      const perPersonTotal = Math.ceil(math.totalCost / squad);
      expect(perPersonTotal * squad).toBeGreaterThanOrEqual(math.totalCost);
    }
  });
});
