"use client";

import { useSavedSpots } from "@/hooks/useSavedSpots";
import { Spot } from "@/lib/types";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function SaveForLater({ spot }: { spot: Spot }) {
  const { isSaved, saveSpot, removeSpot, isLoaded } = useSavedSpots();

  if (!isLoaded) return null;

  const saved = isSaved(spot.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeSpot(spot.id);
    } else {
      saveSpot(spot);
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? "Remove from Saved Ideas" : "Save for Later"}
      className={`p-2 rounded-full border transition-colors tap-feedback flex items-center justify-center ${
        saved 
          ? "bg-brand-green/10 border-brand-green text-brand-green" 
          : "bg-white border-border-default text-text-muted hover:text-text-primary"
      }`}
      title={saved ? "Remove from Saved Ideas" : "Save for Later"}
    >
      {saved ? (
        <BookmarkCheck className="w-5 h-5" />
      ) : (
        <Bookmark className="w-5 h-5" />
      )}
    </button>
  );
}
