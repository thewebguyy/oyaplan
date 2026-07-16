"use client";

import { useSavedSpots } from "@/hooks/useSavedSpots";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrubbablePhotos from "@/components/explore/ScrubbablePhotos";

export default function SavedPage() {
  const { savedSpots, isLoaded, removeSpot } = useSavedSpots();

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="type-body text-text-muted">Loading saved ideas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 bg-white min-h-screen text-text-primary">
      <div className="space-y-4">
        <Link href="/">
          <button className="type-label text-text-secondary hover:text-brand-green transition-colors flex items-center gap-2 tap-feedback py-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Planner
          </button>
        </Link>
        <h1 className="type-display-product text-3xl sm:text-4xl font-black">
          Saved Ideas
        </h1>
        <p className="type-body text-text-muted max-w-xl">
          Your saved outing spots. You can pre-fill the planner directly from any of these spots when you're ready to go.
        </p>
      </div>

      {savedSpots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {savedSpots.map((spot) => {
            const prefillParams = new URLSearchParams({
              startArea: spot.areas?.slug || "anywhere",
              pinnedSpotId: spot.id,
              squad: "2",
              budget: (spot.price_per_person * 2 * 1.1).toString()
            });

            return (
              <div 
                key={spot.id} 
                className="bg-white border border-border-default rounded-[20px] flex flex-col overflow-hidden dossier-card h-full transition-all duration-200"
              >
                <div className="w-full aspect-[4/3] relative border-b border-border-default bg-surface-grey">
                  <ScrubbablePhotos venueName={spot.name} />
                  <div className="absolute top-3 right-3 z-40">
                    <button
                      onClick={() => removeSpot(spot.id)}
                      aria-label={`Remove ${spot.name} from Saved Ideas`}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full border border-border-default text-red-500 hover:bg-red-50 transition-all tap-feedback"
                      title="Remove from Saved Ideas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow text-left">
                  <h3 className="type-heading text-text-primary mb-2 uppercase leading-tight font-black">{spot.name}</h3>
                  <p className="type-caption text-text-muted mb-4 line-clamp-1">{spot.address}</p>

                  <div className="mt-auto pt-4 border-t border-border-default flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-sans font-black text-text-primary text-lg">₦{spot.price_per_person.toLocaleString('en-NG')}</span>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-0.5">/ person</span>
                    </div>
                    
                    <Link href={`/forge?${prefillParams.toString()}&fresh=true`}>
                      <Button className="bg-[#0A0A0A] text-white type-ui-label text-xs uppercase font-extrabold px-5 py-2.5 rounded-[8px] btn-intent-snaps cursor-pointer">
                        Forge Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-grey rounded-[24px] border border-border-default space-y-4">
          <p className="type-body text-text-muted">No saved spots yet.</p>
          <Link href="/explore" className="type-label text-brand-green hover:underline inline-block">
            Explore Lagos spots to save some &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
