import { DecisionCardViewModel } from "@/lib/planning/presentation/types";
import { VenueImage } from "@/components/ui/VenueImage";
import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { TrustBadge } from "@/components/ui/trust-badge";

interface VenueCardProps {
  card: DecisionCardViewModel;
  slug: string;
  isSaved: boolean;
  onSaveToggle: () => void;
  budget?: number;
  vibe?: string;
  squadCount: number;
}

export function VenueCard({ card, slug, isSaved, onSaveToggle, budget, vibe, squadCount }: VenueCardProps) {
  const spotAreaSlug = card.areaSlug || slug;
  const forgeParams = new URLSearchParams();
  forgeParams.append("area", spotAreaSlug);
  forgeParams.append("pinned", card.spotId);
  
  // Maps internal vibe tags AND URL slugs → valid Forge URL slug (Zod-accepted)
  const VIBE_TO_URL: Record<string, string> = {
    "Dinner": "date-night",   "date-night": "date-night",
    "Chill":  "chill",        "chill":       "chill",
    "Foodie": "foodie",       "foodie":      "foodie",
    "Party":  "party",        "party":       "party",
    "Quick":  "quick-link",   "quick-link":  "quick-link",
    "Brunch": "brunch",       "brunch":      "brunch",
  };

  forgeParams.append("vibe",
    VIBE_TO_URL[vibe ?? ""] ??
    "chill"
  );
  forgeParams.append("budget", budget ? budget.toString() : "50000");
  forgeParams.append("squad", squadCount.toString());
  forgeParams.append("fresh", "true");

  // Category-based colors for badges
  const categoryColors: Record<string, string> = {
    restaurant: "#008751",
    bar: "#9C27B0",
    cafe: "#4CAF50",
    activity: "#FF5722",
    entertainment: "#AB47BC",
    experience: "#E91E63",
    nature: "#2196F3",
    beach: "#00BCD4"
  };

  const badgeColor = categoryColors[card.category] || "#008751";

  return (
    <div className="w-full h-full sm:w-[400px] mx-auto bg-white rounded-[32px] overflow-hidden shadow-lift-lagoon border border-border-default/40 flex flex-col relative select-none">
      {/* Full bleed image area (55% height) */}
      <div className="relative h-[55%] w-full bg-surface-grey img-zoom-container">
        <VenueImage
          src={card.heroImage}
          alt={card.spotName}
          sizes="(max-width: 640px) 100vw, 400px"
          fallbackCategory={card.category}
          className="img-zoom"
        />
        
        {/* Gradient overlay for text readability if we put text over image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        <div className="absolute top-4 inset-x-4 flex justify-between items-start z-10 pointer-events-none">
          <div className="flex flex-col gap-1.5 items-start">
            <span 
              className="text-white text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm capitalize"
              style={{ backgroundColor: badgeColor }}
            >
              {card.category || 'Vibe'}
            </span>
            {card.secondaryExperience && (
              <span className="bg-white/90 backdrop-blur-md text-[#1A1A1A] text-[9px] font-extrabold tracking-widest uppercase px-2 py-1 rounded-full shadow-sm flex items-center gap-1 select-none">
                ⚡ {card.secondaryExperience}
              </span>
            )}
            {card.foodType && (
              <span className="bg-white/90 backdrop-blur-md text-[#1A1A1A] text-[9px] font-extrabold tracking-widest uppercase px-2 py-1 rounded-full shadow-sm flex items-center gap-1 select-none">
                🍪 {card.foodType}
              </span>
            )}
          </div>
          <div className="pointer-events-auto">
            <TrustBadge
              status={card.trustIndicator.level === 'high' ? 'verified' : card.trustIndicator.level === 'medium' ? 'estimated' : 'pending'}
              freshnessText={card.verification}
              size="sm"
              className="shadow-md backdrop-blur-md bg-white/90 text-black border-none"
            />
          </div>
        </div>
      </div>

      {/* Info area (45% height) */}
      <div className="flex flex-col flex-1 p-6 justify-between bg-white">
        <div>
          <div className="mb-2">
            <h2 className="text-2xl font-black text-text-primary uppercase leading-tight line-clamp-1">
              {card.spotName}
            </h2>
            <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{card.address}</p>
          </div>

          {/* Pricing Highlight Section */}
          <div className="flex justify-between items-end mb-4 pt-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Estimated Total</span>
              <div className="text-3xl font-black text-[#008751]">
                ₦{card.totalCost.toLocaleString('en-NG')}
              </div>
            </div>
            {budget && (
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Remaining</span>
                <div className="text-sm font-extrabold text-midnight-lagoon">
                  ₦{card.budgetRemaining.toLocaleString('en-NG')} left
                </div>
              </div>
            )}
          </div>
          
          {/* Cost Breakdown */}
          <div className="border-t border-b border-border-default/50 py-3 mb-4 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-text-secondary">
              <span>Venue ({squadCount} people)</span>
              <span>₦{card.venueCost.toLocaleString('en-NG')}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-text-secondary">
              <span>Estimated Transport</span>
              <span>₦{card.transportCost.toLocaleString('en-NG')}</span>
            </div>
          </div>

          {/* Trust and Why It Fits Context */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-bold text-text-primary flex items-start gap-1.5">
              <span className="text-[#008751] font-black shrink-0">✓</span>
              <span>{card.whyItFits}</span>
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-1 bg-surface-grey border border-border-default/60 text-text-secondary rounded-full text-[10px] font-bold">
                {card.verification}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                card.trustIndicator.level === 'high' 
                  ? 'bg-[#EAFDF3] border-[#A3F3C6] text-[#0A7C3F]' 
                  : card.trustIndicator.level === 'medium'
                    ? 'bg-[#FFF9E6] border-[#FFE29A] text-[#B27000]'
                    : 'bg-[#FFF0F0] border-[#FFCDCD] text-[#C72C2C]'
              }`}>
                {card.trustIndicator.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border-default/50 pointer-events-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              onSaveToggle();
            }}
            aria-label={isSaved ? "Remove from saved" : "Save this spot"}
            className={`p-3 min-w-[44px] min-h-[44px] rounded-xl border-2 flex items-center justify-center transition-all ${
              isSaved 
                ? "bg-brand-green/10 border-brand-green text-brand-green" 
                : "bg-surface-grey border-transparent text-text-muted hover:text-text-primary hover:bg-black/5"
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
          </button>
          
          <Link href={`/forge?${forgeParams.toString()}`} className="flex-1 block">
            <button className="w-full bg-[#0A0A0A] text-white type-ui-label text-sm uppercase font-extrabold px-5 py-3.5 rounded-xl btn-intent-snaps cursor-pointer">
              Start Planning →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
