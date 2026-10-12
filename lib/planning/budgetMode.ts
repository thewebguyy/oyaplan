/**
 * Budget mode + receipt outcome logic.
 *
 * Trust rules:
 * - The Soft Life cushion is user-side padding. It is NEVER merged into the
 *   audited food/drinks line; it is surfaced as its own labelled line.
 * - Outcome stamps describe the plan honestly relative to the user's budget.
 *   They are pre-outing estimates, not claims about actual spend.
 */

export type OutingBudgetMode = 'street-smart' | 'soft-life';

/** Soft Life: ride padding for traffic/surge, rounded up to the nearest ₦500. */
export const SOFT_LIFE_TRANSPORT_MULTIPLIER = 1.15;
/** Soft Life: per-person padding for an extra drink / water / tip. */
export const SOFT_LIFE_PER_HEAD_CUSHION = 2000;

export interface BudgetModeInput {
  foodCost: number;
  transportCost: number;
  totalCost: number;
  squadSize: number;
  hasCar?: boolean;
}

export interface BudgetModeResult {
  mode: OutingBudgetMode;
  /** Audited/estimated venue + ride + charges, unchanged by mode. */
  baseTotal: number;
  transportCushion: number;
  perHeadCushion: number;
  /** transportCushion + perHeadCushion */
  cushionTotal: number;
  effectiveTotal: number;
  effectivePerHead: number;
}

const roundUpTo500 = (n: number) => Math.ceil(n / 500) * 500;

export function applyBudgetMode(
  input: BudgetModeInput,
  mode: OutingBudgetMode
): BudgetModeResult {
  const squad = Math.max(1, Math.floor(input.squadSize || 1));
  const baseTotal = Math.max(0, input.totalCost || 0);
  const transport = Math.max(0, input.transportCost || 0);

  let transportCushion = 0;
  let perHeadCushion = 0;

  if (mode === 'soft-life') {
    if (!input.hasCar && transport > 0) {
      transportCushion = Math.max(
        0,
        roundUpTo500(transport * SOFT_LIFE_TRANSPORT_MULTIPLIER) - transport
      );
    }
    perHeadCushion = squad * SOFT_LIFE_PER_HEAD_CUSHION;
  }

  const cushionTotal = transportCushion + perHeadCushion;
  const effectiveTotal = baseTotal + cushionTotal;

  return {
    mode,
    baseTotal,
    transportCushion,
    perHeadCushion,
    cushionTotal,
    effectiveTotal,
    effectivePerHead: Math.ceil(effectiveTotal / squad),
  };
}

export type ReceiptOutcomeKind = 'under' | 'exact' | 'over';

export interface ReceiptOutcome {
  kind: ReceiptOutcomeKind;
  /** budget - total (positive = headroom) */
  delta: number;
  title: string;
  subtitle: string;
  stroke: string;
  fill: string;
}

/** Totals within ₦500 of the budget count as an exact fit. */
export const EXACT_FIT_TOLERANCE = 500;

export function getReceiptOutcome(
  budget: number | undefined | null,
  total: number
): ReceiptOutcome {
  const safeTotal = Math.max(0, total || 0);
  const safeBudget = budget && budget > 0 ? budget : safeTotal;
  const delta = safeBudget - safeTotal;
  const fmt = (n: number) => Math.abs(Math.round(n)).toLocaleString('en-NG');

  if (Math.abs(delta) <= EXACT_FIT_TOLERANCE) {
    return {
      kind: 'exact',
      delta,
      title: 'CLEAN MATH',
      subtitle: 'ZERO SPILL • RIGHT ON BUDGET',
      stroke: '#111111',
      fill: '#FFFEE5',
    };
  }

  if (delta > 0) {
    return {
      kind: 'under',
      delta,
      title: 'BILLING ESCAPED',
      subtitle: `₦${fmt(delta)} HEADROOM UNDER BUDGET`,
      stroke: '#008751',
      fill: '#E6F4EA',
    };
  }

  return {
    kind: 'over',
    delta,
    title: 'OVER BUDGET',
    subtitle: `₦${fmt(delta)} ABOVE YOUR TARGET`,
    stroke: '#D92D20',
    fill: '#FEE4E2',
  };
}
