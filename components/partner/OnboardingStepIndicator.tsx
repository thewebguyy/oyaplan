'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  shortTitle: string;
}

const STEPS: Step[] = [
  { number: 1, title: 'Business Info', shortTitle: 'Business' },
  { number: 2, title: 'Pricing & Fees', shortTitle: 'Pricing' },
  { number: 3, title: 'Experience Fit', shortTitle: 'Experience' },
  { number: 4, title: 'Photos', shortTitle: 'Photos' },
  { number: 5, title: 'Review & Submit', shortTitle: 'Review' },
];

interface OnboardingStepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  maxAccessibleStep?: number;
}

export function OnboardingStepIndicator({
  currentStep,
  onStepClick,
  maxAccessibleStep = 5,
}: OnboardingStepIndicatorProps) {
  return (
    <div className="w-full bg-[#FAFAF8] border-b border-stone-200 py-3 px-4 sticky top-0 z-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isClickable = step.number <= maxAccessibleStep;

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={`flex items-center gap-1.5 focus:outline-none transition-colors ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCompleted
                      ? 'bg-[#008751] text-white shadow-sm'
                      : isCurrent
                      ? 'bg-[#010528] text-white ring-2 ring-[#008751] ring-offset-2'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                </div>
                <span
                  className={`hidden sm:inline text-xs font-medium ${
                    isCurrent
                      ? 'text-[#010528] font-bold'
                      : isCompleted
                      ? 'text-stone-700'
                      : 'text-stone-500'
                  }`}
                >
                  {step.title}
                </span>
                <span
                  className={`sm:hidden text-[11px] font-medium ${
                    isCurrent
                      ? 'text-[#010528] font-bold'
                      : isCompleted
                      ? 'text-stone-700'
                      : 'text-stone-500'
                  }`}
                >
                  {step.shortTitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-stone-200 h-1 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-[#008751] h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
