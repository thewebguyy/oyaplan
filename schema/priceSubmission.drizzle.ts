/**
 * Drizzle ORM Schema for price_submissions
 *
 * Reference implementation for future ORM migration (Month 2+).
 * Currently the project uses raw Supabase client with TypeScript types.
 * This schema shows how price_submissions would be defined in Drizzle.
 *
 * Installation (when ready):
 *   npm install drizzle-orm drizzle-kit pg
 *   Update drizzle.config.ts
 *   Run: drizzle-kit push:pg
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  timestamp,
  check,
  index,
  sql,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Assuming spots table exists (imported for FK reference)
// import { spots } from './spots.drizzle';

/**
 * price_submissions table
 *
 * Immutable evidence store for user-reported spending.
 * Evidence fields (what, when, where, who) never change via UPDATE.
 * Moderation fields (status, review metadata) are mutable for admin workflow.
 *
 * Triggers enforce immutability:
 *   - Trigger: price_submissions_immutability
 *   - Raises exception if evidence fields are updated
 */
export const priceSubmissions = pgTable(
  'price_submissions',
  {
    // Immutable Evidence
    id: uuid('id').primaryKey().defaultRandom(),

    // Which venue?
    spot_id: uuid('spot_id')
      .notNull()
      .references(() => spots.id, { onDelete: 'cascade' }),

    // Who submitted? (anonymous session ID, not user PII)
    user_session_id: text('user_session_id').notNull(),

    // What was spent? (core evidence)
    total_per_person: integer('total_per_person').notNull(),

    // When was it spent? (immutable timestamp)
    date_of_spend: date('date_of_spend').notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Optional immutable context (collected progressively)
    food_cost: integer('food_cost'),
    drink_cost: integer('drink_cost'),
    transport_cost: integer('transport_cost'),
    squad_size: integer('squad_size'),

    // Immutable provenance (who said this?)
    source: text('source', {
      enum: ['user', 'operator', 'creator'],
    })
      .notNull()
      .default('user'),
    source_id: text('source_id'),

    // Mutable Moderation Metadata
    status: text('status', {
      enum: ['pending', 'approved', 'rejected'],
    })
      .notNull()
      .default('pending'),

    rejection_reason: text('rejection_reason'),

    // Moderation audit trail
    reviewed_at: timestamp('reviewed_at', { withTimezone: true }),
    reviewed_by: text('reviewed_by'),
  },
  (table) => ({
    // Constraints
    constraint_price_positive: check(
      'price_positive',
      sql`${table.total_per_person} > 0`
    ),
    constraint_food_positive: check(
      'food_cost_positive',
      sql`${table.food_cost} IS NULL OR ${table.food_cost} >= 0`
    ),
    constraint_drink_positive: check(
      'drink_cost_positive',
      sql`${table.drink_cost} IS NULL OR ${table.drink_cost} >= 0`
    ),
    constraint_transport_positive: check(
      'transport_cost_positive',
      sql`${table.transport_cost} IS NULL OR ${table.transport_cost} >= 0`
    ),
    constraint_date_not_future: check(
      'date_not_future',
      sql`${table.date_of_spend} <= CURRENT_DATE`
    ),
    constraint_breakdowns_sum: check(
      'breakdowns_sum_check',
      sql`(${table.food_cost} IS NULL AND ${table.drink_cost} IS NULL) OR
          (COALESCE(${table.food_cost}, 0) + COALESCE(${table.drink_cost}, 0) <= ${table.total_per_person} * 1.1)`
    ),
    constraint_review_timeline: check(
      'review_timeline',
      sql`${table.reviewed_at} IS NULL OR ${table.reviewed_at} >= ${table.created_at}`
    ),

    // Indexes
    // Index 1: Duplicate submission guard
    // Query: "Has this user already submitted for this spot in the last 7 days?"
    idx_duplicate_guard: index('idx_price_submissions_duplicate_guard')
      .on(table.spot_id, table.user_session_id, table.created_at.desc())
      .where(sql`${table.status} IN ('pending', 'approved')`),

    // Index 2: Admin moderation workflow
    // Query: "Show me all pending submissions ordered by age"
    idx_pending: index('idx_price_submissions_pending')
      .on(table.status, table.created_at.asc())
      .where(sql`${table.status} = 'pending'`),

    // Index 3: Spot price aggregation (most common read)
    // Query: "Get all approved submissions for spot X in last 90 days"
    idx_spot_aggregation: index('idx_price_submissions_spot_aggregation')
      .on(table.spot_id, table.status, table.date_of_spend.desc())
      .where(
        sql`${table.status} = 'approved' AND ${table.date_of_spend} > CURRENT_DATE - INTERVAL '90 days'`
      ),

    // Index 4: Session reputation tracking (Month 2+)
    // Query: "How many submissions has this session made?"
    idx_session: index('idx_price_submissions_session')
      .on(table.user_session_id, table.created_at.desc()),

    // Index 5: Source provenance analysis
    // Query: "Which submissions came from operators vs. creators vs. users?"
    idx_source: index('idx_price_submissions_source').on(table.source),

    // Index 6: Admin audit trail
    // Query: "Which submissions did admin X review?"
    idx_reviewed_by: index('idx_price_submissions_reviewed_by')
      .on(table.reviewed_by, table.reviewed_at.desc())
      .where(sql`${table.reviewed_at} IS NOT NULL`),
  })
);

/**
 * Relations (optional, for Drizzle relational queries)
 */
export const priceSubmissionsRelations = relations(
  priceSubmissions,
  ({ one }) => ({
    spot: one(spots, {
      fields: [priceSubmissions.spot_id],
      references: [spots.id],
    }),
  })
);

/**
 * Type exports (Drizzle infers these automatically)
 *
 * Usage:
 *   type PriceSubmission = typeof priceSubmissions.$inferSelect;
 *   type CreatePriceSubmission = typeof priceSubmissions.$inferInsert;
 */

// Placeholder for spots table (assumed to exist)
// Replace with actual import when using this schema in the project
const spots = pgTable('spots', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  // ... other spot fields
});
