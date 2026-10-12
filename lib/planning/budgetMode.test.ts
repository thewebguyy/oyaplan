import { describe, it, expect } from 'vitest';
import {
  applyBudgetMode,
  getReceiptOutcome,
  EXACT_FIT_TOLERANCE,
  SOFT_LIFE_PER_HEAD_CUSHION,
} from './budgetMode';

const base = { foodCost: 30000, transportCost: 10000, totalCost: 43000, squadSize: 4 };

describe('applyBudgetMode', () => {
  it('Street-Smart leaves the audited total untouched', () => {
    const r = applyBudgetMode(base, 'street-smart');
    expect(r.cushionTotal).toBe(0);
    expect(r.effectiveTotal).toBe(43000);
    expect(r.baseTotal).toBe(43000);
    expect(r.effectivePerHead).toBe(10750);
  });

  it('Soft Life adds a separate cushion: +15% ride (rounded up to ₦500) and ₦2k per head', () => {
    const r = applyBudgetMode(base, 'soft-life');
    expect(r.transportCushion).toBe(1500); // 10,000 * 1.15 = 11,500
    expect(r.perHeadCushion).toBe(4 * SOFT_LIFE_PER_HEAD_CUSHION);
    expect(r.cushionTotal).toBe(9500);
    expect(r.baseTotal).toBe(43000); // base never mutated
    expect(r.effectiveTotal).toBe(52500);
    expect(r.effectivePerHead).toBe(13125);
  });

  it('rounds the ride surge up so the cushion is never under-padded', () => {
    const r = applyBudgetMode({ ...base, transportCost: 7300 }, 'soft-life');
    // 7,300 * 1.15 = 8,395 -> 8,500 -> cushion 1,200
    expect(r.transportCushion).toBe(1200);
  });

  it('Soft Life skips ride padding when the squad drives or has no transport cost', () => {
    expect(applyBudgetMode({ ...base, hasCar: true }, 'soft-life').transportCushion).toBe(0);
    expect(applyBudgetMode({ ...base, transportCost: 0 }, 'soft-life').transportCushion).toBe(0);
  });

  it('guards against zero/negative squad sizes and negative totals', () => {
    const r = applyBudgetMode({ foodCost: 0, transportCost: -5, totalCost: -100, squadSize: 0 }, 'soft-life');
    expect(r.baseTotal).toBe(0);
    expect(r.transportCushion).toBe(0);
    expect(r.perHeadCushion).toBe(SOFT_LIFE_PER_HEAD_CUSHION);
    expect(Number.isFinite(r.effectivePerHead)).toBe(true);
  });

  it('per-head is ceiling so the squad never collects short', () => {
    const r = applyBudgetMode({ foodCost: 0, transportCost: 0, totalCost: 10001, squadSize: 3 }, 'street-smart');
    expect(r.effectivePerHead).toBe(3334);
    expect(r.effectivePerHead * 3).toBeGreaterThanOrEqual(10001);
  });
});

describe('getReceiptOutcome', () => {
  it('under budget -> BILLING ESCAPED with honest headroom (not "saved")', () => {
    const o = getReceiptOutcome(50000, 42000);
    expect(o.kind).toBe('under');
    expect(o.title).toBe('BILLING ESCAPED');
    expect(o.subtitle).toBe('₦8,000 HEADROOM UNDER BUDGET');
    expect(o.subtitle).not.toMatch(/SAVED/);
    expect(o.delta).toBe(8000);
  });

  it('within tolerance -> CLEAN MATH', () => {
    expect(getReceiptOutcome(50000, 50000).kind).toBe('exact');
    expect(getReceiptOutcome(50000, 50000 - EXACT_FIT_TOLERANCE).kind).toBe('exact');
    expect(getReceiptOutcome(50000, 50000 + EXACT_FIT_TOLERANCE).kind).toBe('exact');
    expect(getReceiptOutcome(50000, 50000).title).toBe('CLEAN MATH');
  });

  it('over budget -> states the overage, never claims hidden buffers', () => {
    const o = getReceiptOutcome(40000, 46500);
    expect(o.kind).toBe('over');
    expect(o.title).toBe('OVER BUDGET');
    expect(o.subtitle).toBe('₦6,500 ABOVE YOUR TARGET');
    expect(o.subtitle).not.toMatch(/DOWNPOUR|BUFFER/);
  });

  it('missing or zero budget falls back to exact fit instead of fabricating headroom', () => {
    expect(getReceiptOutcome(undefined, 30000).kind).toBe('exact');
    expect(getReceiptOutcome(null, 30000).kind).toBe('exact');
    expect(getReceiptOutcome(0, 30000).kind).toBe('exact');
  });

  it('Soft Life cushion can flip a plan from under to over budget', () => {
    const softTotal = applyBudgetMode(base, 'soft-life').effectiveTotal; // 52,500
    expect(getReceiptOutcome(50000, base.totalCost).kind).toBe('under');
    expect(getReceiptOutcome(50000, softTotal).kind).toBe('over');
  });
});
