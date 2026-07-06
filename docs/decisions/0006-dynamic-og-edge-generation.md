# ADR 0004: Dynamic Open Graph Edge Generation

## Status
Accepted

## Context
OyaPlan's primary growth engine relies on organic WhatsApp sharing (the Virality Loop). When users paste a plan link into a group chat, standard generic metadata does not convey the value of the platform. We need every shared plan to dynamically unfurl an image detailing the Spot Name, the Vibe, and the exact Total Landed Cost.

## Decision
We will use `@vercel/og` (via Next.js `ImageResponse`) running on the Edge runtime (`export const runtime = 'edge'`) for the `/api/og/plan/route.tsx` endpoint.
1. The endpoint fetches the specific `shared_plans` data directly from Supabase.
2. It dynamically renders the image using HTML/CSS logic on the Edge network.

## Alternatives Considered
- **Pre-generating images via a worker/Lambda**: Rejected due to high storage costs and latency.
- **Client-side HTML-to-Canvas**: Rejected because WhatsApp and Twitter scrapers cannot execute client-side JavaScript to generate Open Graph images.

## Consequences
- **Positive**: Zero storage footprint for millions of unique images.
- **Positive**: Sub-100ms latency globally due to Vercel's Edge network.
- **Negative**: Edge functions have strict module limits (e.g., standard Node.js modules are unavailable). We must use lightweight Supabase clients (`@supabase/supabase-js`) within the Edge environment.

## Future Review Trigger
If Edge invocation costs spiral out of control during high viral growth, we may need to introduce aggressive CDN caching (e.g., `Cache-Control: public, max-age=86400, stale-while-revalidate=43200`) for the OG images, assuming prices do not fluctuate rapidly on the hourly level.
