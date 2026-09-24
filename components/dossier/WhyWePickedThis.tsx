import { SharedPlanRow } from "@/lib/types";
import { Check } from "lucide-react";

export function WhyWePickedThis({ plan }: { plan: SharedPlanRow }) {
  if (!plan) return null;

  return (
    <div className="w-full mt-8 border border-[#E5E7EB] bg-[#FAFAF8] rounded-[24px] p-6 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-[#E5E7EB] pb-3">
        <h3 className="type-subheading text-[#111827] font-black text-base uppercase tracking-wider flex items-center gap-2">
          <span>✨</span> Why {plan.spot?.name || "This Spot"} Works For Your Squad
        </h3>
        <span className="text-[10px] font-black text-[#008751] uppercase tracking-widest bg-[#008751]/10 px-2 py-0.5 rounded">
          Vibe Check
        </span>
      </div>
      <ul className="space-y-3.5">
        <li className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-[#008751]/10 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-[#008751]" strokeWidth={3} />
          </div>
          <div className="text-xs sm:text-sm text-[#4B5563]">
            <strong className="text-[#111827] font-bold">Landed Budget Match:</strong> Fits inside your target budget at ₦{plan.total_cost?.toLocaleString()} total with accounted food, drinks, and transport.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-[#008751]/10 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-[#008751]" strokeWidth={3} />
          </div>
          <div className="text-xs sm:text-sm text-[#4B5563]">
            <strong className="text-[#111827] font-bold">Squad Seating &amp; Acoustics:</strong> Structured for a squad of {plan.squad_size} where you can actually hear each other talk without shouting over club speakers.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-[#008751]/10 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-[#008751]" strokeWidth={3} />
          </div>
          <div className="text-xs sm:text-sm text-[#4B5563]">
            <strong className="text-[#111827] font-bold">Portions &amp; Kitchen Standard:</strong> Generous plate sizes and consistent kitchen prep tested by our local scout network.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-[#008751]/10 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-[#008751]" strokeWidth={3} />
          </div>
          <div className="text-xs sm:text-sm text-[#4B5563]">
            <strong className="text-[#111827] font-bold">Transparent Dining Terms:</strong> Menu estimates, mandatory charges, and dining terms checked so your squad doesn&apos;t face surprise gate or table fees.
          </div>
        </li>
      </ul>
    </div>
  );
}
