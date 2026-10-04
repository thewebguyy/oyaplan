/**
 * Lightweight, safe haptic feedback utility for mobile and touch interactions.
 * Respects navigator.vibrate and user's reduced-motion preference.
 */
export function triggerHaptic(type: "light" | "medium" | "heavy" | "selection" = "light") {
  if (typeof window === "undefined") return;

  // Respect user's prefers-reduced-motion setting
  try {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
  } catch {
    // Ignore media query errors in test/unsupported environments
  }

  // Check if navigator.vibrate is supported
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      switch (type) {
        case "light":
        case "selection":
          navigator.vibrate(8);
          break;
        case "medium":
          navigator.vibrate(18);
          break;
        case "heavy":
          navigator.vibrate(30);
          break;
      }
    } catch {
      // Safe no-op on platforms that block vibrate
    }
  }
}
