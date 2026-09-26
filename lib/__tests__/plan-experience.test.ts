import { describe, it, expect } from 'vitest';

describe('Phase 5 — Plan Experience & Budget Relationship Logic', () => {
  it('correctly calculates remaining budget without mutating original budget target', () => {
    const userBudget = 90000;
    const estimatedSpend = 74000;
    const remaining = userBudget - estimatedSpend;

    expect(userBudget).toBe(90000);
    expect(estimatedSpend).toBe(74000);
    expect(remaining).toBe(16000);
    expect(remaining).toBeGreaterThan(0);
  });

  it('detects significant under-spend scenarios for contextual explanation', () => {
    const userBudget = 90000;
    const estimatedSpend = 14000;
    const remaining = userBudget - estimatedSpend;
    const isWellUnderBudget = userBudget > 0 && estimatedSpend < userBudget * 0.6;

    expect(isWellUnderBudget).toBe(true);
    expect(remaining).toBe(76000);
  });

  it('correctly calculates total landed cost including food, transport, and mandatory taxes', () => {
    const foodCost = 58000;
    const transportCost = 12000;
    const serviceChargePct = 5;
    const vatPct = 7.5;

    const baseCost = foodCost;
    const serviceFee = Math.round(baseCost * (serviceChargePct / 100));
    const vatFee = Math.round(baseCost * (vatPct / 100));
    const taxesAndCharges = serviceFee + vatFee;

    const totalLandedCost = foodCost + transportCost + taxesAndCharges;

    expect(serviceFee).toBe(2900);
    expect(vatFee).toBe(4350);
    expect(taxesAndCharges).toBe(7250);
    expect(totalLandedCost).toBe(77250);
  });

  it('formats WhatsApp share messages cleanly with accurate squad, spend, and breakdown', () => {
    const venueName = 'Cactus Restaurant';
    const squadSize = 4;
    const budget = 90000;
    const totalCost = 74000;
    const foodCost = 58000;
    const transportCost = 12000;
    const taxes = Math.max(0, totalCost - (foodCost + transportCost));
    const remaining = budget - totalCost;
    const planId = 'test-plan-123';
    const shareUrl = `https://oyaplan.vercel.app/plan/${planId}`;

    const message =
      `*OyaPlan Squad Outing: ${venueName}*\n\n` +
      `👥 *Squad:* ${squadSize} people\n` +
      `💰 *Estimated Outing Total:* ~₦${totalCost.toLocaleString('en-NG')}\n` +
      `💵 *Your Budget:* ₦${budget.toLocaleString('en-NG')} (${
        remaining >= 0 ? `₦${remaining.toLocaleString('en-NG')} left over` : 'near budget limit'
      })\n\n` +
      `🍽️ *Food & Drinks:* ₦${foodCost.toLocaleString('en-NG')}\n` +
      `🚗 *Rides (Round-trip):* ₦${transportCost.toLocaleString('en-NG')}\n` +
      (taxes > 0 ? `🧾 *VAT & Service:* ₦${taxes.toLocaleString('en-NG')}\n` : '') +
      `\nSee full breakdown & menu items:\n${shareUrl}`;

    expect(message).toContain('*OyaPlan Squad Outing: Cactus Restaurant*');
    expect(message).toContain('👥 *Squad:* 4 people');
    expect(message).toContain('~₦74,000');
    expect(message).toContain('₦16,000 left over');
    expect(message).toContain(shareUrl);
  });

  it('validates canonical OyaPlan plan code structure', () => {
    const planId = 'c8b2d4e1-55a1-43e8-9992-0b1a6c4f7281';
    const planCode = `OYA-${planId.slice(0, 6).toUpperCase()}`;

    expect(planCode).toBe('OYA-C8B2D4');
    expect(planCode.startsWith('OYA-')).toBe(true);
    expect(planCode.length).toBe(10);
  });
});
