import { PLANNING_AREAS } from "@/lib/location/data/lagos_locations";

export interface Location {
  id: string;
  name: string;
  area: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  alias: string[];
}

export interface UserLocation {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: "home" | "work" | "current" | "saved";
  savedAt?: number;
}

export interface Venue {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  [key: string]: unknown;
}

export interface AreaDistance {
  fromArea: Location;
  toVenue: Venue;
  distanceKm: number;
  estimatedMinutes: number;
}

const STORAGE_KEY = "oyaplan_user_location";

// Consumed from the canonical data file — do not duplicate coordinates here.
const VERIFIED_AREAS: Location[] = PLANNING_AREAS.map((a) => ({
  id: a.id,
  name: a.name,
  area: a.name,
  coordinates: a.coordinates,
  alias: a.alias,
}));

export class LocationService {
  // 1. Get active planning areas (beta-gated — excludes areas with active: false)
  static getVerifiedAreas(): Location[] {
    return VERIFIED_AREAS
      .filter((a) => {
        const source = PLANNING_AREAS.find((pa) => pa.id === a.id);
        return source?.active !== false;
      })
      .map((a) => ({ ...a, alias: [...a.alias] }));
  }

  // 1b. Get ALL planning areas including inactive (for transport calculations)
  static getAllAreas(): Location[] {
    return VERIFIED_AREAS.map((a) => ({ ...a, alias: [...a.alias] }));
  }

  // 2. Search areas by name or alias and deduplicate by canonical id
  static searchAreas(query: string): Location[] {
    const q = (query || "").trim().toLowerCase();
    if (!q) return this.getVerifiedAreas();

    const matchedIds = new Set<string>();
    const results: Location[] = [];

    for (const area of VERIFIED_AREAS) {
      const nameMatch = area.name.toLowerCase().includes(q);
      const idMatch = area.id.toLowerCase().includes(q);
      const aliasMatch = area.alias.some((a) => a.toLowerCase().includes(q));

      if (nameMatch || idMatch || aliasMatch) {
        if (!matchedIds.has(area.id)) {
          matchedIds.add(area.id);
          results.push(area);
        }
      }
    }

    return results;
  }

  // 3. Get user's current location via geolocation API
  static async getCurrentLocation(): Promise<UserLocation | null> {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({
            id: `current-${Date.now()}`,
            name: "Current Location",
            coordinates: {
              lat: latitude,
              lng: longitude,
            },
            type: "current",
            savedAt: Date.now(),
          });
        },
        () => {
          resolve(null);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // 4. Calculate Haversine distance between two coordinates in km
  static calculateDistance(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(to.lat - from.lat);
    const dLng = this.toRadians(to.lng - from.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.lat)) *
        Math.cos(this.toRadians(to.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Number(distance.toFixed(2));
  }

  // 5. Get nearest verified area to given user location
  static getNearestArea(userLocation: UserLocation): Location {
    const areas = this.getVerifiedAreas();
    let nearest = areas[0];
    let minDistance = Infinity;

    for (const area of areas) {
      const dist = this.calculateDistance(
        userLocation.coordinates,
        area.coordinates
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = area;
      }
    }

    return nearest;
  }

  // 6. Validate area exists in verified list by canonical ID, name, or alias
  static isValidArea(areaId: string): boolean {
    if (!areaId) return false;
    const normalized = areaId.trim().toLowerCase();
    return VERIFIED_AREAS.some(
      (a) =>
        a.id.toLowerCase() === normalized ||
        a.name.toLowerCase() === normalized ||
        a.alias.some((al) => al.toLowerCase() === normalized)
    );
  }

  // 7. Save user's favorite location
  static saveUserLocation(location: UserLocation): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    } catch {
      // Ignore storage write errors (e.g. incognito constraints)
    }
  }

  // 8. Retrieve saved user location
  static getUserLocation(): UserLocation | null {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
