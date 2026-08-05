"use client";

import React, { createContext, useContext, useState } from "react";
import { Origin, LocationStatus } from "./types";
import { OriginStore } from "../storage/OriginStore";
import { OriginPolicy } from "./OriginPolicy";
import { BrowserLocationService, LocationService } from "./LocationService";

export interface OriginContextType {
  origin: Origin | null;
  status: LocationStatus;
  requestCurrentLocation(): Promise<void>;
  setManualOrigin(slug: string): void;
  clearOrigin(): void;
  resetStatus(): void;
}

const OriginContext = createContext<OriginContextType | undefined>(undefined);

export function OriginProvider({ children }: { children: React.ReactNode }) {
  const [initialData] = useState(() => {
    if (typeof window === "undefined") return { origin: null, status: "idle" as LocationStatus };
    const envelope = OriginStore.loadOrigin();
    if (OriginPolicy.isValid(envelope)) {
      return {
        origin: envelope!.origin,
        status: envelope!.origin.source === "gps" ? ("gps" as LocationStatus) : ("manual" as LocationStatus)
      };
    } else {
      OriginStore.clearOrigin();
      return { origin: null, status: "idle" as LocationStatus };
    }
  });

  const [origin, setOriginState] = useState<Origin | null>(initialData.origin);
  const [status, setStatus] = useState<LocationStatus>(initialData.status);

  const requestCurrentLocation = async () => {
    setStatus("locating");
    try {
      const coords = await BrowserLocationService.getCurrentCoordinates();
      const resolution = LocationService.resolve(coords);

      if (resolution.status === "outside-service-area") {
        setStatus("unsupported");
        return;
      }

      OriginStore.saveOrigin(resolution.origin);
      setOriginState(resolution.origin);
      setStatus("gps");
    } catch (err: unknown) {
      console.error("GPS Request Failed:", err);
      const geolocationErr = err as GeolocationPositionError;
      if (geolocationErr?.code === 1) {
        setStatus("permission-denied");
      } else {
        setStatus("error");
      }
    }
  };

  const setManualOrigin = (slug: string) => {
    const manualOrigin = LocationService.resolveManualOrigin(slug);
    OriginStore.saveOrigin(manualOrigin);
    setOriginState(manualOrigin);
    setStatus("manual");
  };

  const clearOrigin = () => {
    OriginStore.clearOrigin();
    setOriginState(null);
    setStatus("idle");
  };

  const resetStatus = () => {
    setStatus("idle");
  };

  return (
    <OriginContext.Provider
      value={{
        origin,
        status,
        requestCurrentLocation,
        setManualOrigin,
        clearOrigin,
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
