export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Origin {
  source: "gps" | "manual";
  planningAreaSlug: string;
  gpsCoordinates?: Coordinates;
  /**
   * The display location represents where the user actually is, not necessarily
   * which planning area the engine will operate over. These are intentionally
   * independent while OyaPlan's geographic coverage is expanding.
   */
  displayArea: {
    slug: string;
    name: string;
  };
}

/**
 * The result of attempting to resolve GPS coordinates.
 * Use the discriminated union instead of null checks.
 */
export type LocationResolution =
  | { status: "supported"; origin: Origin }
  | { status: "outside-service-area" };

export type LocationStatus =
  | "idle"
  | "locating"
  | "gps"
  | "manual"
  | "permission-denied"
  | "unsupported"
  | "error";
