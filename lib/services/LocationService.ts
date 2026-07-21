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

export class LocationService {
  // 1. Get all verified areas
  static getVerifiedAreas(): Location[] {
    return [
      {
        id: "lekki",
        name: "Lekki",
        area: "Lekki",
        coordinates: { lat: 6.4474, lng: 3.4723 },
        alias: ["Lekki", "Lekki Phase 1", "Lekki 1"],
      },
      {
        id: "yaba",
        name: "Yaba",
        area: "Yaba",
        coordinates: { lat: 6.5095, lng: 3.3711 },
        alias: ["Yaba", "Yaba Left", "Akoka"],
      },
      {
        id: "ikeja",
        name: "Ikeja",
        area: "Ikeja",
        coordinates: { lat: 6.6018, lng: 3.3515 },
        alias: ["Ikeja", "Allen", "GRA Ikeja"],
      },
      {
        id: "vi",
        name: "VI",
        area: "VI",
        coordinates: { lat: 6.4281, lng: 3.4219 },
        alias: ["VI", "Victoria Island"],
      },
      {
        id: "ikoyi",
        name: "Ikoyi",
        area: "Ikoyi",
        coordinates: { lat: 6.4549, lng: 3.4347 },
        alias: ["Ikoyi", "Banana Island"],
      },
      {
        id: "surulere",
        name: "Surulere",
        area: "Surulere",
        coordinates: { lat: 6.4969, lng: 3.354 },
        alias: ["Surulere", "Ojuelegba"],
      },
    ];
  }

  // 2. Search areas by name or alias
  static searchAreas(query: string): Location[] {
    if (!query || query.trim() === "") return this.getVerifiedAreas();
    const normalized = query.trim().toLowerCase();
    return this.getVerifiedAreas().filter(
      (loc) =>
        loc.name.toLowerCase().includes(normalized) ||
        loc.area.toLowerCase().includes(normalized) ||
        loc.alias.some((a) => a.toLowerCase().includes(normalized))
    );
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

  // 6. Validate area exists in verified list
  static isValidArea(areaId: string): boolean {
    return this.getVerifiedAreas().some((a) => a.id === areaId);
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
