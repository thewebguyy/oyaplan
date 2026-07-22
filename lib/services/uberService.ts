/**
 * Uber Service helper for OyaPlan
 * Handles Uber Universal Deep Links and ride destination formatting.
 */

export interface UberRideOptions {
  latitude: number;
  longitude: number;
  venueName: string;
  pickupArea?: string;
}

/**
 * Generates an Uber Universal Link that opens the Uber app on iOS/Android
 * with destination pre-populated.
 */
export function getUberRideDeepLink(options: UberRideOptions): string {
  const { latitude, longitude, venueName } = options;
  const baseUrl = "https://m.uber.com/ul/";

  const params = new URLSearchParams({
    action: "setPickup",
    "dropoff[latitude]": String(latitude),
    "dropoff[longitude]": String(longitude),
    "dropoff[nickname]": venueName,
  });

  return `${baseUrl}?${params.toString()}`;
}
