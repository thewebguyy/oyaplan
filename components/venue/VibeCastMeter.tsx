'use client';

import React, { useState } from 'react';
import { Flame, ShieldCheck, Info } from 'lucide-react';
import { triggerHaptic } from '@/lib/ui/haptics';

export type CastLevel = 'chill' | 'bustling' | 'cast';

interface VibeCastMeterProps {
  castLevel?: CastLevel;
  castScore?: number; // 0 - 100
  crowdNote?: string;
  className?: string;
  showTooltip?: boolean;
}

export function VibeCastMeter({
  castLevel = 'chill',
  castScore = 20,
  crowdNote,
  className = '',
  showTooltip = false,
}: VibeCastMeterProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const getMeterConfig = (level: CastLevel) => {
    switch (level) {
      case 'cast':
        return {
          label: 'E Don Cast! 🔴',
          subLabel: 'Too crowded / mainstream',
          color: 'bg-red-500',
          textColor: 'text-red-700',
          borderColor: 'border-red-600',
          bgBadge: 'bg-red-50 text-red-700',
          tip: 'This spot is currently trending heavily. Expect 35-45 min table wait times during peak hours.',
          pct: Math.max(75, castScore),
        };
      case 'bustling':
        return {
          label: 'Bustling & Lit 🟡',
          subLabel: 'Great energy, fills after 8 PM',
          color: 'bg-amber-400',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-500',
          bgBadge: 'bg-amber-50 text-amber-800',
          tip: 'Lively crowd with strong atmosphere. Arrive slightly early to secure prime seating.',
          pct: Math.min(74, Math.max(40, castScore)),
        };
      case 'chill':
      default:
        return {
          label: 'Chill / Hidden Gem 🟢',
          subLabel: 'Soft vibes, fast service',
          color: 'bg-[#008751]',
          textColor: 'text-[#008751]',
          borderColor: 'border-[#008751]',
          bgBadge: 'bg-[#008751]/10 text-[#008751]',
          tip: 'Low noise, intimate seating, and fast menu preparation. Ideal for date night or deep gist.',
          pct: Math.min(39, Math.max(10, castScore)),
        };
    }
  };

  const config = getMeterConfig(castLevel);
  const noteText = crowdNote || config.subLabel;

  return (
    <div className={`relative flex flex-col gap-1.5 font-sans ${className}`}>
      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-[#111111]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555]">
            Vibe &amp; Cast Meter
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setTooltipOpen(!tooltipOpen);
          }}
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border border-[#111111] flex items-center gap-1 cursor-pointer tap-feedback ${config.bgBadge}`}
        >
          <span>{config.label}</span>
          <Info className="w-3 h-3 ml-0.5 opacity-70" />
        </button>
      </div>

      {/* Segmented Meter Bar */}
      <div className="w-full h-2.5 bg-gray-100 border border-[#111111] rounded-full overflow-hidden flex p-0.5 gap-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${config.color}`}
          style={{ width: `${config.pct}%` }}
        />
      </div>

      {/* Subtext */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#666666]">
        <span>{noteText}</span>
        <span className="font-bold text-[#111111]">{config.pct}% Crowd Density</span>
      </div>

      {/* Expandable Explanation Tooltip */}
      {(tooltipOpen || showTooltip) && (
        <div className="mt-1 p-2.5 rounded-xl bg-[#FFFEE5] border border-[#111111] text-[11px] font-mono text-[#111111] leading-relaxed shadow-xs flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-[#008751] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block uppercase">{config.label}</span>
            <span>{config.tip}</span>
          </div>
        </div>
      )}
    </div>
  );
}
