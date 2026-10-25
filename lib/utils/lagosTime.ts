/**
 * Lagos wall-clock helpers.
 *
 * Peak / off-peak transport classification is a statement about Lagos traffic,
 * so it must be evaluated in `Africa/Lagos` (WAT, UTC+1, no DST) and never in
 * the host's timezone. Server hosts (e.g. Vercel) run in UTC, and browsers run
 * in whatever zone the user is in; `Date#getHours()` / `getDay()` would give a
 * different answer in each of those places.
 */

export const LAGOS_TIME_ZONE = 'Africa/Lagos';

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const lagosFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: LAGOS_TIME_ZONE,
  hourCycle: 'h23',
  hour: 'numeric',
  weekday: 'short',
});

export interface LagosTimeParts {
  /** Lagos local hour, 0-23. */
  hour: number;
  /** Lagos local day of week, 0 (Sunday) - 6 (Saturday). */
  day: number;
  isWeekend: boolean;
}

/**
 * Returns the Lagos-local hour and weekday for an instant.
 * An invalid Date is treated as "now" rather than throwing, so a malformed
 * `departureAt` query param can never crash a planning request.
 */
export function getLagosTimeParts(date: Date = new Date()): LagosTimeParts {
  const instant = Number.isNaN(date.getTime()) ? new Date() : date;

  let hour = 0;
  let day = 0;
  for (const part of lagosFormatter.formatToParts(instant)) {
    if (part.type === 'hour') hour = parseInt(part.value, 10) % 24;
    if (part.type === 'weekday') day = WEEKDAY_INDEX[part.value] ?? 0;
  }

  return { hour, day, isWeekend: day === 0 || day === 6 };
}

/**
 * Weekday rush hour in Lagos: Mon-Fri 07:00-10:59 and 16:00-20:59 WAT.
 * (Matches the long-standing `hour >= 7 && hour <= 10` / `16..20` rule.)
 */
export function isLagosWeekdayRushHour(date: Date = new Date()): boolean {
  const { hour, isWeekend } = getLagosTimeParts(date);
  return !isWeekend && ((hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 20));
}
