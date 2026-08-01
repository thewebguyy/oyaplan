import { Coordinates, Origin } from "./types";
import { LocationService } from "@/lib/services/LocationService";

export class BrowserLocationService {
  static getCurrentCoordinates(): Promise<Coordinates> {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return Promise.reject(new Error("Geolocation not supported by this browser."));
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          reject(err);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  }
}

export class OriginResolver {
  static resolveGPSOrigin(coordinates: Coordinates): Origin {
    const areas = LocationService.getVerifiedAreas();
    let nearest = areas[0];
    let minDistance = Infinity;

    for (const area of areas) {
      const dist = LocationService.calculateDistance(coordinates, area.coordinates);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = area;
      }
    }

    return {
      source: "gps",
      gpsCoordinates: coordinates,
      planningAreaSlug: nearest.id,
      resolvedName: nearest.name
    };
  }

  static resolveManualOrigin(areaSlug: string): Origin {
    const normalized = areaSlug.trim().toLowerCase();
    const areas = LocationService.getVerifiedAreas();
    const matched = areas.find(
      (a) =>
        a.id.toLowerCase() === normalized ||
        a.name.toLowerCase() === normalized ||
        a.alias.some((al) => al.toLowerCase() === normalized)
    ) || areas[0];

    return {
      source: "manual",
      planningAreaSlug: matched.id,
      resolvedName: matched.name
    };
  }
}
