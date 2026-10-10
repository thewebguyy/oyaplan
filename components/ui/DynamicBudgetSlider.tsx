'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/ui/haptics';
import { Sparkles, Wallet } from 'lucide-react';

interface DynamicBudgetSliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function getBudgetLabel(budget: number): {
  label: string;
  emoji: string;
  badgeBg: string;
  textColor: string;
} {
  if (budget <= 15000) {
    return {
      label: 'Strictly vibes & water 💧 (Sapa friendly)',
      emoji: '💧',
      badgeBg: 'bg-gray-100',
      textColor: 'text-gray-900',
    };
  } else if (budget <= 35000) {
    return {
      label: 'Soft enjoyment & Suya 🍢 (Standard linkup)',
      emoji: '🍢',
      badgeBg: 'bg-[#FFFEE5]',
      textColor: 'text-[#111111]',
    };
  } else if (budget <= 70000) {
    return {
      label: 'Full Lagos flexing 🍹 (Cocktails & main course)',
      emoji: '🍹',
      badgeBg: 'bg-[#F9E828]',
      textColor: 'text-[#111111]',
    };
  } else if (budget <= 120000) {
    return {
      label: 'Minister of Enjoyment level 👑 (VIP vibes)',
      emoji: '👑',
      badgeBg: 'bg-[#008751]',
      textColor: 'text-white',
    };
  } else {
    return {
      label: 'Odogwu status: We are balling today! 🍾',
      emoji: '🍾',
      badgeBg: 'bg-[#111111]',
      textColor: 'text-[#F9E828]',
    };
  }
}

export function DynamicBudgetSlider({
  value,
  onChange,
  min = 10000,
  max = 150000,
  step = 5000,
  className = '',
}: DynamicBudgetSliderProps) {
  const meta = getBudgetLabel(value);
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    // Haptic feedback on boundary changes
    if (Math.abs(val - value) >= 15000) {
      triggerHaptic('medium');
    } else {
      triggerHaptic('selection');
    }
    onChange(val);
  };

  const formattedValue = value.toLocaleString('en-NG');

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      {/* Top Label & Amount Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#111111]" />
          <span className="text-xs font-black uppercase text-[#111111] tracking-tight">
            Target Budget per Head
          </span>
        </div>
        <span className="text-sm font-black font-mono text-[#111111] bg-white border border-[#111111] px-3 py-1 rounded-xl shadow-[2px_2px_0px_0px_#111111]">
          ₦{formattedValue}
        </span>
      </div>

      {/* Dynamic Contextual Lagos Label Badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={meta.label}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          className={`p-2.5 rounded-2xl border-2 border-[#111111] text-xs font-mono font-bold flex items-center gap-2 shadow-[3px_3px_0px_0px_#111111] ${meta.badgeBg} ${meta.textColor}`}
        >
          <span className="text-base">{meta.emoji}</span>
          <span className="truncate">{meta.label}</span>
        </motion.div>
      </AnimatePresence>

      {/* Range Slider Control */}
      <div className="relative pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-3 bg-gray-200 border-2 border-[#111111] rounded-lg appearance-none cursor-pointer accent-[#111111] focus:outline-none"
          style={{
            background: `linear-gradient(to right, #111111 0%, #111111 ${pct}%, #E5E5DE ${pct}%, #E5E5DE 100%)`,
          }}
        />

        {/* Min / Max Labels */}
        <div className="flex justify-between text-[10px] font-mono font-bold text-[#666666] pt-1">
          <span>₦{min.toLocaleString('en-NG')} (Sapa)</span>
          <span>₦{max.toLocaleString('en-NG')} (Balling)</span>
        </div>
      </div>
    </div>
  );
}
