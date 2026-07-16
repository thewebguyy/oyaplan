import Link from "next/link";
import { getRecentlyVerifiedSpots } from "@/lib/queries/spots";
import { BadgeCheck } from "lucide-react";
import { timeAgo } from "@/lib/utils/timeAgo";

export default async function RecentlyVerified() {
  const { data: spots } = await getRecentlyVerifiedSpots(3);

  if (!spots || spots.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="type-heading text-xl">Recently Verified</h2>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar">
        {spots.map((spot) => {
          const areaName = spot.areas ? Array.isArray(spot.areas) ? spot.areas[0]?.name : spot.areas.name : "Lagos";
          const updatedString = spot.price_updated_at 
            ? `Verified ${timeAgo(spot.price_updated_at)}` 
            : "Recently verified";

          return (
            <Link
              key={spot.id}
              href={`/plan/${spot.id}`}
              className="flex-none w-[280px] sm:w-[300px] border border-border-default rounded-[20px] p-4 snap-start hover:border-brand-green transition-colors tap-feedback group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="type-ui-label text-text-primary text-base font-bold line-clamp-1 group-hover:text-brand-green transition-colors">
                  {spot.name}
                </h3>
              </div>
              <p className="type-caption text-text-muted mb-4">{areaName}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-default">
                <div className="flex flex-col">
                  <span className="type-price text-text-primary text-sm font-bold">
                    ₦{spot.price_per_person?.toLocaleString('en-NG')}
                  </span>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">/ person</span>
                </div>
                <div className="flex items-center gap-1 text-brand-green">
                  <BadgeCheck className="w-3 h-3" />
                  <span className="text-[10px] font-bold tracking-tight">{updatedString}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
