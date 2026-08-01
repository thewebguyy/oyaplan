import { StorageEnvelope } from "../location/OriginPolicy";
import { Origin } from "../location/types";

const STORAGE_KEY = "oyaplan_origin_envelope";

export class OriginStore {
  static saveOrigin(origin: Origin): void {
    if (typeof window === "undefined") return;
    try {
      const envelope: StorageEnvelope = {
        origin,
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    } catch {
      // Ignore localStorage restrictions
    }
  }

  static loadOrigin(): StorageEnvelope | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as StorageEnvelope;
    } catch {
      return null;
    }
  }

  static clearOrigin(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore localStorage restrictions
    }
  }
}
