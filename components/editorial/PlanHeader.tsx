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

  return (
    <div className={`p-6 sm:p-10 pb-8 flex flex-col items-center text-center ${getHeaderBg()}`}>
      {isTopPick ? (
        <div className="mb-6 flex items-center gap-1.5 bg-[#F6C642]/15 border border-[#F6C642]/40 text-[#7A5D00] px-4 py-1.5 rounded-full shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] font-black uppercase tracking-[0.14em]">Top Vibe Match</span>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-2 bg-[#008751]/10 border border-[#008751]/25 text-[#008751] px-4 py-1.5 rounded-full shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-[0.14em]">
            {getAlternativeLabel()}
          </span>
        </div>
      )}

      {/* High-Converting Image Frame */}
      <Link 
        href={venueHref}
        aria-label={`Explore verified details and full menu for ${plan.spot.name}`}
        className={`w-full max-w-2xl aspect-[16/9] mb-8 rounded-[24px] overflow-hidden img-zoom-container relative border block group cursor-pointer ${
          isTopPick 
            ? "border-[#008751]/30 shadow-[0_16px_36px_-8px_rgba(0,135,81,0.18)] ring-1 ring-[#008751]/20" 
            : "border-black/5 shadow-xl"
        }`}
      >
        <VenueImage 
          src={plan.spot.cover_url || plan.spot.image_url || (plan.spot.gallery_urls && plan.spot.gallery_urls[0]) || null} 
          alt={plan.spot.name} 
          fallbackCategory={plan.spot.category}
          className="img-zoom group-hover:scale-105 transition-transform duration-500"
        />
        {/* Subtle Dark Vignette & Live Badge Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/20 group-hover:from-black/80 transition-colors" />
        
        {/* Top hover indicator */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-[#111827] px-3 py-1.5 rounded-full text-xs font-bold shadow-md opacity-90 group-hover:opacity-100 group-hover:bg-[#008751] group-hover:text-white transition-all flex items-center gap-1">
          <span>View Venue &amp; Menu</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>

        {/* Bottom Floating Pill Indicators */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] uppercase tracking-wider">
            <MapPin className="w-3 h-3 text-[#FCC630]" />
            <span>{areaLabel}</span>
          </span>
          <span className="bg-[#008751] text-white px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
            {plan.spot.has_food === false ? "Verified Admission" : "Verified Menu"}
          </span>
        </div>
      </Link>

      <h2 className="type-display-product text-[#111827] uppercase tracking-tight text-xl sm:text-3xl font-black mb-2">
        {plan.title || getHeadline()}
      </h2>
      <div className="flex items-center gap-2 justify-center flex-col sm:flex-row">
        <Link 
          href={venueHref}
          className="type-tagline text-[#4B5563] hover:text-[#008751] text-lg font-semibold inline-flex items-center gap-1.5 transition-colors group cursor-pointer"
        >
          <span>{plan.subtitle || `at ${plan.spot.name}`}</span>
          <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#008751]" />
        </Link>
      </div>

      {/* Resy Structured Data Badges */}
      <div className="flex flex-wrap gap-2 justify-center mt-4 select-none">
        <span className="px-3 py-1 bg-[#111827]/5 border border-[#111827]/10 text-[#111827] rounded-full text-[11px] font-black uppercase tracking-wider">
          {plan.spot.category || 'Restaurant'}
        </span>
        <span className="px-3 py-1 bg-[#008751]/10 border border-[#008751]/20 text-[#008751] rounded-full text-[11px] font-black tracking-wider">
          Price Tier: {priceTier}
        </span>
        {plan.spot.food_type && (
          <span className="px-3 py-1 bg-[#F3F4F6] border border-[#E5E7EB] text-[#4B5563] rounded-full text-[11px] font-bold uppercase tracking-wider">
            Chop: {plan.spot.food_type}
          </span>
        )}
      </div>
    </div>
  );
}
