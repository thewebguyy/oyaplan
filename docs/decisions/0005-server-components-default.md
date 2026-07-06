# ADR 0003: Server Components Default

## Status
Accepted

## Context
OyaPlan targets users in African megacities (e.g., Lagos) where mobile internet connections can be volatile and device processing power varies wildly. Sending massive JavaScript bundles to the client to render the UI will severely harm the user experience, particularly for the core funnel (Landing -> Forge -> Results).

## Decision
We mandate the strict usage of React Server Components (Next.js App Router).
1. Every component is a Server Component by default.
2. The `"use client"` directive is strictly reserved for the absolute lowest leaves in the component tree where interactivity (e.g., `onClick`, `useState`, animations) is explicitly required.

## Alternatives Considered
- **Client-Side SPA (Create React App / Vite)**: Rejected due to abysmal SEO, massive JS bundle sizes, and slow time-to-interactive on low-end devices.

## Consequences
- **Positive**: Blazing fast initial page loads. Excellent SEO.
- **Positive**: Secure backend data access directly from components without exposing API routes.
- **Negative**: Increased cognitive load for engineers determining where the server/client boundary exists.

## Future Review Trigger
Review if a massive highly-interactive dashboard (e.g., a complex map view) becomes the primary interface, which might necessitate a heavier client-side architecture for that specific route.
