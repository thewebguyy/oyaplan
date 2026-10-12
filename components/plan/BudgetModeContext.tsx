'use client';

import React, { createContext, useContext, useState } from 'react';
import type { OutingBudgetMode } from '@/lib/planning/budgetMode';

interface BudgetModeContextValue {
  mode: OutingBudgetMode;
  setMode: (mode: OutingBudgetMode) => void;
}

const BudgetModeContext = createContext<BudgetModeContextValue | null>(null);

export function BudgetModeProvider({
  children,
  initialMode = 'street-smart',
}: {
  children: React.ReactNode;
  initialMode?: OutingBudgetMode;
}) {
  const [mode, setMode] = useState<OutingBudgetMode>(initialMode);
  return (
    <BudgetModeContext.Provider value={{ mode, setMode }}>
      {children}
    </BudgetModeContext.Provider>
  );
}

const NOOP = () => {};

/** Returns Street-Smart (read-only) when rendered outside a provider. */
export function useBudgetMode(): BudgetModeContextValue {
  return useContext(BudgetModeContext) ?? { mode: 'street-smart', setMode: NOOP };
}
