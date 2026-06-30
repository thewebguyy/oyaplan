import * as Sentry from "@sentry/nextjs";

/**
 * Returns true for errors thrown by Next.js redirect() and notFound().
 * These are control-flow mechanisms, not real exceptions.
 */
function isNextjsControlFlowError(e: unknown): boolean {
  if (typeof e !== "object" || e === null) return false;
  const digest = (e as { digest?: string }).digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND"))
  );
}

/**
 * Captures an unexpected server-side exception in Sentry.
 * Re-throws Next.js control-flow errors (redirect, notFound) unchanged
 * so the framework can handle them normally.
 * Is a no-op when SENTRY_DSN is not configured.
 */
export function captureServerException(e: unknown): void {
  if (isNextjsControlFlowError(e)) throw e;
  Sentry.captureException(e);
}
