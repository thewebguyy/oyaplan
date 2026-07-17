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
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 bg-white-sand min-h-screen text-text-primary">
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
                className="bg-white border border-border-default/60 rounded-[28px] flex flex-col overflow-hidden card-lift shadow-lagoon hover:shadow-lift-lagoon h-full transition-all duration-[350ms]"
              >
                <div className="w-full aspect-[4/3] relative border-b border-border-default/30 bg-surface-grey img-zoom-container">
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
                      <Button className="bg-midnight-lagoon text-white type-ui-label text-xs uppercase font-extrabold px-5 py-2.5 rounded-[8px] btn-spring tap-feedback cursor-pointer">
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
        <div className="text-center py-20 section-trustworthy rounded-[28px] border border-palm-green/10 space-y-5">
          {/* Small decorative danfo illustration */}
          <div className="flex justify-center pb-1">
            <svg width="64" height="36" viewBox="0 0 64 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
              <rect width="64" height="28" rx="4" fill="#FCD116"/>
              <rect y="12" width="64" height="4" fill="#008751" fillOpacity="0.3"/>
              <rect x="8" y="4" width="20" height="8" rx="1" fill="#008751"/>
              <rect x="36" y="4" width="20" height="8" rx="1" fill="#008751"/>
              <circle cx="16" cy="30" r="6" fill="#1A1A1A"/>
              <circle cx="48" cy="30" r="6" fill="#1A1A1A"/>
            </svg>
          </div>
          <h2 className="type-heading text-text-primary text-xl">Your pocket is empty, but outside is calling.</h2>
          <p className="type-body text-text-muted max-w-md mx-auto">
            Discover verified spots in zones like Lekki or Yaba to start building your next squad outing.
          </p>
          <Link href="/explore" className="type-label text-atlantic-blue hover:text-midnight-lagoon transition-colors inline-block">
            Explore Lagos spots &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
