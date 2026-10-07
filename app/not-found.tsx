import Link from "next/link";
import { ArrowLeft, Compass, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-[#F6F6F2] flex flex-col items-center justify-center p-6 text-center antialiased font-sans selection:bg-[#F9E828] selection:text-[#111111]">
      <div className="w-full max-w-lg bg-white border-3 border-[#111111] rounded-3xl p-8 sm:p-10 shadow-[8px_8px_0px_0px_#111111] space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-[900] tracking-tighter text-[#111111]">
            Oya<span className="bg-[#F9E828] px-1 rounded-sm border border-[#111111]">Plan</span>
          </span>
          <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#111111] text-[#F9E828] px-2.5 py-0.5 rounded-full">
            404 • LOST IN TRAFFIC
          </span>
        </div>

        {/* 🚧 Danfo Wrong-Way Vector Illustration */}
        <div className="relative w-28 h-28 mx-auto bg-[#FFFEE5] border-2 border-[#111111] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#111111]">
          <svg viewBox="0 0 80 80" className="w-20 h-20" aria-hidden="true">
            {/* Road lines */}
            <line x1="10" y1="65" x2="70" y2="65" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
            <line x1="25" y1="65" x2="35" y2="65" stroke="#F9E828" strokeWidth="3" strokeLinecap="round" />
            <line x1="45" y1="65" x2="55" y2="65" stroke="#F9E828" strokeWidth="3" strokeLinecap="round" />
            {/* Danfo Body tilted */}
            <g transform="rotate(-6 40 40)">
              <rect x="20" y="24" width="40" height="26" rx="4" fill="#F9E828" stroke="#111111" strokeWidth="2.5" />
              {/* Green Danfo stripe */}
              <line x1="20" y1="38" x2="60" y2="38" stroke="#008751" strokeWidth="3" />
              {/* Windows */}
              <rect x="24" y="27" width="9" height="7" rx="1" fill="#111111" />
              <rect x="36" y="27" width="9" height="7" rx="1" fill="#111111" />
              <rect x="48" y="27" width="9" height="7" rx="1" fill="#111111" />
              {/* Wheels */}
              <circle cx="29" cy="50" r="4.5" fill="#111111" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="51" cy="50" r="4.5" fill="#111111" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>
            {/* Traffic Cone */}
            <polygon points="62,65 67,48 72,65" fill="#FF5500" stroke="#111111" strokeWidth="2" />
            <line x1="64" y1="56" x2="70" y2="56" stroke="#FFFFFF" strokeWidth="2" />
          </svg>
        </div>

        {/* Narrative Copy */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F9E828] text-[#111111] border border-[#111111]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#111111]" />
            <span>ONE-WAY WARNING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] font-display uppercase tracking-tight">
            You Don Enter One-Way!
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] font-medium leading-relaxed max-w-sm mx-auto">
            The spot, link, or plan you&apos;re looking for has moved to another part of Lagos or doesn&apos;t exist. No vex, let&apos;s reroute you back to the soft life.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-[#F9E828] hover:bg-[#ffe710] text-[#111111] font-display font-black text-xs uppercase tracking-wider border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer tap-feedback">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Safe Roads</span>
            </button>
          </Link>
          
          <Link href="/explore" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-white hover:bg-[#F6F6F2] text-[#111111] font-display font-black text-xs uppercase tracking-wider border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer tap-feedback">
              <Compass className="w-4 h-4" />
              <span>Find a Verified Spot</span>
            </button>
          </Link>
        </div>

        {/* Micro-trust note */}
        <p className="text-[11px] font-mono text-[#777777] font-semibold pt-2">
          Tip: Check spelling or explore by Island vs. Mainland hubs.
        </p>

      </div>
    </main>
  );
}
