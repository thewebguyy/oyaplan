'use client';

import React from 'react';
import { CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

interface PosTerminalBadgeProps {
  status: 'verified' | 'pending' | 'updated';
  label?: string;
}

export function PosTerminalBadge({ status, label }: PosTerminalBadgeProps) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#EAFDF3] text-[#008751] border border-[#A3F3C6] shadow-2xs">
        <ShieldCheck className="w-3.5 h-3.5 text-[#008751]" />
        <span>{label || '● VERIFIED PRESENCE'}</span>
      </span>
    );
  }

  if (status === 'updated') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#111111] text-[#F6C642] border border-[#F6C642]/40 animate-in fade-in zoom-in-95">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#F6C642]" />
        <span>{label || 'UPDATE COMMITTED'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FAF7F2] text-[#7A3E1D] border border-[#EAE4DC]">
      <Clock className="w-3.5 h-3.5 text-[#7A3E1D]" />
      <span>{label || '● VERIFICATION PENDING'}</span>
    </span>
  );
}
