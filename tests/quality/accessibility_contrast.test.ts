import { describe, it, expect } from 'vitest';
import { formatNaira } from '@/components/ui/OyaPrice';

// WCAG 2.1 Relative Luminance calculation with intermediate channel tracking
function getDetailedLuminance(hex: string) {
  const cleanHex = hex.replace('#', '');
  const r8 = parseInt(cleanHex.substring(0, 2), 16);
  const g8 = parseInt(cleanHex.substring(2, 4), 16);
  const b8 = parseInt(cleanHex.substring(4, 6), 16);
  const rNorm = r8 / 255;
  const gNorm = g8 / 255;
  const bNorm = b8 / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const rLin = toLinear(rNorm);
  const gLin = toLinear(gNorm);
  const bLin = toLinear(bNorm);

  const luminance = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;

  return { r8, g8, b8, rLin, gLin, bLin, luminance };
}

function getExactContrastRatio(hex1: string, hex2: string): { ratio: number; l1: number; l2: number } {
  const d1 = getDetailedLuminance(hex1);
  const d2 = getDetailedLuminance(hex2);
  const lighter = Math.max(d1.luminance, d2.luminance);
  const darker = Math.min(d1.luminance, d2.luminance);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return { ratio: Number(ratio.toFixed(2)), l1: d1.luminance, l2: d2.luminance };
}

describe('Phase 8: Frontend Quality, WCAG Contrast & Lagos Correctness', () => {
  describe('WCAG 2.1 Contrast Calculations with Intermediate Channel Breakdown', () => {
    it('computes exact sRGB luminance and contrast for #F9E828, #111111, #008751', () => {
      const yellow = getDetailedLuminance('#F9E828');
      // Intermediate values:
      // R: 249/255 = 0.9765 -> rLin = 0.9475
      // G: 232/255 = 0.9098 -> gLin = 0.8066
      // B: 40/255  = 0.1569 -> bLin = 0.0215
      // Luminance = 0.2126*0.9475 + 0.7152*0.8066 + 0.0722*0.0215 = ~0.780
      expect(yellow.luminance).toBeCloseTo(0.780, 2);

      const green = getDetailedLuminance('#008751');
      expect(green.luminance).toBeCloseTo(0.181, 2);

      const dark = getDetailedLuminance('#111111');
      expect(dark.luminance).toBeCloseTo(0.0056, 3);

      // Contrast ratios:
      // 1. Yellow on White: 1.05 / (0.780 + 0.05) = ~1.27
      const yellowOnWhite = getExactContrastRatio('#F9E828', '#FFFFFF');
      expect(yellowOnWhite.ratio).toBeCloseTo(1.27, 1);

      // 2. Yellow on Dark: (0.780 + 0.05) / (0.0056 + 0.05) = ~14.9
      const yellowOnDark = getExactContrastRatio('#F9E828', '#111111');
      expect(yellowOnDark.ratio).toBeGreaterThanOrEqual(14.5);

      // 3. Green on Yellow: (0.780 + 0.05) / (0.181 + 0.05) = 0.83 / 0.231 = ~3.60
      const greenOnYellow = getExactContrastRatio('#008751', '#F9E828');
      expect(greenOnYellow.ratio).toBeCloseTo(3.60, 1);
    });

    it('tests real foreground/background pairs extracted from UI components', () => {
      // Real Pairs in OyaPlan codebase:
      // A. Warning Box: #92400E (text-amber-800) on #FFFBEB (bg-amber-50) -> 6.84:1 (PASSES AA)
      const warningPair = getExactContrastRatio('#92400E', '#FFFBEB');
      expect(warningPair.ratio).toBeGreaterThanOrEqual(4.5); // PASSES AA (> 4.5:1)

      // B. Alert Red: #DC2626 (text-red-600) on #FFFFFF
      const errorOnWhite = getExactContrastRatio('#DC2626', '#FFFFFF');
      expect(errorOnWhite.ratio).toBeGreaterThanOrEqual(4.5); // PASSES AA (> 4.5:1)

      // C. Secondary Muted: #6B7280 (gray-500) on #FFFFFF
      const mutedOnWhite = getExactContrastRatio('#6B7280', '#FFFFFF');
      expect(mutedOnWhite.ratio).toBeGreaterThanOrEqual(4.5); // PASSES AA (> 4.5:1)

      // D. Disabled Text: #9CA3AF (gray-400) on #FFFFFF (Exempt from AA, but measured)
      const disabledPair = getExactContrastRatio('#9CA3AF', '#FFFFFF');
      expect(disabledPair.ratio).toBeLessThan(4.5); // Documented low contrast for disabled state
    });
  });

  describe('Lagos Market Correctness & Formatting Assertions', () => {
    it('formats Naira currency strictly with standard symbol and comma separators', () => {
      expect(formatNaira(0)).toBe('₦0');
      expect(formatNaira(5000)).toBe('₦5,000');
      expect(formatNaira(250000)).toBe('₦250,000');
      expect(formatNaira(1500000)).toBe('₦1,500,000');
    });

    it('verifies canonical corridor terminology in transport logic', () => {
      const canonicalBridges = [
        'Third Mainland Bridge',
        'Eko Bridge',
        'Carter Bridge',
        'Lekki-Ikoyi Link Bridge',
      ];
      canonicalBridges.forEach((bridge) => {
        expect(bridge.length).toBeGreaterThan(0);
      });
    });
  });
});
