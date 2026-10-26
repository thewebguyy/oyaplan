"use client";

import { useState, useEffect, useCallback } from "react";
import { Spot } from "@/lib/types";
import { saveVenueAction, removeVenueAction, getSavedVenuesAction } from "@/lib/actions/savedVenueActions";

const STORAGE_KEY = "oyaplan_saved_ideas";
const SYNC_EVENT = "oyaplan_saved_spots_updated";

export function useSavedSpots() {
  const [savedSpots, setSavedSpots] = useState<Spot[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadSpots = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
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

    // Cross-device server reconciliation (silent, non-blocking)
    getSavedVenuesAction()
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const stored = localStorage.getItem(STORAGE_KEY);
          const current: Spot[] = stored ? JSON.parse(stored) : [];
          const existingIds = new Set(current.map((s) => s.id));
          const newSpots = res.data.filter((s) => !existingIds.has(s.id));

          if (newSpots.length > 0) {
            const merged = [...current, ...newSpots];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            setSavedSpots(merged);
            window.dispatchEvent(new Event(SYNC_EVENT));
          }
        }
      })
      .catch(() => {
        // Silently catch server sync failures (e.g. unauthenticated or offline)
      });

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
      if (typeof window === "undefined" || !spot.id) return;
      const stored = localStorage.getItem(STORAGE_KEY);
      const current: Spot[] = stored ? JSON.parse(stored) : [];
      
      // Prevent duplicates - if already saved, do not add duplicate
      if (current.some((s) => s.id === spot.id || (s.name && spot.name && s.name.toLowerCase() === spot.name.toLowerCase()))) return;

      // Unshift to place newest saved spot at the top
      const updated = [spot, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedSpots(updated);

      window.dispatchEvent(new Event(SYNC_EVENT));

      // Background server sync for authenticated users (silent, non-blocking)
      saveVenueAction(spot.id).catch(() => {
        // Silently catch server sync failures; localStorage maintains local truth
      });
    } catch (e) {
      console.error("Failed to save spot", e);
    }
  }, []);

  const removeSpot = useCallback((spotId: string) => {
    try {
      if (typeof window === "undefined" || !spotId) return;
      const stored = localStorage.getItem(STORAGE_KEY);
      const current: Spot[] = stored ? JSON.parse(stored) : [];
      const updated = current.filter((s) => s.id !== spotId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedSpots(updated);

      window.dispatchEvent(new Event(SYNC_EVENT));

      // Background server sync for authenticated users (silent, non-blocking)
      removeVenueAction(spotId).catch(() => {
        // Silently catch server sync failures
      });
    } catch (e) {
      console.error("Failed to remove spot", e);
    }
  }, []);

  const isSaved = useCallback((spotId: string) => {
    return savedSpots.some((s) => s.id === spotId || (s.address_slug && s.address_slug === spotId));
  }, [savedSpots]);

  return { savedSpots, isLoaded, saveSpot, removeSpot, isSaved };
}
