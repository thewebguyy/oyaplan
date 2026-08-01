"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Origin, LocationStatus, Coordinates } from "./types";
import { OriginStore } from "../storage/OriginStore";
import { OriginPolicy } from "./OriginPolicy";
import { BrowserLocationService, OriginResolver } from "./LocationService";

export interface OriginContextType {
  origin: Origin | null;
  status: LocationStatus;
  requestCurrentLocation(): Promise<void>;
  setManualOrigin(slug: string): void;
  clearOrigin(): void;
  unsupportedAreaName: string | null;
  unsupportedAreaSlug: string | null;
  resetStatus(): void;
}

const OriginContext = createContext<OriginContextType | undefined>(undefined);

export function OriginProvider({ children }: { children: React.ReactNode }) {
  const [origin, setOriginState] = useState<Origin | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [unsupportedAreaName, setUnsupportedAreaName] = useState<string | null>(null);
  const [unsupportedAreaSlug, setUnsupportedAreaSlug] = useState<string | null>(null);

  useEffect(() => {
    const envelope = OriginStore.loadOrigin();
    if (OriginPolicy.isValid(envelope)) {
      setOriginState(envelope!.origin);
      setStatus(envelope!.origin.source === "gps" ? "gps" : "manual");
    } else {
      OriginStore.clearOrigin();
      setOriginState(null);
      setStatus("idle");
    }
  }, []);

  const requestCurrentLocation = async () => {
    setStatus("locating");
    setUnsupportedAreaName(null);
    setUnsupportedAreaSlug(null);
    try {
      const coords = await BrowserLocationService.getCurrentCoordinates();
      const gpsOrigin = OriginResolver.resolveGPSOrigin(coords);
      if (!gpsOrigin) {
        const closest = OriginResolver.getClosestArea(coords);
        setUnsupportedAreaName(closest.name);
        setUnsupportedAreaSlug(closest.id);
        setStatus("unsupported");
        return;
      }
      OriginStore.saveOrigin(gpsOrigin);
      setOriginState(gpsOrigin);
      setStatus("gps");
    } catch (err: any) {
      console.error("GPS Request Failed:", err);
      if (err?.code === 1 || err?.message?.toLowerCase().includes("denied")) {
        setStatus("permission-denied");
      } else {
        setStatus("error");
      }
    }
  };

  const setManualOrigin = (slug: string) => {
    const manualOrigin = OriginResolver.resolveManualOrigin(slug);
    OriginStore.saveOrigin(manualOrigin);
    setOriginState(manualOrigin);
    setStatus("manual");
    setUnsupportedAreaName(null);
    setUnsupportedAreaSlug(null);
  };

  const clearOrigin = () => {
    OriginStore.clearOrigin();
    setOriginState(null);
    setStatus("idle");
    setUnsupportedAreaName(null);
    setUnsupportedAreaSlug(null);
  };

  const resetStatus = () => {
    setStatus("idle");
    setUnsupportedAreaName(null);
    setUnsupportedAreaSlug(null);
  };

  return (
    <OriginContext.Provider
      value={{
        origin,
        status,
        requestCurrentLocation,
        setManualOrigin,
        clearOrigin,
        unsupportedAreaName,
        unsupportedAreaSlug,
        resetStatus,
      }}
    >
      {children}
    </OriginContext.Provider>
  );
}

export function useOrigin() {
  const context = useContext(OriginContext);
  if (!context) {
    throw new Error("useOrigin must be used within an OriginProvider");
  }
  return context;
}
