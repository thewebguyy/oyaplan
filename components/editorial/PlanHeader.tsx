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

  return (
    <div className={`p-6 sm:p-10 pb-8 flex flex-col items-center text-center ${getHeaderBg()}`}>
      {isTopPick ? (
        <div className="mb-6 flex items-center gap-2 bg-[#F6C642]/12 border border-[#F6C642]/30 text-[#7A5D00] px-4 py-1.5 rounded-full">
          <span className="text-[11px] font-black uppercase tracking-[0.12em]">★ Our top pick</span>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-2 bg-[#008751]/10 border border-[#008751]/20 text-[#008751] px-4 py-1.5 rounded-full">
          <span className="text-[11px] font-black uppercase tracking-[0.12em]">
            {getAlternativeLabel()}
          </span>
        </div>
      )}
      <div className="w-full max-w-2xl aspect-[16/9] mb-8 rounded-[20px] overflow-hidden img-zoom-container shadow-lagoon relative">
        <VenueImage 
          src={plan.spot.image_url || plan.spot.cover_url} 
          alt={plan.spot.name} 
          fallbackCategory={plan.spot.category}
          className="img-zoom"
        />
      </div>

      <h2 className="type-display-product text-midnight-lagoon uppercase tracking-tight text-xl sm:text-2xl font-black mb-2">
        {plan.title || getHeadline()}
      </h2>
      <div className={`flex items-center gap-2 justify-center ${isTopPick ? "flex-col sm:flex-row" : "flex-col"}`}>
        <p className="type-tagline text-text-muted text-lg font-medium">
          {plan.subtitle || `at ${plan.spot.name}`}
        </p>
        
        {plan.spot.computed_confidence_score !== undefined && plan.spot.computed_confidence_score > 70 && (
          <div className="flex items-center gap-1 bg-palm-green/10 text-palm-green px-2.5 py-0.5 rounded-full mt-2 sm:mt-0 shadow-xs">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {plan.spot.computed_confidence_score}% Planning Confidence
            </span>
          </div>
        )}
      </div>

      {/* Structured Category Badges */}
      <div className="flex flex-wrap gap-2 justify-center mt-3 select-none">
        <span className="px-2.5 py-1 bg-[#F3F4F6] border border-[#E5E7EB] text-[#4B5563] rounded-full text-[10px] font-extrabold uppercase tracking-wider">
          Primary: {plan.spot.category || 'Restaurant'}
        </span>
        {plan.spot.secondary_experience && (
          <span className="px-2.5 py-1 bg-[#F3F4F6] border border-[#E5E7EB] text-[#4B5563] rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Experience: {plan.spot.secondary_experience}
          </span>
        )}
        {plan.spot.food_type && (
          <span className="px-2.5 py-1 bg-[#F3F4F6] border border-[#E5E7EB] text-[#4B5563] rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Food: {plan.spot.food_type}
          </span>
        )}
      </div>
    </div>
  );
}
