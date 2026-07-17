"use client";

import Link from "next/link";
import { Calendar, Settings2 } from "lucide-react";
import { useState } from "react";

interface PlanCTAsProps {
  planId: string;
  venueName: string;
  address: string;
  budget: number;
  squadSize: number;
  vibe: string;
  startArea: string;
}

export function PlanCTAs({ planId, venueName, address, budget, squadSize, vibe, startArea }: PlanCTAsProps) {
  const [isUpNepa, setIsUpNepa] = useState(false);

  // Construct the Forge pre-fill URL using the exact keys from Zod schema
  // forgeParamsSchema: vibe, squad, budget, area
  const forgeParams = new URLSearchParams({
    budget: budget.toString(),
    squad: squadSize.toString(),
    vibe: vibe.toLowerCase().replace(" ", "-"), // ensure it matches enum (e.g. "date-night")
    area: startArea || "anywhere",
  });
  
  const forgeUrl = `/forge?${forgeParams.toString()}`;

  const handleCalendar = () => {
    // Up NEPA Animation sequence
    setIsUpNepa(true);
    
    // Hold exactly 150ms then snap back, and trigger calendar action
    setTimeout(() => {
      setIsUpNepa(false);
      
      const text = encodeURIComponent(`OyaPlan: ${venueName}`);
      const details = encodeURIComponent(`Plan ID: ${planId}\n\nView full dossier: https://oyaplan.vercel.app/plan/${planId}`);
      const location = encodeURIComponent(address || venueName);
      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`, '_blank');
    }, 150);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg mx-auto mt-8 relative ${isUpNepa ? 'animate-up-nepa' : ''}`}>
      {/* SQUAD LOCKED stamp drops during Up NEPA */}
      {isUpNepa && (
        <div className="absolute -top-6 right-0 z-50 animate-squad-stamp pointer-events-none">
          <div className="bg-black text-[#F6C642] px-3 py-1 font-black uppercase tracking-widest text-[14px] transform border-2 border-black">
            Squad Locked
          </div>
        </div>
      )}

      <button 
        onClick={handleCalendar}
        className="w-full sm:flex-1 bg-black text-white font-sans font-bold uppercase tracking-widest text-xs h-14 rounded-[8px] flex items-center justify-center gap-2 btn-intent-snaps tap-feedback"
      >
        <Calendar className="w-4 h-4" />
        I Dey In (Save to Calendar)
      </button>

      <Link 
        href={forgeUrl}
        className="w-full sm:flex-1 bg-transparent border-2 border-midnight-lagoon/30 text-midnight-lagoon font-sans font-bold uppercase tracking-widest text-xs h-14 rounded-[8px] flex items-center justify-center gap-2 hover:border-midnight-lagoon transition-[colors,border-color] tap-feedback"
        style={{ transitionDuration: 'var(--duration-hover)' }}
      >
        <Settings2 className="w-4 h-4" />
        Too Costly? Tweak the Budget
      </Link>
    </div>
  );
}
