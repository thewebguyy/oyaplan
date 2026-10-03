import { TablePolicy, SeatingType, DayOfWeek, PolicyVerificationStatus } from '../types';

const ALLOWED_SEATING_TYPES: readonly SeatingType[] = [
  'standard',
  'vip_booth',
  'cabana',
  'rooftop',
  'bar_counter',
  'outdoor_terrace',
  'private_dining_room'
] as const;

const ALLOWED_DAYS: readonly DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  'all'
] as const;

const ALLOWED_STATUSES: readonly PolicyVerificationStatus[] = [
  'unverified',
  'owner_submitted',
  'verified'
] as const;

const ALLOWED_SOURCES = ['owner_portal', 'ops_verification', 'receipt_audit'] as const;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const ALLOWED_POLICY_KEYS = new Set([
  'version',
  'id',
  'name',
  'seating_type',
  'minimum_spend',
  'mandatory_bottle_policy',
  'bottle_count_minimum',
  'applicable_days',
  'applicable_start_time',
  'applicable_end_time',
  'min_squad_size',
  'max_squad_size',
  'notes',
  'verification_status',
  'last_verified_at',
  'source'
]);

/**
 * Validates a single TablePolicy object against the authoritative domain contract.
 * Rejects unknown keys, malformed types, or invalid constraints.
 */
export function validateTablePolicy(input: unknown): TablePolicy {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('TablePolicy must be a non-null object.');
  }

  const record = input as Record<string, unknown>;

  // Reject unexpected / unknown fields to prevent silent data corruption
  for (const key of Object.keys(record)) {
    if (!ALLOWED_POLICY_KEYS.has(key)) {
      throw new Error(`TablePolicy contains unauthorized field: "${key}".`);
    }
  }

  if (record.version !== 1) {
    throw new Error(`TablePolicy version must be 1. Received: ${record.version}`);
  }

  if (typeof record.id !== 'string' || record.id.trim().length === 0) {
    throw new Error('TablePolicy "id" must be a non-empty string.');
  }

  if (typeof record.name !== 'string' || record.name.trim().length === 0) {
    throw new Error('TablePolicy "name" must be a non-empty string.');
  }

  if (typeof record.seating_type !== 'string' || !ALLOWED_SEATING_TYPES.includes(record.seating_type as SeatingType)) {
    throw new Error(`Invalid seating_type: "${record.seating_type}". Allowed: ${ALLOWED_SEATING_TYPES.join(', ')}`);
  }

  if (typeof record.minimum_spend !== 'number' || Number.isNaN(record.minimum_spend) || record.minimum_spend < 0) {
    throw new Error('TablePolicy "minimum_spend" must be a non-negative number.');
  }

  if (typeof record.mandatory_bottle_policy !== 'boolean') {
    throw new Error('TablePolicy "mandatory_bottle_policy" must be a boolean.');
  }

  if (record.bottle_count_minimum !== null && (typeof record.bottle_count_minimum !== 'number' || record.bottle_count_minimum < 0)) {
    throw new Error('TablePolicy "bottle_count_minimum" must be null or a non-negative number.');
  }

  if (!Array.isArray(record.applicable_days) || record.applicable_days.length === 0) {
    throw new Error('TablePolicy "applicable_days" must be a non-empty array of days.');
  }

  for (const day of record.applicable_days) {
    if (typeof day !== 'string' || !ALLOWED_DAYS.includes(day as DayOfWeek)) {
      throw new Error(`Invalid day in applicable_days: "${day}". Allowed: ${ALLOWED_DAYS.join(', ')}`);
    }
  }

  if (record.applicable_start_time !== null && (typeof record.applicable_start_time !== 'string' || !TIME_REGEX.test(record.applicable_start_time))) {
    throw new Error('TablePolicy "applicable_start_time" must be null or in "HH:MM" 24h format.');
  }

  if (record.applicable_end_time !== null && (typeof record.applicable_end_time !== 'string' || !TIME_REGEX.test(record.applicable_end_time))) {
    throw new Error('TablePolicy "applicable_end_time" must be null or in "HH:MM" 24h format.');
  }

  if (record.min_squad_size !== null && (typeof record.min_squad_size !== 'number' || record.min_squad_size < 1)) {
    throw new Error('TablePolicy "min_squad_size" must be null or a positive integer.');
  }

  if (record.max_squad_size !== null && (typeof record.max_squad_size !== 'number' || record.max_squad_size < 1)) {
    throw new Error('TablePolicy "max_squad_size" must be null or a positive integer.');
  }

  if (
    typeof record.min_squad_size === 'number' &&
    typeof record.max_squad_size === 'number' &&
    record.max_squad_size < record.min_squad_size
  ) {
    throw new Error(`TablePolicy "max_squad_size" (${record.max_squad_size}) cannot be less than "min_squad_size" (${record.min_squad_size}).`);
  }

  if (record.notes !== null && typeof record.notes !== 'string') {
    throw new Error('TablePolicy "notes" must be null or a string.');
  }

  if (typeof record.verification_status !== 'string' || !ALLOWED_STATUSES.includes(record.verification_status as PolicyVerificationStatus)) {
    throw new Error(`Invalid verification_status: "${record.verification_status}". Allowed: ${ALLOWED_STATUSES.join(', ')}`);
  }

  if (record.last_verified_at !== null && (typeof record.last_verified_at !== 'string' || Number.isNaN(Date.parse(record.last_verified_at)))) {
    throw new Error('TablePolicy "last_verified_at" must be null or a valid ISO timestamp.');
  }

  if (typeof record.source !== 'string' || !ALLOWED_SOURCES.includes(record.source as any)) {
    throw new Error(`Invalid source: "${record.source}". Allowed: ${ALLOWED_SOURCES.join(', ')}`);
  }

  return {
    version: 1,
    id: record.id.trim(),
    name: record.name.trim(),
    seating_type: record.seating_type as SeatingType,
    minimum_spend: Math.round(record.minimum_spend),
    mandatory_bottle_policy: record.mandatory_bottle_policy,
    bottle_count_minimum: record.bottle_count_minimum !== null ? Math.round(record.bottle_count_minimum) : null,
    applicable_days: Array.from(new Set(record.applicable_days as DayOfWeek[])),
    applicable_start_time: record.applicable_start_time ?? null,
    applicable_end_time: record.applicable_end_time ?? null,
    min_squad_size: record.min_squad_size !== null ? Math.round(record.min_squad_size as number) : null,
    max_squad_size: record.max_squad_size !== null ? Math.round(record.max_squad_size as number) : null,
    notes: record.notes ? (record.notes as string).trim() : null,
    verification_status: record.verification_status as PolicyVerificationStatus,
    last_verified_at: record.last_verified_at ?? null,
    source: record.source as 'owner_portal' | 'ops_verification' | 'receipt_audit'
  };
}

