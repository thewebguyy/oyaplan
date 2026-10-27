import * as Sentry from "@sentry/nextjs";

import { sanitizeSentryEvent, sanitizeSentryBreadcrumb } from "@/lib/sentry/privacySanitizer";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0,
    beforeSend: sanitizeSentryEvent,
    beforeBreadcrumb: sanitizeSentryBreadcrumb,
  });
}

