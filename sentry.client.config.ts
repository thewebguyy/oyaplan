import * as Sentry from "@sentry/nextjs";

import { sanitizeSentryEvent, sanitizeSentryBreadcrumb } from "@/lib/sentry/privacySanitizer";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend: sanitizeSentryEvent,
    beforeBreadcrumb: sanitizeSentryBreadcrumb,
  });
}