/**
 * Validates a list of TablePolicy objects.
 */
export function validateTablePolicies(input: unknown): TablePolicy[] {
  if (!Array.isArray(input)) {
    throw new Error('table_policies must be an array.');
  }
  return input.map((p, idx) => {
    try {
      return validateTablePolicy(p);
    } catch (err: any) {
      throw new Error(`Policy at index ${idx} failed validation: ${err.message}`);
    }
  });
}

export type PolicyEvaluationResult =
  | { status: 'applicable'; policy: TablePolicy }
  | { status: 'not_applicable'; reason: string }
  | { status: 'ambiguous'; candidates: TablePolicy[]; reason: string };

export interface PolicyEvaluationContext {
  date?: Date | string; // outing date
  time?: string;        // "HH:MM" 24h
  squadSize?: number;
  seatingType?: SeatingType;
}

const DAY_NAMES: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Checks if a time "HH:MM" falls within a start and end window,
 * explicitly supporting overnight spans like "20:00" -> "03:00".
 */
export function isTimeInWindow(time: string, start: string | null, end: string | null): boolean {
  if (!start && !end) return true; // No time restriction
  if (start && !end) return time >= start;
  if (!start && end) return time <= end;
  if (!start || !end) return true;

  // Both start and end provided
  if (start <= end) {
    // Normal same-day window e.g. 12:00 -> 18:00
    return time >= start && time <= end;
  }

  // Overnight window e.g. 20:00 -> 03:00
  return time >= start || time <= end;
}

/**
 * Deterministically evaluates applicable TablePolicy given date, time, squad size, and seating type.
 * Never silently chooses among conflicting equally-specific policies.
 */
