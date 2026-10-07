"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime error caught by boundary:", error);
  }, [error]);

  return (
    <main className="min-h-[100dvh] bg-[#F6F6F2] flex flex-col items-center justify-center p-6 text-center antialiased font-sans selection:bg-[#F9E828] selection:text-[#111111]">
      <div className="w-full max-w-lg bg-white border-3 border-[#111111] rounded-3xl p-8 sm:p-10 shadow-[8px_8px_0px_0px_#111111] space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-[900] tracking-tighter text-[#111111]">
            Oya<span className="bg-[#F9E828] px-1 rounded-sm border border-[#111111]">Plan</span>
          </span>
          <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#111111] text-[#F9E828] px-2.5 py-0.5 rounded-full">
            500 • GO-SLOW ALERT
          </span>
        </div>

        {/* 🚦 Lagos Traffic Light Vector Illustration */}
        <div className="relative w-28 h-28 mx-auto bg-[#FFFEE5] border-2 border-[#111111] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#111111]">
          <svg viewBox="0 0 60 80" className="w-16 h-20" aria-hidden="true">
            {/* Traffic Light Housing */}
            <rect x="18" y="10" width="24" height="60" rx="6" fill="#111111" stroke="#111111" strokeWidth="2" />
            {/* Red Light */}
            <circle cx="30" cy="22" r="7" fill="#FF4444" className="animate-pulse" />
            {/* Yellow / Amber Light */}
            <circle cx="30" cy="40" r="7" fill="#F9E828" />
            {/* Green Light */}
            <circle cx="30" cy="58" r="7" fill="#008751" opacity="0.3" />
            {/* Side visors */}
            <path d="M 18 20 C 14 20, 14 25, 18 25" stroke="#F9E828" strokeWidth="2" fill="none" />
            <path d="M 42 20 C 46 20, 46 25, 42 25" stroke="#F9E828" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {/* Narrative Copy */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FF4444]/15 text-[#FF4444] border border-[#FF4444]/30">
            <AlertCircle className="w-3.5 h-3.5 text-[#FF4444]" />
            <span>GRIDLOCK ON THE SERVER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] font-display uppercase tracking-tight">
            Go-Slow On The Server!
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] font-medium leading-relaxed max-w-sm mx-auto">
            Network hold us small for Third Mainland Bridge. Lagos moves at 100mph, but this request hit traffic. Tap below to clear the lane.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-[#F9E828] hover:bg-[#ffe710] text-[#111111] font-display font-black text-xs uppercase tracking-wider border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer tap-feedback"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Traffic &amp; Retry</span>
          </button>
          
          <Link href="/" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-white hover:bg-[#F6F6F2] text-[#111111] font-display font-black text-xs uppercase tracking-wider border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer tap-feedback">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </Link>
        </div>

        {/* Micro-trust note */}
        <p className="text-[11px] font-mono text-[#777777] font-semibold pt-2">
          No charges made. Your saved plans remain safe in your account.
        </p>

      </div>
    </main>
  );
}
