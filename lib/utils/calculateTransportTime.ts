import { LocationService } from "@/lib/services/LocationService";
import { DISPLAY_LOCATIONS } from "@/lib/location/data/lagos_locations";

export interface TransportTimeEstimate {
  distanceKm: number;
  estimatedMinutes: number;
  confidence: "high" | "medium" | "low";
  displayCopy: string;
}

const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  ...Object.fromEntries(
    DISPLAY_LOCATIONS.map((loc) => [loc.slug.toLowerCase(), loc.coordinates])
  ),
  lekki: { lat: 6.4474, lng: 3.4723 },
  "lekki-phase-1": { lat: 6.4474, lng: 3.4723 },
  "victoria-island": { lat: 6.4281, lng: 3.4219 },
  vi: { lat: 6.4281, lng: 3.4219 },
  ogudu: { lat: 6.5786, lng: 3.3916 },
};

export function getAreaCoordinates(areaSlugOrName: string): { lat: number; lng: number } {
  const norm = areaSlugOrName.toLowerCase().trim();
  if (LOCATION_COORDINATES[norm]) {
    return LOCATION_COORDINATES[norm];
  }
  const match = DISPLAY_LOCATIONS.find(
    (l) => l.slug.toLowerCase() === norm || l.name.toLowerCase() === norm
  );
  if (match) {
    return match.coordinates;
  }
  // Central Lagos geographic fallback if entirely unmapped
  return { lat: 6.5095, lng: 3.3711 };
}

export function calculateTransportTime(
  fromArea: string | undefined | null,
  toVenueCoordinates?: { lat: number; lng: number } | null,
  departureAt?: string
): TransportTimeEstimate {
  if (!fromArea || !toVenueCoordinates) {
    return {
      distanceKm: 0,
      estimatedMinutes: 0,
      confidence: "low",
      displayCopy: "🚗 Standard Lagos ride estimate",
    };
  }

  const fromCoords = getAreaCoordinates(fromArea);

  const distanceKm = LocationService.calculateDistance(fromCoords, toVenueCoordinates);

  const d = departureAt ? new Date(departureAt) : new Date();
  const hour = d.getHours();
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const isPeakHour = !isWeekend && ((hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 20));

  const speedKmH = isPeakHour ? 12 : 25;
  const baseMinutes = Math.ceil((distanceKm / speedKmH) * 60);
  const estimatedMinutes = Math.max(5, baseMinutes + 5);

  let confidence: "high" | "medium" | "low";
  if (distanceKm < 3) {
    confidence = "high";
  } else if (distanceKm < 9) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  let displayCopy = "";
  if (confidence === "high") {
    displayCopy = `🚗 ${estimatedMinutes} mins (${distanceKm.toFixed(1)}km, very close)`;
  } else if (confidence === "medium") {
    displayCopy = `🚗 ${estimatedMinutes} mins (${distanceKm.toFixed(1)}km, depends on traffic)`;
  } else {
    displayCopy = `🚗 ${estimatedMinutes}+ mins (${distanceKm.toFixed(1)}km, plan for traffic)`;
  }

  return {
    distanceKm,
    estimatedMinutes,
    confidence,
    displayCopy,
  };
}

export function getConfidenceWarning(confidence: "high" | "medium" | "low"): string {
  switch (confidence) {
    case "high":
      return "✓ Travel distance is very doable";
    case "medium":
      return "⚠️ Travel time depends on traffic";
    case "low":
      return "⚠️ Plan for rush hour traffic delays";
  }
}
