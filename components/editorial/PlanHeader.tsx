import Link from "next/link";
import { ForgeInput, Plan } from "@/lib/types";
import { VenueImage } from "@/components/ui/VenueImage";
import { MapPin, Sparkles, ExternalLink } from "lucide-react";

export function PlanHeader({
  input,
  plan,
  isTopPick = false,
  alternativeIndex = 0
}: {
  input: ForgeInput;
  plan: Plan;
  isTopPick?: boolean;
  alternativeIndex?: number;
}) {
  const getHeadline = () => {
    const v = input.vibe?.toLowerCase() || '';
    const dp = input.daypart?.toLowerCase() || '';
    
    if (v.includes('dinner') || dp.includes('night') || dp.includes('evening')) {
      if (v.includes('dinner')) return 'DATE NIGHT';
      if (v.includes('party')) return 'NIGHT OUT';
    }
    
    if (v === 'brunch') return 'WEEKEND BRUNCH';
    if (v === 'quick') return 'QUICK STOP';
    if (v === 'foodie') return 'SERIOUS CHOP';
    
    return 'CHILL HANGOUT';
  };

  const getHeaderBg = () => {
    if (isTopPick) return "bg-surface-grey/50";
    return "bg-transparent";
  };

  const getAlternativeLabel = () => {
    if (plan.totalCost && input.budget && plan.totalCost <= input.budget * 0.85) {
      return "Option B: Budget Saver";
    }
    if (plan.transportCost && plan.transportCost < 3000) {
      return "Option B: Lower Transport";
    }
    return alternativeIndex === 0 ? "Option B: Different Vibe" : "Option C: Alternative Spot";
  };

  const priceTier = (plan.spot.price_per_person || 12000) > 25000 ? "₦₦₦" : (plan.spot.price_per_person || 12000) > 15000 ? "₦₦" : "₦";
  const areaLabel = plan.spot.address_slug 
    ? plan.spot.address_slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : input.startArea || "Lagos";

  const venueHref = `/venue/${plan.spot.id || plan.spot.address_slug || 'lagos'}`;

  const isStretch = Boolean(plan.totalCost && input.budget && plan.totalCost > input.budget);
  const overDiff = isStretch ? (plan.totalCost! - input.budget!) : 0;
  const kOver = overDiff >= 1000 ? `${(overDiff / 1000).toFixed(overDiff % 1000 === 0 ? 0 : 1)}k` : `${overDiff}`;

  return (
    <div className={`p-6 sm:p-10 pb-8 flex flex-col items-center text-center ${getHeaderBg()}`}>
      {isStretch ? (
        <div className="mb-6 inline-flex items-center gap-2 bg-[#E54D2E]/10 border-2 border-[#E54D2E] text-[#E54D2E] px-3.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0px_#E54D2E]">
          <span>THE STRETCH OPTION</span>
          <span className="text-[#E54D2E]/40">•</span>
          <span>Exceeds target by ₦{kOver} — the stretch option.</span>
        </div>
      ) : isTopPick ? (
        <div className="mb-6 inline-flex items-center gap-1.5 bg-[#111111] text-[#F9E828] border-2 border-[#111111] px-3.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0px_#008751]">
          <Sparkles className="w-3.5 h-3.5 text-[#F9E828]" />
          <span>TOP VIBE MATCH</span>
        </div>
      ) : (
        <div className="mb-6 inline-flex items-center gap-2 bg-[#FAF7F2] border-2 border-[#111111] text-[#111111] px-3.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0px_#111111]">
          <span>{getAlternativeLabel()}</span>
        </div>
      )}

      {/* High-Converting Image Frame: Tactile Urban Ledger Format */}
      <Link 
        href={venueHref}
        aria-label={`Explore verified details and full menu for ${plan.spot.name}`}
        className={`w-full max-w-2xl aspect-[16/9] mb-6 rounded-2xl overflow-hidden img-zoom-container relative block group cursor-pointer border-2 transition-transform duration-200 ${
          isStretch
            ? "border-[#E54D2E] shadow-[6px_6px_0px_#E54D2E]"
            : isTopPick 
            ? "border-[#111111] shadow-[6px_6px_0px_#111111]" 
            : "border-[#111111] shadow-[4px_4px_0px_#111111]"
        }`}
      >
        <VenueImage 
          src={plan.spot.cover_url || plan.spot.image_url || (plan.spot.gallery_urls && plan.spot.gallery_urls[0]) || null} 
          alt={plan.spot.name} 
          fallbackCategory={plan.spot.category}
          className="img-zoom group-hover:scale-105 transition-transform duration-500"
        />
        {/* Subtle Dark Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20 group-hover:from-black/85 transition-colors" />
        
        {/* Top hover indicator */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-[#111111] border border-[#111111]/20 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-md opacity-90 group-hover:opacity-100 group-hover:bg-[#111111] group-hover:text-[#F9E828] transition-all flex items-center gap-1.5">
          <span>View Venue &amp; Menu</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>

        {/* Bottom Floating Pill Indicators */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold pointer-events-none">
          <span className="inline-flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1 rounded-md border border-white/20 text-[11px] font-mono uppercase tracking-wider">
            <MapPin className="w-3 h-3 text-[#F9E828]" />
            <span>{areaLabel}</span>
          </span>
        </div>
      </Link>

      <h2 className="type-display-product text-[#111111] uppercase tracking-tight text-2xl sm:text-3xl lg:text-4xl font-black mb-2 font-display">
        {plan.title || getHeadline()}
      </h2>
      <div className="flex items-center gap-2 justify-center flex-col sm:flex-row">
        <Link 
          href={venueHref}
          className="type-tagline text-[#444444] hover:text-[#111111] text-lg font-bold inline-flex items-center gap-1.5 transition-colors group cursor-pointer"
        >
          <span>{plan.subtitle || `at ${plan.spot.name}`}</span>
          <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#111111]" />
        </Link>
      </div>

      {/* Clean Badges: Distinctive Rectangular Ledger Badges */}
      <div className="flex flex-wrap gap-2 justify-center mt-4 select-none">
        <span className="px-3 py-1 bg-[#111111] text-[#F9E828] border-2 border-[#111111] rounded-md text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
          ✓ {plan.spot.has_food === false ? "VERIFIED ADMISSION" : "MENU VERIFIED"}
        </span>
        <span className="px-3 py-1 bg-[#FAF7F2] border-2 border-[#111111] text-[#111111] rounded-md text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
          {plan.spot.category || 'Spot'} • {priceTier}
        </span>
      </div>
    </div>
  );
}
