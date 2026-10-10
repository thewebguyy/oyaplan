'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Sparkles, MessageSquare, X, RotateCw, Trophy } from 'lucide-react';
import { triggerHaptic } from '@/lib/ui/haptics';

export interface RouletteOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  textColor: string;
  message: string;
}

export const ROULETTE_OPTIONS: RouletteOption[] = [
  {
    id: '50-50',
    label: '50 / 50 Even Split',
    emoji: '⚖️',
    color: '#111111',
    textColor: '#FFFFFF',
    message: 'Equal damage! Everyone pays their fair share.',
  },
  {
    id: 'odogwu-pays',
    label: 'Odogwu Pays It All',
    emoji: '👑',
    color: '#F9E828',
    textColor: '#111111',
    message: 'The Odogwu in the group covers the entire bill tonight!',
  },
  {
    id: 'next-time',
    label: 'Next Time Is On You',
    emoji: '🤝',
    color: '#008751',
    textColor: '#FFFFFF',
    message: 'I cover tonight, but you step up on the next linkup!',
  },
  {
    id: 'accountant-pays',
    label: 'Accountant Pays Uber',
    emoji: '💸',
    color: '#FFFEE5',
    textColor: '#111111',
    message: 'The Accountant-General handles transport, food is split!',
  },
  {
    id: 'rock-paper',
    label: 'Rock Paper Scissors',
    emoji: '✌️',
    color: '#E54D2E',
    textColor: '#FFFFFF',
    message: 'Best 2 out of 3 in Rock-Paper-Scissors decides the payer!',
  },
  {
    id: 'free-ride',
    label: 'Dining Free, Uber Split',
    emoji: '🚗',
    color: '#1A1A1A',
    textColor: '#F9E828',
    message: 'Food & drinks covered, squad splits the ride back home.',
  },
];

interface BillSplitRouletteProps {
  isOpen?: boolean;
  onClose?: () => void;
  venueName?: string;
  totalCost?: number;
}

export function BillSplitRoulette({
  isOpen = true,
  onClose,
  venueName = 'Selected Spot',
  totalCost = 45000,
}: BillSplitRouletteProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [selectedResult, setSelectedResult] = useState<RouletteOption | null>(null);

  const numSlices = ROULETTE_OPTIONS.length;
  const sliceAngle = 360 / numSlices;

  const handleSpin = () => {
    if (isSpinning) return;
    triggerHaptic('heavy');
    setIsSpinning(true);
    setSelectedResult(null);

    // Random turns between 5 and 9 full spins plus random slice
    const randomSlice = Math.floor(Math.random() * numSlices);
    const extraSpins = (5 + Math.floor(Math.random() * 5)) * 360;
    const targetDegree = rotationDegree + extraSpins + (360 - randomSlice * sliceAngle - sliceAngle / 2);

    setRotationDegree(targetDegree);

    // Simulate tick sounds / vibration during spin
    const interval = setInterval(() => {
      triggerHaptic('selection');
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setIsSpinning(false);
      const winningOption = ROULETTE_OPTIONS[randomSlice];
      setSelectedResult(winningOption);
      triggerHaptic('success');
    }, 3500);
  };

  const handleShareResult = () => {
    if (!selectedResult) return;
    triggerHaptic('success');
    const msg = encodeURIComponent(
      `🎲 *OYAPLAN BILL SPLIT ROULETTE RESULT*\n\n` +
      `Outing Spot: *${venueName}*\n` +
      `Damage: *₦${totalCost.toLocaleString('en-NG')}*\n\n` +
      `Roulette Verdict: *${selectedResult.emoji} ${selectedResult.label.toUpperCase()}*\n` +
      `"${selectedResult.message}"\n\n` +
      `No argument in group chat! Result is locked! 🤝`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-white border-3 border-[#111111] rounded-3xl p-5 sm:p-6 shadow-[8px_8px_0px_0px_#111111] space-y-4 font-sans relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-[#111111]" />
          <h3 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-[#111111]">
            Bill Split Roulette 🎰
          </h3>
        </div>
        <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#F9E828] text-[#111111] border border-[#111111] px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_0px_#111111]">
          No Debate
        </span>
      </div>

      <p className="text-xs text-[#555555] font-medium">
        Can&apos;t agree on who pays the Uber or dessert? Spin the Lagos Roulette to settle it fair and square!
      </p>

      {/* Wheel Visual Container */}
      <div className="flex flex-col items-center justify-center py-4 relative">
        {/* Pointer Triangle Arrow */}
        <div className="absolute top-2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-600 drop-shadow-md" />

        {/* The Wheel */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-[#111111] shadow-[6px_6px_0px_0px_#111111] overflow-hidden bg-[#111111]">
          <motion.div
            className="w-full h-full relative"
            animate={{ rotate: rotationDegree }}
            transition={{
              duration: 3.5,
              ease: [0.15, 0.9, 0.2, 1], // Realistic deceleration easing
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {ROULETTE_OPTIONS.map((opt, i) => {
                const startAngle = i * sliceAngle;
                const endAngle = (i + 1) * sliceAngle;
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                const midAngle = startAngle + sliceAngle / 2;
                const textX = 50 + 32 * Math.cos((Math.PI * midAngle) / 180);
                const textY = 50 + 32 * Math.sin((Math.PI * midAngle) / 180);

                return (
                  <g key={opt.id}>
                    <path d={pathData} fill={opt.color} stroke="#111111" strokeWidth="0.8" />
                    <text
                      x={textX}
                      y={textY}
                      fill={opt.textColor}
                      fontSize="4.5"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    >
                      {opt.emoji}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>

          {/* Center Hub Button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-14 h-14 rounded-full bg-[#111111] border-2 border-white text-[#F9E828] flex items-center justify-center font-black text-xs shadow-lg uppercase">
              OYA!
            </div>
          </div>
        </div>

        {/* Spin CTA Button */}
        <button
          type="button"
          onClick={handleSpin}
          disabled={isSpinning}
          className="mt-6 h-12 px-8 bg-[#F9E828] hover:bg-[#ffe710] text-[#111111] font-display font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer tap-feedback"
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Spinning the Wheel...' : 'Spin Bill Roulette →'}</span>
        </button>
      </div>

      {/* Winning Result Modal / Callout */}
      <AnimatePresence>
        {selectedResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-[#008751] text-white border-2 border-[#111111] rounded-2xl p-4 space-y-3 shadow-[4px_4px_0px_0px_#111111]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white text-[#008751] px-2.5 py-0.5 rounded-full">
                ROULETTE VERDICT
              </span>
              <Trophy className="w-5 h-5 text-[#F9E828]" />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedResult.emoji}</span>
              <div>
                <h4 className="text-base font-black font-display uppercase tracking-tight text-white">
                  {selectedResult.label}
                </h4>
                <p className="text-xs text-white/90 font-medium">
                  {selectedResult.message}
                </p>
              </div>
            </div>

            <button
              onClick={handleShareResult}
              className="w-full h-10 bg-[#111111] hover:bg-black text-[#F9E828] font-display font-black text-xs uppercase tracking-wider rounded-xl border border-white/20 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer tap-feedback"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Result to Group Chat →</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
