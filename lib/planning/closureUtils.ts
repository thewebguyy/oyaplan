export interface VenueClosureDetails {
  is_temporarily_closed?: boolean | null;
  temporary_closure_start?: string | null; // ISO date/string e.g. "2026-09-20"
  temporary_closure_end?: string | null;   // ISO date/string e.g. "2026-10-01"
  temporary_closure_reason?: string | null;
}

export interface ClosureEvaluation {
  isClosed: boolean;
  reason: string | null;
  startDate: string | null;
  endDate: string | null;
  explanation: string;
}

/**
 * Evaluates whether a venue is currently closed relative to a target date.
 * 
 * Rules:
 * 1. If not marked temporarily closed -> Open.
 * 2. If temporary_closure_end is in the past relative to targetDate -> Open (closure has expired).
 * 3. If temporary_closure_start is in the future relative to targetDate -> Open today (upcoming closure).
 * 4. Otherwise, if targetDate falls within the window (or window bounds are open/null) -> Closed.
 */
export function evaluateVenueClosure(
  venue: VenueClosureDetails,
  targetDate: Date | string = new Date()
): ClosureEvaluation {
  if (!venue.is_temporarily_closed) {
    return {
      isClosed: false,
      reason: null,
      startDate: null,
      endDate: null,
      explanation: 'Venue is currently open.'
    };
  }

  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const targetTime = Number.isNaN(target.getTime()) ? Date.now() : target.getTime();

  // Normalize target to midnight UTC for date-only comparisons if time isn't critical
  const startDate = venue.temporary_closure_start ? new Date(venue.temporary_closure_start) : null;
  const endDate = venue.temporary_closure_end ? new Date(venue.temporary_closure_end) : null;

  const startTime = startDate && !Number.isNaN(startDate.getTime()) ? startDate.getTime() : null;
  // If end date is specified as a day (e.g. 2026-09-25), closure is typically active through the end of that day.
  // We add 23:59:59 if it was a plain YYYY-MM-DD string to avoid premature reopening on the end date itself.
  let endTime: number | null = null;
  if (endDate && !Number.isNaN(endDate.getTime())) {
    if (venue.temporary_closure_end?.length === 10) {
      // YYYY-MM-DD format
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      endTime = endOfDay.getTime();
    } else {
      endTime = endDate.getTime();
    }
  }

  // Check if closure has already expired
  if (endTime !== null && targetTime > endTime) {
    return {
      isClosed: false,
      reason: venue.temporary_closure_reason ?? null,
      startDate: venue.temporary_closure_start ?? null,
      endDate: venue.temporary_closure_end ?? null,
      explanation: 'Scheduled temporary closure has passed; venue is considered reopened.'
    };
  }

  // Check if closure is scheduled for the future
  if (startTime !== null && targetTime < startTime) {
    return {
      isClosed: false,
      reason: venue.temporary_closure_reason ?? null,
      startDate: venue.temporary_closure_start ?? null,
      endDate: venue.temporary_closure_end ?? null,
      explanation: `Venue is open today. Scheduled closure begins on ${venue.temporary_closure_start}.`
    };
  }

  // Active closure
  const reasonText = venue.temporary_closure_reason ? `: ${venue.temporary_closure_reason}` : '';
  const untilText = venue.temporary_closure_end ? ` until ${venue.temporary_closure_end}` : '';

  return {
    isClosed: true,
    reason: venue.temporary_closure_reason ?? null,
    startDate: venue.temporary_closure_start ?? null,
    endDate: venue.temporary_closure_end ?? null,
    explanation: `Temporarily closed${untilText}${reasonText}`
  };
}

/**
 * Convenience boolean helper for candidate filtering and consumer guards.
 */
export function isVenueCurrentlyClosed(
  venue: VenueClosureDetails,
  targetDate: Date | string = new Date()
): boolean {
  return evaluateVenueClosure(venue, targetDate).isClosed;
}
