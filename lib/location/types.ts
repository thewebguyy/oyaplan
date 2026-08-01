export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Origin {
  gpsCoordinates?: Coordinates;
  planningAreaSlug: string;
  source: "gps" | "manual";
  resolvedName: string;
}

export type LocationStatus =
  | "idle"
  | "locating"
  | "gps"
  | "manual"
  | "permission-denied"
  | "unsupported"
  | "error";
