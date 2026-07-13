"use client";

import Link from "next/link";
import { Calendar, Settings2 } from "lucide-react";
import { generateGoogleCalendarLink } from "@/lib/utils"; // Assuming a utility exists, or we can just build the ICS download link

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
  // Construct the Forge pre-fill URL using the exact keys from Zod schema
  // forgeParamsSchema: vibe, squad, budget, area
  const forgeParams = new URLSearchParams({
    budget: budget.toString(),
    squad: squadSize.toString(),
    vibe: vibe.toLowerCase().replace(" ", "-"), // ensure it matches enum (e.g. "date-night")
    area: startArea || "anywhere",
  });
  
  const forgeUrl = `/forge?${forgeParams.toString()}`;

  // Simple calendar generic handler (in real app, triggers ics download or opens GCal)
  const handleCalendar = () => {
    // Basic Google Calendar link generation for demo
    const text = encodeURIComponent(`OyaPlan: ${venueName}`);
    const details = encodeURIComponent(`Plan ID: ${planId}\n\nView full dossier: https://oyaplan.vercel.app/plan/${planId}`);
    const location = encodeURIComponent(address || venueName);
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`, '_blank');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg mx-auto mt-8">
      <button 
        onClick={handleCalendar}
        className="w-full sm:flex-1 bg-black text-white font-sans font-bold uppercase tracking-widest text-xs h-14 rounded-[8px] flex items-center justify-center gap-2 btn-intent-snaps tap-feedback"
      >
        <Calendar className="w-4 h-4" />
        I Dey In (Save to Calendar)
      </button>

      <Link 
        href={forgeUrl}
        className="w-full sm:flex-1 bg-transparent border-2 border-black text-black font-sans font-bold uppercase tracking-widest text-xs h-14 rounded-[8px] flex items-center justify-center gap-2 hover:bg-surface-grey transition-colors tap-feedback"
      >
        <Settings2 className="w-4 h-4" />
        Too Costly? Tweak the Budget
      </Link>
    </div>
  );
}
