import Link from "next/link";
import { getRecentlyVerifiedSpots } from "@/lib/queries/spots";
import { BadgeCheck } from "lucide-react";
import { timeAgo } from "@/lib/utils/timeAgo";
import RevealOnScroll from "@/components/motion/RevealOnScroll";

export default async function RecentlyVerified() {
  const { data: spots } = await getRecentlyVerifiedSpots(3);

  if (!spots || spots.length === 0) {
    return null;
  }

  return (
    <RevealOnScroll className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="type-heading text-midnight-lagoon">Vibe Checks (Fresh Menus)</h2>
      </div>
      <div className="flex flex-row gap-4 overflow-x-auto pb-3 snap-x -mx-4 px-4 hide-scrollbar stagger-children">
        {spots.map((spot) => {
          const areaName = spot.areas ? Array.isArray(spot.areas) ? spot.areas[0]?.name : spot.areas.name : "Lagos";
          const updatedString = spot.price_updated_at 
            ? `Vetted ${timeAgo(spot.price_updated_at)}` 
            : "Vetted recently";

          return (
            <Link
              key={spot.id}
              href={`/plan/${spot.id}`}
              className="flex-none w-[280px] sm:w-[300px] bg-white border border-border-default/60 rounded-[28px] p-5 snap-start card-lift shadow-xs hover:shadow-lift-warm tap-feedback group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="type-venue-name text-midnight-lagoon text-base tracking-tight line-clamp-1">
                  {spot.name}
                </h3>
              </div>
              <p className="type-caption text-text-muted mb-5">{areaName}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-default/50">
                <div className="flex flex-col">
                  <span className="type-price text-midnight-lagoon text-sm font-bold">
                    ₦{spot.price_per_person?.toLocaleString('en-NG')}
                  </span>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">/ person</span>
                </div>
                <div className="flex items-center gap-1.5 bg-palm-green/10 rounded-full px-2.5 py-1">
                  <BadgeCheck className="w-3 h-3 text-palm-green" />
                  <span className="text-[10px] font-bold tracking-tight text-palm-green">{updatedString}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </RevealOnScroll>
  );
}
