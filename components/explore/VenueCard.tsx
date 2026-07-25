import { Spot } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { TrustBadge, TrustStatus } from "@/components/ui/trust-badge";

interface VenueCardProps {
  spot: Spot;
  slug: string;
  isSaved: boolean;
  onSaveToggle: (spot: Spot) => void;
  budget?: number;
  vibe?: string;
  squadCount: number;
}

export function VenueCard({ spot, slug, isSaved, onSaveToggle, budget, vibe, squadCount }: VenueCardProps) {
  // Helpers replicated from previous explore page
  function getFreshnessText(updatedAt: string | undefined): string {
    if (!updatedAt) return "not yet dated";
    const daysAgo = Math.floor(
      (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysAgo === 0) return "verified today";
    if (daysAgo === 1) return "yesterday";
    if (daysAgo < 7) return `${daysAgo}d ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)}w ago`;
    if (daysAgo < 365) return `${Math.floor(daysAgo / 30)}mo ago`;
    return "over a year ago";
  }

  function deriveTrustStatus(spot: Spot): TrustStatus {
    if (spot.verified_by && spot.price_updated_at) {
      const daysAgo = Math.floor(
        (Date.now() - new Date(spot.price_updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysAgo <= 90) return "verified";
      return "estimated";
    }
    if (spot.computed_confidence_score !== undefined) {
      if (spot.computed_confidence_score >= 75) return "verified";
      if (spot.computed_confidence_score >= 40) return "estimated";
    }
    return "pending";
  }

  const forgeParams = new URLSearchParams();
  forgeParams.append("area", slug);
  forgeParams.append("pinned", spot.id);
  forgeParams.append("vibe", vibe || "chill");
  forgeParams.append("budget", budget ? budget.toString() : "50000");
  forgeParams.append("squad", squadCount.toString());
  forgeParams.append("fresh", "true");

  // Vibe colors
  const vibeColors: Record<string, string> = {
    "date-night": "#E91E63",
    "squad-linkup": "#008751",
    "birthday": "#FFD700",
    "quick-bites": "#FF6F00",
    "brunch": "#4CAF50",
    "drinks": "#9C27B0",
    "solo": "#2196F3",
    "family": "#00BCD4",
    "adventure": "#FF5722",
    "nightlife": "#424242",
  };

  const vibeColor = (spot.vibe_tags && spot.vibe_tags[0] && vibeColors[spot.vibe_tags[0]]) || "#008751";

  const rating = spot.computed_confidence_score ? (spot.computed_confidence_score / 20).toFixed(1) : "4.5"; // Dummy conversion for now

  return (
    <div className="w-full h-full max-w-[420px] mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-border-default flex flex-col relative select-none">
      {/* Full bleed image area (60% height) */}
      <div className="relative h-[55%] w-full bg-surface-grey">
        {spot.image_url ? (
          <Image
            src={spot.image_url}
            alt={spot.name}
            fill
            sizes="(max-width: 420px) 100vw, 420px"
            className="object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#E5E0D8] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              Photo coming soon
            </span>
          </div>
        )}
        
        {/* Gradient overlay for text readability if we put text over image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        <div className="absolute top-4 inset-x-4 flex justify-between items-start z-10 pointer-events-none">
          <span 
            className="text-white text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm"
            style={{ backgroundColor: vibeColor }}
          >
            {spot.vibe_tags?.[0] || spot.category || 'Vibe'}
          </span>
          <div className="pointer-events-auto">
            <TrustBadge
              status={deriveTrustStatus(spot)}
              freshnessText={getFreshnessText(spot.price_updated_at)}
              size="sm"
              className="shadow-md backdrop-blur-md bg-white/90 text-black border-none"
            />
          </div>
        </div>
      </div>

      {/* Info area (45% height) */}
      <div className="flex flex-col flex-1 p-6 justify-between bg-white">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-black text-text-primary uppercase leading-tight line-clamp-2">
              {spot.name}
            </h2>
          </div>
          
          <p className="text-sm text-text-muted mb-4 line-clamp-1">{spot.address}</p>
          
          <div className="flex items-center gap-3 text-sm text-text-muted font-medium mb-4">
            <div className="flex items-center gap-1 text-text-primary">
              <span className="text-brand-green font-bold text-lg">₦{spot.price_per_person.toLocaleString('en-NG')}</span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted">/ person</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-border-default" />
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC107" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{rating}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-border-default" />
            <span>~2.4km</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border-default/50 pointer-events-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              onSaveToggle(spot);
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
              Forge Plan →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
