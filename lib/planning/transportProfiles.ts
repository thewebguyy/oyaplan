export type TransportMode = "ride-hailing" | "public-transit" | "driving";

export interface TransportProfile {
  id: TransportMode;
  label: string;
  shortLabel: string;
  icon: string;
  multiplier: number;
  variancePercent: number; // e.g. 0.15 (+/- 15% range)
  assumptionsLabel: string;
}

export const TRANSPORT_PROFILES: Record<TransportMode, TransportProfile> = {
  "ride-hailing": {
    id: "ride-hailing",
    label: "Ride-hailing (Uber / Bolt)",
    shortLabel: "Ride-hailing",
    icon: "🚗",
    multiplier: 1.0,
    variancePercent: 0.15,
    assumptionsLabel: "Ride-hailing estimate",
  },
  "public-transit": {
    id: "public-transit",
    label: "Public Transit (Danfo / BRT)",
    shortLabel: "Danfo / BRT",
    icon: "🚌",
    multiplier: 0.28,
    variancePercent: 0.20,
    assumptionsLabel: "Public transport estimate (BRT/Danfo)",
  },
  driving: {
    id: "driving",
    label: "Personal Driving (Fuel & Parking)",
    shortLabel: "Personal Car",
    icon: "🚘",
    multiplier: 0.40,
    variancePercent: 0.15,
    assumptionsLabel: "Personal driving fuel & parking estimate",
  },
};

export function getTransportProfile(mode: TransportMode = "ride-hailing"): TransportProfile {
  return TRANSPORT_PROFILES[mode] || TRANSPORT_PROFILES["ride-hailing"];
}
