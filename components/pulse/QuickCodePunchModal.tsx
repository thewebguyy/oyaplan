'use client';

import React, { useState } from 'react';
import { ShieldCheck, Check, X, Delete, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '@/lib/ui/haptics';
import { PulseSquadItem } from '@/lib/queries/pulse';
import { decideSquadAction } from '@/lib/actions/pulseActions';

interface QuickCodePunchModalProps {
  venueId: string;
  venueName: string;
  isOpen: boolean;
  onClose: () => void;
  squads: PulseSquadItem[];
  onSquadVerified?: (planCode: string) => void;
}

export function QuickCodePunchModal({
  venueId,
  venueName,
  isOpen,
  onClose,
  squads,
  onSquadVerified,
}: QuickCodePunchModalProps) {
  const [codeBuffer, setCodeBuffer] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'success' | 'not_found' | 'error';
    squad?: PulseSquadItem;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleKeyPress = (char: string) => {
    if (codeBuffer.length >= 8) return;
    triggerHaptic('selection');
    setCodeBuffer((prev) => (prev + char).toUpperCase());
    setVerificationResult(null);
  };

  const handleBackspace = () => {
    triggerHaptic('selection');
    setCodeBuffer((prev) => prev.slice(0, -1));
    setVerificationResult(null);
  };

  const handleClear = () => {
    triggerHaptic('warning');
    setCodeBuffer('');
    setVerificationResult(null);
  };

  const handleVerify = async () => {
    if (!codeBuffer.trim()) return;
    setVerifying(true);
    triggerHaptic('success');

    const cleanInput = codeBuffer.trim().toUpperCase().replace(/^OYA-/, '');

    // Search local squads — require exact plan code match
    const matchedSquad = squads.find((s) => {
      const sCode = s.plan_code.toUpperCase().replace(/^OYA-/, '');
      return sCode === cleanInput;
    });


    if (matchedSquad) {
      try {
        await decideSquadAction(venueId, matchedSquad.plan_code, 'approve');
      } catch {
        // Non-blocking in rapid door mode
      }
      setVerificationResult({
        status: 'success',
        squad: matchedSquad,
        message: `Pass Matched: Table of ${matchedSquad.squad_size} (${matchedSquad.vibe})`,
      });
      triggerHaptic('success');
      if (onSquadVerified) {
        onSquadVerified(matchedSquad.plan_code);
      }
    } else {
      setVerificationResult({
        status: 'not_found',
        message: `No active reservation found for OYA-${cleanInput}`,
      });
      triggerHaptic('warning');
    }
    setVerifying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0F1115] border-2 border-[#00E575]/50 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 text-white relative">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E575] animate-pulse" />
            <span className="text-[11px] font-mono font-black text-[#00E575] uppercase tracking-wider">
              VELVET ROPE · QUICK CODE PUNCH
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Close door punch"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-black/80 rounded-2xl border-2 border-white/15 p-4 text-center space-y-1">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
            PUNCH OYAPLAN PASS CODE
          </span>
          <div className="flex items-center justify-center gap-1 font-mono text-3xl sm:text-4xl font-black text-white tracking-widest min-h-[44px]">
            <span className="text-white/40">OYA-</span>
            <span className="text-[#00E575]">{codeBuffer || '______'}</span>
          </div>
        </div>

        {/* Verification Alert / Result */}
        {verificationResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2.5 animate-in fade-in duration-150 ${
              verificationResult.status === 'success'
                ? 'bg-[#008751]/20 border-[#00E575] text-[#00E575]'
                : 'bg-red-950/30 border-red-500/50 text-red-400'
            }`}
          >
            {verificationResult.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <div className="min-w-0">
              <span className="block truncate">{verificationResult.message}</span>
              {verificationResult.squad && (
                <span className="text-[10px] text-white/70 block mt-0.5">
                  Pass code validated · Table of {verificationResult.squad.squad_size} checked in at door
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tactile Keypad Matrix */}
        <div className="grid grid-cols-3 gap-2.5 font-mono text-lg font-black pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 active:bg-[#008751]/30 border border-white/10 text-white flex items-center justify-center transition-all tap-feedback cursor-pointer shadow-sm"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 text-xs text-white/60 font-bold flex items-center justify-center transition-all tap-feedback cursor-pointer"
          >
            CLEAR
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 active:bg-[#008751]/30 border border-white/10 text-white flex items-center justify-center transition-all tap-feedback cursor-pointer shadow-sm"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 text-white/70 flex items-center justify-center transition-all tap-feedback cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Letter Shortcuts for Lagos OyaPlan codes */}
        <div className="flex items-center justify-between gap-1.5 pt-1 overflow-x-auto pb-1 text-xs font-mono font-bold">
          {['A', 'B', 'C', 'K', 'M', 'P', 'X', 'Y', 'Z'].map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => handleKeyPress(letter)}
              className="h-9 px-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 shrink-0 tap-feedback cursor-pointer"
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Action Clearance Button */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || !codeBuffer.trim()}
          className="w-full h-14 rounded-2xl bg-[#008751] hover:bg-[#007043] active:bg-[#005a35] disabled:opacity-50 text-white font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-950/40 tap-feedback cursor-pointer"
        >
          <Check className="w-5 h-5" />
          <span>{verifying ? 'Verifying Code...' : 'Clear Door Code & Seat'}</span>
        </button>

        <p className="text-[10px] font-mono text-center text-white/40">
          Door Host Console · Clears codes instantly without financial access
        </p>
      </div>
    </div>
  );
}
