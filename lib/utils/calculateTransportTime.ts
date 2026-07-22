import { LocationService } from "@/lib/services/LocationService";

export interface TransportTimeEstimate {
  distanceKm: number;
  estimatedMinutes: number;
  confidence: "high" | "medium" | "low";
  displayCopy: string;
}

const AREA_CENTERS: Record<string, { lat: number; lng: number }> = {
  lekki: { lat: 6.4474, lng: 3.4723 },
  "lekki-phase-1": { lat: 6.4474, lng: 3.4723 },
  yaba: { lat: 6.5095, lng: 3.3711 },
  ikeja: { lat: 6.6018, lng: 3.3515 },
  vi: { lat: 6.4281, lng: 3.4219 },
  ikoyi: { lat: 6.4549, lng: 3.4347 },
  surulere: { lat: 6.4969, lng: 3.354 },
};

export function calculateTransportTime(
  fromArea: string | undefined | null,
  toVenueCoordinates?: { lat: number; lng: number } | null
): TransportTimeEstimate {
  if (!fromArea || !toVenueCoordinates) {
    return {
      distanceKm: 0,
      estimatedMinutes: 0,
      confidence: "low",
      displayCopy: "🚗 Standard Lagos ride estimate",
    };
  }

  const normalizedArea = fromArea.toLowerCase().trim();
  const fromCoords = AREA_CENTERS[normalizedArea] || AREA_CENTERS["lekki"];

  const distanceKm = LocationService.calculateDistance(fromCoords, toVenueCoordinates);

  const now = new Date();
  const hour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
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
