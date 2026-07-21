"use client";

import { useState, useEffect, useCallback } from "react";
import { LocationService, UserLocation } from "@/lib/services/LocationService";

export interface TransportEstimate {
  distanceKm: number;
  estimatedCost: number; // ₦ amount per person
  provider: "bolt";
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
  const [estimate, setEstimate] = useState<TransportEstimate | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const squadSize = Math.max(1, options.squadSize ?? 1);
  const roundTrip = options.roundTrip ?? true;
  const { userLocation, venueLocation } = options;

  const calculateTransportCost = useCallback(async () => {
    if (!userLocation || !venueLocation) {
      setEstimate(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);

      const distanceKm = LocationService.calculateDistance(
        userLocation.coordinates,
        venueLocation
      );

      let baseTripCost: number;
      try {
        baseTripCost = await getBoltEstimate({
          from: userLocation.coordinates,
          to: venueLocation,
          passengers: squadSize,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Bolt API unavailable";
        setError(msg);
        baseTripCost = estimateTransportFallback(distanceKm, squadSize);
      }

      const totalTripCost = roundTrip ? baseTripCost * 2 : baseTripCost;
      const costPerPerson = Math.ceil(totalTripCost / squadSize);

      setEstimate({
        distanceKm,
        estimatedCost: costPerPerson,
        provider: "bolt",
        squadSize,
        roundTrip,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Calculation failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userLocation, venueLocation, squadSize, roundTrip]);

  useEffect(() => {
    calculateTransportCost();
  }, [calculateTransportCost]);

  return { estimate, loading, error };
}

function estimateTransportFallback(distanceKm: number, _squadSize: number): number {
  const baseRate = 150;
  const minimumRate = 500;
  
  // Lagos peak traffic multiplier (7-9 AM & 5-8 PM West Africa Time)
  const currentHour = new Date().getHours();
  const isPeakHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 20);
  const multiplier = isPeakHour ? 1.3 : 1.0;

  const costPerKm = Math.max(distanceKm * baseRate * multiplier, minimumRate);
  return Math.ceil(costPerKm);
}

async function getBoltEstimate(_options: {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  passengers: number;
}): Promise<number> {
  // If no live Bolt API integration is set up, fallback estimation will trigger or return baseline mock
  throw new Error("Bolt API integration offline");
}
