"use client";

import { useMemo } from "react";
import { UserLocation } from "@/lib/services/LocationService";
import { LocationService } from "@/lib/location/LocationService";
import { getTemporaryTransportEstimate, TransportZone } from "@/lib/planning/temporaryTransport";

export interface TransportEstimate {
  distanceKm: number;
  estimatedCost: number; // ₦ amount per person
  provider: "zone-estimate" | "uber";
  squadSize: number;
  roundTrip: boolean;
  zone: TransportZone;
  totalOutingTransport: number;
  disclaimer: string;
}

export interface UseTransportCostOptions {
  userLocation: UserLocation | null;
  venueLocation: { lat: number; lng: number } | null | undefined;
  squadSize?: number;
  roundTrip?: boolean;
}

export function useTransportCost(options: UseTransportCostOptions) {
  const squadSize = Math.max(1, options.squadSize ?? 1);
  const roundTrip = options.roundTrip ?? true;
  const { userLocation, venueLocation } = options;

  const estimate = useMemo<TransportEstimate | null>(() => {
    if (!userLocation || !venueLocation) {
      return null;
    }

    const destinationArea = LocationService.getClosestPlanningArea(venueLocation);
    const tempEstimate = getTemporaryTransportEstimate(destinationArea.id);
    const totalOutingTransport = tempEstimate.cost;
    const costPerPerson = Math.ceil(totalOutingTransport / squadSize);

    return {
      distanceKm: 0,
      estimatedCost: costPerPerson,
      provider: "zone-estimate",
      squadSize,
      roundTrip,
      zone: tempEstimate.zone,
      totalOutingTransport,
      disclaimer: tempEstimate.disclaimer,
    };
  }, [userLocation, venueLocation, squadSize, roundTrip]);

  return { estimate, loading: false, error: null };
}
