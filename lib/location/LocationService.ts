import { Coordinates, Origin, LocationResolution } from "./types";
import { PLANNING_AREAS, DISPLAY_LOCATIONS, PlanningArea } from "./data/lagos_locations";
import { LocationService as LocationDataService } from "@/lib/services/LocationService";

/**
 * Maximum distance in km before a user is considered outside the Lagos service area.
 * This is a named business rule — do not bury it as a magic number.
 */
const MAX_SUPPORTED_DISTANCE_KM = 50;

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
            lng: position.coords.longitude,
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

/**
 * Resolves GPS coordinates into display locations and planning areas.
 * These two concerns are intentionally independent:
 * - displayArea tells the UI where the user actually is (e.g. "Ikorodu")
 * - planningAreaSlug tells the engine which dataset to use (e.g. "ikeja")
 */
export class LocationService {
  /**
   * Resolve GPS coordinates into a full LocationResolution.
   * Returns "outside-service-area" if the user is more than 50km from any
   * known Lagos neighborhood — never silently snaps to a wrong location.
   */
  static resolve(coordinates: Coordinates): LocationResolution {
    // 1. Find the closest display location (honest neighborhood name)
    const displayLocation = this.closestDisplayLocation(coordinates);
    const distanceToDisplay = LocationDataService.calculateDistance(
      coordinates,
      displayLocation.coordinates
    );

    // 2. Bail if outside Lagos service area entirely
    if (distanceToDisplay > MAX_SUPPORTED_DISTANCE_KM) {
      return { status: "outside-service-area" };
    }

    // 3. Find the closest planning area for the engine
    const planningArea = this.getClosestPlanningArea(coordinates);

    return {
      status: "supported",
      origin: {
        source: "gps",
        gpsCoordinates: coordinates,
        displayArea: { slug: displayLocation.slug, name: displayLocation.name },
        planningAreaSlug: planningArea.id,
      },
    };
  }

  /**
   * Build a manual Origin from an area slug (user chip selection).
   * Display area and planning area are the same for manual selections.
   */
  static resolveManualOrigin(areaSlug: string): Origin {
    const normalized = areaSlug.trim().toLowerCase();
    const matched =
      PLANNING_AREAS.find(
        (a) =>
          a.id.toLowerCase() === normalized ||
          a.name.toLowerCase() === normalized ||
          a.alias.some((al) => al.toLowerCase() === normalized)
      ) || PLANNING_AREAS[0];

    return {
      source: "manual",
      planningAreaSlug: matched.id,
      displayArea: { slug: matched.id, name: matched.name },
    };
  }

  /**
   * Returns the closest planning area to the given coordinates.
   * Always returns a result — used by MatrixTravelEstimator for zone fare lookup.
   */
  static getClosestPlanningArea(coordinates: Coordinates): PlanningArea {
    let nearest = PLANNING_AREAS[0];
    let minDistance = Infinity;

    for (const area of PLANNING_AREAS) {
      const dist = LocationDataService.calculateDistance(coordinates, area.coordinates);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = area;
      }
    }
    return nearest;
  }

  private static closestDisplayLocation(coordinates: Coordinates) {
    let nearest = DISPLAY_LOCATIONS[0];
    let minDistance = Infinity;

    for (const loc of DISPLAY_LOCATIONS) {
      const dist = LocationDataService.calculateDistance(coordinates, loc.coordinates);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = loc;
      }
    }
    return nearest;
  }
}
