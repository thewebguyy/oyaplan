import { describe, it, expect } from "vitest";
import { formatNaira } from "./currency";

describe("Canonical Naira Formatting (formatNaira)", () => {
  describe("Standard and typical monetary values", () => {
    it("formats zero correctly", () => {
      expect(formatNaira(0)).toBe("₦0");
    });

    it("formats typical Naira amounts without redundant decimals", () => {
      expect(formatNaira(5000)).toBe("₦5,000");
      expect(formatNaira(28000)).toBe("₦28,000");
      expect(formatNaira(150000)).toBe("₦150,000");
    });

    it("formats large amounts with standard thousands separators", () => {
      expect(formatNaira(1500000)).toBe("₦1,500,000");
      expect(formatNaira(25000000)).toBe("₦25,000,000");
    });
  });

  describe("Negative amounts", () => {
    it("formats negative amounts placing the minus sign before the currency symbol", () => {
      expect(formatNaira(-5000)).toBe("-₦5,000");
      expect(formatNaira(-28500)).toBe("-₦28,500");
      expect(formatNaira(-5000, true)).toBe("-₦5k");
    });
  });

  describe("Decimal handling", () => {
    it("omits decimals for whole integers by default", () => {
      expect(formatNaira(10000)).toBe("₦10,000");
    });

    it("preserves valid fractional kobo amounts when present", () => {
      expect(formatNaira(10000.5)).toBe("₦10,000.50");
      expect(formatNaira(10000.75)).toBe("₦10,000.75");
    });

    it("includes decimals when showDecimals is explicitly requested", () => {
      expect(formatNaira(10000, { showDecimals: true })).toBe("₦10,000.00");
      expect(formatNaira(10000.5, { showDecimals: true })).toBe("₦10,000.50");
    });
  });

  describe("Compact notation", () => {
    it("formats thousands with 'k' when compact is enabled", () => {
      expect(formatNaira(35000, true)).toBe("₦35k");
      expect(formatNaira(35500, { compact: true })).toBe("₦35.5k");
    });

    it("formats millions with 'M' when compact is enabled", () => {
      expect(formatNaira(1000000, true)).toBe("₦1M");
      expect(formatNaira(1500000, { compact: true })).toBe("₦1.5M");
    });

    it("does not abbreviate amounts below 1,000 even in compact mode", () => {
      expect(formatNaira(500, true)).toBe("₦500");
      expect(formatNaira(0, true)).toBe("₦0");
    });
  });

  describe("Safety against non-finite and invalid inputs", () => {
    it("does not silently turn NaN into plausible ₦0", () => {
      expect(formatNaira(NaN)).toBe("—");
    });

    it("returns safe fallback for Infinity and -Infinity", () => {
      expect(formatNaira(Infinity)).toBe("—");
      expect(formatNaira(-Infinity)).toBe("—");
    });

    it("returns safe fallback for null and undefined", () => {
      expect(formatNaira(null)).toBe("—");
      expect(formatNaira(undefined)).toBe("—");
    });

    it("distinguishes genuine numeric zero from undefined and null", () => {
      expect(formatNaira(0)).toBe("₦0");
      expect(formatNaira(0, true)).toBe("₦0");
      expect(formatNaira(undefined)).toBe("—");
      expect(formatNaira(null)).toBe("—");
    });

    it("respects custom fallback when provided", () => {
      expect(formatNaira(NaN, { fallback: "N/A" })).toBe("N/A");
      expect(formatNaira(Infinity, { fallback: "Unpriced" })).toBe("Unpriced");
    });
  });

  describe("Shareable plan text consistency", () => {
    it("renders cleanly inside generated WhatsApp-ready copy", () => {
      const planTotal = 49650;
      const perHead = 24825;
      const text = `Estimated Total: ${formatNaira(planTotal)} (~${formatNaira(perHead)} each)`;
      expect(text).toBe("Estimated Total: ₦49,650 (~₦24,825 each)");
    });
  });
});
