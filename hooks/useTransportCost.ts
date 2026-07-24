"use client";

import { useMemo } from "react";
import { LocationService, UserLocation } from "@/lib/services/LocationService";

export interface TransportEstimate {
  distanceKm: number;
  estimatedCost: number; // ₦ amount per person
  provider: "uber";
  squadSize: number;
  roundTrip: boolean;
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

    const distanceKm = LocationService.calculateDistance(
      userLocation.coordinates,
      venueLocation
    );

    const baseTripCost = estimateTransportFallback(distanceKm);
    const totalTripCost = roundTrip ? baseTripCost * 2 : baseTripCost;
    const costPerPerson = Math.ceil(totalTripCost / squadSize);

    return {
      distanceKm,
      estimatedCost: costPerPerson,
      provider: "uber",
      squadSize,
      roundTrip,
    };
  }, [userLocation, venueLocation, squadSize, roundTrip]);

  return { estimate, loading: false, error: null };
}

function estimateTransportFallback(distanceKm: number): number {
  const baseRate = 150;
  const minimumRate = 500;
  
  // Lagos peak traffic multiplier (7-9 AM & 5-8 PM West Africa Time)
  const currentHour = new Date().getHours();
  const isPeakHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 20);
  const multiplier = isPeakHour ? 1.3 : 1.0;

  const costPerKm = Math.max(distanceKm * baseRate * multiplier, minimumRate);
  return Math.ceil(costPerKm);
}
