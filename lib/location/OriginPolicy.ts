import { Origin } from "./types";

export interface StorageEnvelope {
  origin: Origin;
  savedAt: number;
}

export class OriginPolicy {
  static isValid(envelope: StorageEnvelope | null): boolean {
    if (!envelope || !envelope.origin || !envelope.origin.displayArea) return false;
    
    if (envelope.origin.source === "gps") {
      const elapsed = Date.now() - envelope.savedAt;
      const oneDayMs = 24 * 60 * 60 * 1000;
      return elapsed <= oneDayMs;
    }
    
    return true; // Manual never expires
  }
}
