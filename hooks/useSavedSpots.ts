"use client";

import { useState, useEffect, useCallback } from "react";
import { Spot } from "@/lib/types";

const STORAGE_KEY = "oyaplan_saved_ideas";
const SYNC_EVENT = "oyaplan_saved_spots_updated";

export function useSavedSpots() {
  const [savedSpots, setSavedSpots] = useState<Spot[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadSpots = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedSpots(parsed);
        }
      } else {
        setSavedSpots([]);
      }
    } catch (e) {
      console.error("Failed to load saved spots", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadSpots();

    const handleSync = () => {
      loadSpots();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener(SYNC_EVENT, handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(SYNC_EVENT, handleSync);
    };
  }, [loadSpots]);

  const saveSpot = useCallback((spot: Spot) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const current: Spot[] = stored ? JSON.parse(stored) : [];
      
      // Prevent duplicates - if already saved, do not add duplicate
      if (current.some(s => s.id === spot.id)) return;

      // Unshift to place newest saved spot at the top
      const updated = [spot, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedSpots(updated);

      window.dispatchEvent(new Event(SYNC_EVENT));
    } catch (e) {
      console.error("Failed to save spot", e);
    }
  }, []);

  const removeSpot = useCallback((spotId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const current: Spot[] = stored ? JSON.parse(stored) : [];
      const updated = current.filter(s => s.id !== spotId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedSpots(updated);

      window.dispatchEvent(new Event(SYNC_EVENT));
    } catch (e) {
      console.error("Failed to remove spot", e);
    }
  }, []);

  const isSaved = useCallback((spotId: string) => {
    return savedSpots.some(s => s.id === spotId);
  }, [savedSpots]);

  return { savedSpots, isLoaded, saveSpot, removeSpot, isSaved };
}

