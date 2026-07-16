"use client";

import { useState, useEffect } from "react";
import { Spot } from "@/lib/types";

export function useSavedSpots() {
  const [savedSpots, setSavedSpots] = useState<Spot[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("oyaplan_saved_ideas");
      if (stored) {
        setSavedSpots(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved spots", e);
    }
    setIsLoaded(true);
  }, []);

  const saveSpot = (spot: Spot) => {
    const updated = [...savedSpots.filter(s => s.id !== spot.id), spot];
    setSavedSpots(updated);
    try {
      localStorage.setItem("oyaplan_saved_ideas", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save spot", e);
    }
  };

  const removeSpot = (spotId: string) => {
    const updated = savedSpots.filter(s => s.id !== spotId);
    setSavedSpots(updated);
    try {
      localStorage.setItem("oyaplan_saved_ideas", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to remove spot", e);
    }
  };

  const isSaved = (spotId: string) => {
    return savedSpots.some(s => s.id === spotId);
  };

  return { savedSpots, isLoaded, saveSpot, removeSpot, isSaved };
}