export function getApplicableTablePolicy(
  policies: TablePolicy[] | null | undefined,
  context: PolicyEvaluationContext
): PolicyEvaluationResult {
  if (!policies || policies.length === 0) {
    return {
      status: 'not_applicable',
      reason: 'No table policies are configured for this venue.'
    };
  }

  let dayOfWeek: DayOfWeek | null = null;
  if (context.date) {
    if (typeof context.date === 'string') {
      const parts = context.date.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const localDate = new Date(year, month, day);
        if (!Number.isNaN(localDate.getTime())) {
          dayOfWeek = DAY_NAMES[localDate.getDay()];
        }
      } else {
        const d = new Date(context.date);
        if (!Number.isNaN(d.getTime())) {
          dayOfWeek = DAY_NAMES[d.getUTCDay()];
        }
      }
    } else if (context.date instanceof Date && !Number.isNaN(context.date.getTime())) {
      dayOfWeek = DAY_NAMES[context.date.getDay()];
    }
  }

  // Filter policies matching basic criteria
  const matchingCandidates = policies.filter((policy) => {
    // 1. Seating type filter
    if (context.seatingType && policy.seating_type !== context.seatingType) {
      return false;
    }

    // 2. Day of week filter
    if (dayOfWeek) {
      const appliesToDay = policy.applicable_days.includes('all') || policy.applicable_days.includes(dayOfWeek);
      if (!appliesToDay) return false;
    }

    // 3. Time filter (including overnight support)
    if (context.time) {
      const inWindow = isTimeInWindow(context.time, policy.applicable_start_time, policy.applicable_end_time);
      if (!inWindow) return false;
    }

    // 4. Squad size filter
    if (typeof context.squadSize === 'number') {
      if (policy.min_squad_size !== null && context.squadSize < policy.min_squad_size) {
        return false;
      }
      if (policy.max_squad_size !== null && context.squadSize > policy.max_squad_size) {
        return false;
      }
    }

    return true;
  });

  if (matchingCandidates.length === 0) {
    return {
      status: 'not_applicable',
      reason: 'No table policy matches the specified outing schedule, squad size, or seating preference.'
    };
  }

  if (matchingCandidates.length === 1) {
    return {
      status: 'applicable',
      policy: matchingCandidates[0]
    };
  }

  // Multiple candidates match. Evaluate specificity:
  // Precedence rule 1: Exact day match > 'all'
  // Precedence rule 2: Time-bounded window > unrestricted window
  // Precedence rule 3: Exact seating type match > standard/default
  const scored = matchingCandidates.map((policy) => {
    let score = 0;
    // Day specificity
    if (dayOfWeek && policy.applicable_days.includes(dayOfWeek) && !policy.applicable_days.includes('all')) {
      score += 10;
    }
    // Time specificity
    if (policy.applicable_start_time !== null || policy.applicable_end_time !== null) {
      score += 5;
    }
    // Seating specificity (if seating type wasn't explicitly requested)
    if (!context.seatingType && policy.seating_type === 'standard') {
      score += 2;
    }
    // Verification weight: verified > owner_submitted > unverified
    if (policy.verification_status === 'verified') score += 1;

    return { policy, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const topScore = scored[0].score;
  const topCandidates = scored.filter((s) => s.score === topScore);

  if (topCandidates.length === 1) {
    return {
      status: 'applicable',
      policy: topCandidates[0].policy
    };
  }

  // If there are multiple candidates with the same score:
  // Check if they are identical in minimum spend and bottle requirements.
  const first = topCandidates[0].policy;
  const allIdentical = topCandidates.every(
    (c) =>
      c.policy.minimum_spend === first.minimum_spend &&
      c.policy.mandatory_bottle_policy === first.mandatory_bottle_policy &&
      c.policy.bottle_count_minimum === first.bottle_count_minimum
  );

  if (allIdentical) {
    return {
      status: 'applicable',
      policy: first
    };
  }

  // Truly ambiguous conflict. Do not manufacture certainty!
  return {
    status: 'ambiguous',
    candidates: topCandidates.map((c) => c.policy),
    reason: `Found ${topCandidates.length} conflicting table policies with identical precedence matching this outing.`
  };
}
