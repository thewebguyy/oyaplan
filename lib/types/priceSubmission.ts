/**
 * Price Submission Types
 *
 * TypeScript types for price_submissions table.
 * Immutable evidence + mutable moderation metadata.
 *
 * Usage:
 *   const submission: PriceSubmission = { spot_id, user_session_id, total_per_person, ... }
 *   const dto: CreatePriceSubmissionInput = { spotId, totalPerPerson, dateOfSpend }
 */

import { UUID } from 'crypto';

/**
 * PriceSubmission - Complete row from price_submissions table
 *
 * Immutable fields (never UPDATE):
 *   - id, spot_id, user_session_id
 *   - total_per_person, date_of_spend, created_at
 *   - food_cost, drink_cost, transport_cost, squad_size (immutable once set)
 *   - source, source_id
 *
 * Mutable fields (admin workflow):
 *   - status (pending → approved | rejected)
 *   - rejection_reason (null → reason string, for learning)
 *   - reviewed_at (null → timestamp, for audit)
 *   - reviewed_by (null → admin_id, for accountability)
 */
export type PriceSubmission = {
  // Immutable evidence
  id: string;
  spot_id: string;
  user_session_id: string;
  total_per_person: number;
  date_of_spend: string;
  created_at: string;

  // Optional immutable context
  food_cost: number | null;
  drink_cost: number | null;
  transport_cost: number | null;
  squad_size: number | null;

  // Immutable provenance
  source: 'user' | 'operator' | 'creator';
  source_id: string | null;

  // Mutable moderation
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

/**
 * CreatePriceSubmissionInput - DTO for submitting a price
 *
 * What the frontend/user sends to the API.
 * Application validates and transforms this into a PriceSubmission row.
 */
export type CreatePriceSubmissionInput = {
  spotId: string;
  totalPerPerson: number;
  dateOfSpend: string;
  squadSize?: number;
  foodCost?: number;
  drinkCost?: number;
  transportCost?: number;
  sessionId?: string;
};


/**
 * PriceConfidence - Computed aggregate for a spot
 *
 * Not stored in database. Computed from price_submissions query.
 * Confidence = f(submission_count, days_since_latest, variance, has_operator)
 *
 * Tiers:
 *   verified (0.95+): Operator confirmed or 10+ recent users with tight spread
 *   community_verified (0.80+): 10+ users, low variance, recent
 *   updated (0.60+): 5+ users, moderate variance, somewhat recent
 *   estimated (0.30+): 1-4 users or stale data
 *   unknown (<0.30): No data or very high variance
 */
export type PriceConfidenceTier =
  | 'verified'
  | 'community_verified'
  | 'updated'
  | 'estimated'
  | 'unknown';

export type PriceConfidence = {
  amount: number;
  range: {
    low: number;
    high: number;
    spread: number;
  };
  confidence: number;
  confidenceTier: PriceConfidenceTier;
  submissions: number;
  lastUpdate: string;
  daysAgo: number;
  hasOperatorConfirmation: boolean;
};

/**
 * PriceAggregateQuery - Raw PostgreSQL result for price aggregation
 *
 * Result of query that computes percentiles + confidence inputs.
 * Used internally by getPriceForSpot().
 */
export type PriceAggregateQuery = {
  submission_count: number;
  median_price: number;
  p25_price: number;
  p75_price: number;
  price_stddev: number;
  latest_spend_date: string;
  days_since_latest: number;
  has_operator_confirmation: boolean;
};

/**
 * PriceSubmissionValidationError - Input validation failed
 *
 * Raised when user input violates business rules (before DB insert).
 */
export class PriceSubmissionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PriceSubmissionValidationError';
  }
}

/**
 * Immutability violation - Raised when trigger detects UPDATE of evidence
 *
 * Should never happen in production (trigger prevents it).
 * Indicates a bug in the application or direct SQL manipulation.
 */
export class ImmutabilityViolation extends Error {
  constructor(public field: string) {
    super(`Cannot update immutable field: ${field}`);
    this.name = 'ImmutabilityViolation';
  }
}

/**
 * DuplicateSubmissionError - User submitted for same venue too recently
 *
 * Business rule: Max once per 7 days per venue.
 */
export class DuplicateSubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateSubmissionError';
  }
}
