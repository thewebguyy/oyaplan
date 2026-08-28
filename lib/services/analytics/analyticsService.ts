import { z } from 'zod';
import { EventSchemas, EventName, AnalyticsPayload } from './types';
import { AnalyticsProvider, SupabaseProvider } from './providers';

// The routing pipeline
const providers: AnalyticsProvider[] = [
  new SupabaseProvider()
  // new PostHogProvider() // Add external vendors here later
];

/**
 * PII Privacy Scrubber
 * Recursively removes sensitive data before analytics ingestion.
 */
function scrubPII<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(item => scrubPII(item)) as unknown as T;
  } else if (obj !== null && typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    const scrubbed: Record<string, unknown> = {};
    const piiKeys = ['email', 'phone', 'password', 'token', 'lat', 'lng', 'coordinates', 'address', 'card_number'];
    
    for (const key of Object.keys(record)) {
      if (piiKeys.some(pii => key.toLowerCase().includes(pii))) {
        scrubbed[key] = '[REDACTED_PII]';
      } else {
        scrubbed[key] = scrubPII(record[key]);
      }
    }
    return scrubbed as unknown as T;
  }
  return obj;
}

export class AnalyticsService {
  /**
   * Validates and dispatches an event to all providers.
   */
  static async track<T extends EventName>(
    eventName: T,
    payload: Omit<AnalyticsPayload<T>, 'event_name'>,
    userId?: string
  ): Promise<void> {
    try {
      // 1. Strict Server-Side Zod Validation
      const schema = EventSchemas[eventName];
      if (!schema) throw new Error(`Unknown event name: ${eventName}`);
      
      const validatedProps = schema.parse(payload.properties) as z.infer<(typeof EventSchemas)[T]>;

      // 2. Build full payload
      const fullPayload: AnalyticsPayload<T> = {
        session_id: payload.session_id,
        event_name: eventName,
        properties: validatedProps,
        feature_flags: payload.feature_flags || {},
        experiments: payload.experiments || {},
        client_context: payload.client_context
      };

      // 3. Privacy Scrubbing
      const safePayload = scrubPII(fullPayload);

      // 4. Concurrent Provider Dispatch
      await Promise.all(
        providers.map(p => p.track(safePayload, userId).catch(err => {
          console.error(`Analytics Provider Failure (${p.constructor.name}):`, err instanceof Error ? err.message : String(err));
        }))
      );
    } catch (err: unknown) {
      // Analytics failures must NEVER crash the user flow
      console.error(`Analytics validation failed for ${eventName}:`, err instanceof Error ? err.message : String(err));
    }
  }

  static async alias(userId: string, anonymousId: string): Promise<void> {
    await Promise.all(
      providers.map(p => p.alias(userId, anonymousId).catch(console.error))
    );
  }
}
