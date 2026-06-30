import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {};

// withSentryConfig wraps the build pipeline for source map upload.
// When SENTRY_AUTH_TOKEN is absent, upload is skipped silently.
// SDK error capture via instrumentation.ts works independently of this wrapper.
export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
