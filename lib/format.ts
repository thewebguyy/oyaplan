// Deterministic, locale-independent thousands separator for Naira amounts.
// toLocaleString('en-NG') depends on the runtime's ICU locale data, which can
// differ between the server (Vercel's Node/Edge runtime) and the client's
// browser (always full ICU) — a mismatch there is a server/client hydration
// mismatch. This has no Intl dependency, so server and client always agree.
export function formatNaira(amount: number): string {
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
