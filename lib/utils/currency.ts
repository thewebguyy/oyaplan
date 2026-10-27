/**
 * Canonical Nigerian Naira Currency Formatter for OyaPlan
 *
 * Requirements:
 * - Format Nigerian Naira using locale-safe en-NG convention with symbol ₦.
 * - Avoid unnecessary decimal places for whole-naira amounts (e.g., ₦15,000).
 * - Preserve valid decimal amounts if explicitly requested or if fractional kobo is present.
 * - Handle NaN, Infinity, -Infinity, null, and undefined safely:
 *   NEVER silently convert invalid financial values into plausible-looking ₦0 prices.
 * - Handle negative amounts properly (-₦5,000 / -₦5k).
 * - Support compact formatting (₦35k, ₦1.2M) without symbol breakage.
 */

export interface FormatNairaOptions {
  /** If true, format large amounts compactly (e.g., ₦35k, ₦1.5M) */
  compact?: boolean;
  /** Whether to show decimal places (.00) for whole numbers. If false (default), decimals only display when fractional. */
  showDecimals?: boolean;
  /** Fallback string returned when the value is non-finite (NaN, Infinity, -Infinity, null, undefined). Defaults to "—". */
  fallback?: string;
}

/**
 * Formats a monetary amount into canonical Nigerian Naira representation.
 *
 * @param amount - The numeric Naira amount to format.
 * @param optionsOrCompact - Configuration options object or boolean compact flag.
 * @returns Formatted Naira string (e.g., "₦15,000", "-₦5,000", "₦35k", or "—" for invalid values).
 */
export function formatNaira(
  amount: number | null | undefined,
  optionsOrCompact?: boolean | FormatNairaOptions
): string {
  const options: FormatNairaOptions =
    typeof optionsOrCompact === "boolean"
      ? { compact: optionsOrCompact }
      : optionsOrCompact || {};

  const fallback = options.fallback ?? "—";

  if (amount === null || amount === undefined || !Number.isFinite(amount)) {
    return fallback;
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Compact mode for large amounts (e.g. ₦35k, ₦1.5M)
  if (options.compact && absAmount >= 1000) {
    let compactStr: string;
    if (absAmount >= 1_000_000) {
      const inM = absAmount / 1_000_000;
      compactStr = inM % 1 === 0 ? `${inM}M` : `${Number(inM.toFixed(1))}M`;
    } else {
      const inK = absAmount / 1000;
      compactStr = inK % 1 === 0 ? `${inK}k` : `${Number(inK.toFixed(1))}k`;
    }
    return `${isNegative ? "-" : ""}₦${compactStr}`;
  }

  // Fractional kobo check
  const hasFractions = absAmount % 1 !== 0;
  const minimumFractionDigits = options.showDecimals ? 2 : (hasFractions ? 2 : 0);
  const maximumFractionDigits = options.showDecimals || hasFractions ? 2 : 0;

  const numberPart = absAmount.toLocaleString("en-NG", {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return `${isNegative ? "-" : ""}₦${numberPart}`;
}
