import { ForgeInput, Plan } from "@/lib/types";
import { CheckCircle } from "lucide-react";
import { VenueImage } from "@/components/ui/VenueImage";

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
      return "Option B: Budget Saver 💰";
    }
    if (plan.transportCost && plan.transportCost < 3000) {
      return "Option B: Lower Transport 🚖";
    }
    return alternativeIndex === 0 ? "Option B: Different Vibe 🔮" : "Option C: Alternative Spot 📍";
  };

  const priceTier = (plan.spot.price_per_person || 12000) > 25000 ? "₦₦₦" : (plan.spot.price_per_person || 12000) > 15000 ? "₦₦" : "₦";
  const areaLabel = plan.spot.address_slug 
    ? plan.spot.address_slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : input.area || "Lagos";

  return (
    <div className={`p-6 sm:p-10 pb-8 flex flex-col items-center text-center ${getHeaderBg()}`}>
      {isTopPick ? (
        <div className="mb-6 flex items-center gap-2 bg-[#F6C642]/15 border border-[#F6C642]/40 text-[#7A5D00] px-4 py-1.5 rounded-full shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-[0.14em]">★ Top Vibe Match</span>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-2 bg-[#008751]/10 border border-[#008751]/25 text-[#008751] px-4 py-1.5 rounded-full shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-[0.14em]">
            {getAlternativeLabel()}
          </span>
        </div>
      )}

      {/* Resy/OpenTable High-Converting Image Frame */}
      <div className="w-full max-w-2xl aspect-[16/9] mb-8 rounded-[24px] overflow-hidden img-zoom-container shadow-2xl relative border border-black/5">
        <VenueImage 
          src={plan.spot.image_url || plan.spot.cover_url} 
          alt={plan.spot.name} 
          fallbackCategory={plan.spot.category}
          className="img-zoom"
        />
        {/* Subtle Dark Vignette & Live Badge Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
        
        {/* Bottom Floating Pill Indicators */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold pointer-events-none">
          <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] uppercase tracking-wider">
            📍 {areaLabel}
          </span>
          <span className="bg-[#008751] text-white px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
            Verified Menu
          </span>
        </div>
      </div>

      <h2 className="type-display-product text-[#111827] uppercase tracking-tight text-xl sm:text-3xl font-black mb-2">
        {plan.title || getHeadline()}
      </h2>
      <div className="flex items-center gap-2 justify-center flex-col sm:flex-row">
        <p className="type-tagline text-[#4B5563] text-lg font-semibold">
          {plan.subtitle || `at ${plan.spot.name}`}
        </p>
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
