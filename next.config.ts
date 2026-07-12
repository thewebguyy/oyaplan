import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase project storage (replace <project-ref> if it differs)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Fallback for any other storage bucket pattern used in spot.image_url
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

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
