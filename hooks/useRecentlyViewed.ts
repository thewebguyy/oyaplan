"use client";

import { useState, useEffect, useCallback } from "react";

export interface RecentlyViewedVenue {
  id: string;
  name: string;
  address: string;
  areaSlug: string;
  areaName: string;
  category: string;
  pricePerPerson: number;
  imageUrl?: string;
  coverUrl?: string;
  vibeTags: string[];
  viewedAt: string;
}

const STORAGE_KEY = "oyaplan_recently_viewed_v1";
const SYNC_EVENT = "oyaplan_recently_viewed_updated";
const MAX_RECENT_ITEMS = 10;

export function useRecentlyViewed() {
  const [recentVenues, setRecentVenues] = useState<RecentlyViewedVenue[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadRecent = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Sort descending by viewedAt
          const sorted = parsed.sort(
            (a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
          );
          setRecentVenues(sorted.slice(0, MAX_RECENT_ITEMS));
        }
      } else {
        setRecentVenues([]);
      }
    } catch (e) {
      console.error("Failed to load recently viewed venues", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadRecent();

    const handleSync = () => {
      loadRecent();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener(SYNC_EVENT, handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(SYNC_EVENT, handleSync);
    };
  }, [loadRecent]);

  const recordView = useCallback((venue: Omit<RecentlyViewedVenue, "viewedAt">) => {
    try {
      if (typeof window === "undefined" || !venue.id) return;

      const stored = localStorage.getItem(STORAGE_KEY);
      const current: RecentlyViewedVenue[] = stored ? JSON.parse(stored) : [];

      const updatedEntry: RecentlyViewedVenue = {
        ...venue,
        viewedAt: new Date().toISOString(),
      };

      // Remove existing occurrence to prevent duplicates and hoist to top
      const filtered = current.filter((item) => item.id !== venue.id);
      const updated = [updatedEntry, ...filtered].slice(0, MAX_RECENT_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentVenues(updated);

      window.dispatchEvent(new Event(SYNC_EVENT));
    } catch (e) {
      console.error("Failed to record recently viewed venue", e);
    }
  }, []);

  const clearRecent = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(STORAGE_KEY);
      setRecentVenues([]);
      window.dispatchEvent(new Event(SYNC_EVENT));
    } catch (e) {
      console.error("Failed to clear recently viewed venues", e);
    }
  }, []);

  return {
    recentVenues,
    isLoaded,
    recordView,
    clearRecent,
  };
}
