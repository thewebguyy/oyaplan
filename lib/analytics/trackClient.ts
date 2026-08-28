'use client';

import { z } from 'zod';
import { EventSchemas, EventName } from '@/lib/services/analytics/types';

/**
 * Extracts or generates the persistent anonymous session ID.
 * Reads the secure oya_session_id cookie created by middleware/proxy.
 */
export function getSessionId(): string {
  if (typeof document === 'undefined') {
    return '00000000-0000-0000-0000-000000000000';
  }

  const match = document.cookie.match(/(?:^|; )oya_session_id=([^;]*)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  try {
    let fallback = window.sessionStorage.getItem('oya_session_id');
    if (!fallback) {
      fallback = crypto.randomUUID();
      window.sessionStorage.setItem('oya_session_id', fallback);
    }
    return fallback;
  } catch {
    return '00000000-0000-0000-0000-000000000000';
  }
}

/**
 * Non-blocking client-side analytics event tracker.
 * Dispatches to /api/v1/analytics/track using sendBeacon or keepalive fetch.
 * Analytics failures NEVER crash or interrupt user interactions.
 */
export function trackEvent<T extends EventName>(
  eventName: T,
  properties: z.infer<typeof EventSchemas[T]>
): void {
  if (typeof window === 'undefined') return;

  try {
    const session_id = getSessionId();
    const payload = {
      event_name: eventName,
      session_id,
      properties: { ...properties, version: '1.0' },
      client_context: {
        browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        referrer: document.referrer || undefined
      }
    };

    const serialized = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([serialized], { type: 'application/json' });
      const queued = navigator.sendBeacon('/api/v1/analytics/track', blob);
      if (queued) return;
    }

    fetch('/api/v1/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: serialized,
      keepalive: true
    }).catch(() => {
      // Intentionally silent: never degrade user experience for analytics errors
    });
  } catch (err: unknown) {
    // Failsafe catch for browser environment constraints
    console.debug('Analytics dispatch error:', err);
  }
}
