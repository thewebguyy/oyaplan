import { z } from 'zod';

export const EventCategory = z.enum([
  'Acquisition',
  'Activation',
  'Engagement',
  'Trust',
  'Recommendation',
  'Sharing',
  'Contribution',
  'Retention',
  'Operations',
  'AI'
]);

export type EventCategoryType = z.infer<typeof EventCategory>;

/**
 * Product Validation Layer Taxonomy
 * Every event maps to a specific product question.
 */
export const EventSchemas = {
  // Activation
  'forge_started': z.object({
    category: z.literal('Activation'),
    source: z.string(), // e.g. 'landing_page', 'dashboard'
    version: z.literal('1.0')
  }),
  'forge_completed': z.object({
    category: z.literal('Activation'),
    budget: z.number(),
    squad_size: z.number(),
    vibe: z.string(),
    start_area: z.string(),
    results_count: z.number(),
    top_spot_id: z.string().optional(),
    duration_ms: z.number().optional(), // Answers: How long does it take?
    version: z.literal('1.0')
  }),
  
  // Engagement
  'budget_modified': z.object({
    category: z.literal('Engagement'),
    previous_budget: z.number(),
    new_budget: z.number(),
    version: z.literal('1.0')
  }),
  'recommendation_viewed': z.object({
    category: z.literal('Engagement'),
    spot_id: z.string(),
    rank: z.number(), // Answers: Which cards are clicked?
    version: z.literal('1.0')
  }),
  
  // Trust
  'confidence_badge_clicked': z.object({
    category: z.literal('Trust'),
    spot_id: z.string(),
    confidence_score: z.number(),
    version: z.literal('1.0')
  }),
  
  // Sharing
  'plan_shared': z.object({
    category: z.literal('Sharing'),
    plan_id: z.string(),
    share_method: z.string(), // 'whatsapp', 'copy_link'
    version: z.literal('1.0')
  }),
  'shared_plan_opened': z.object({
    category: z.literal('Sharing'),
    plan_id: z.string(),
    referrer: z.string().optional(),
    version: z.literal('1.0')
  }),

  // Acquisition & Growth (Phase 9)
  'deep_link_resolved': z.object({
    category: z.literal('Acquisition'),
    source: z.string(), // e.g. 'whatsapp', 'x', 'qr'
    utm_campaign: z.string().optional(),
    version: z.literal('1.0')
  }),
  'utm_captured': z.object({
    category: z.literal('Acquisition'),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    version: z.literal('1.0')
  }),
  'invite_sent': z.object({
    category: z.literal('Growth'),
    share_method: z.string(),
    version: z.literal('1.0')
  }),
  'invite_opened': z.object({
    category: z.literal('Growth'),
    referrer_code: z.string(),
    version: z.literal('1.0')
  }),
  'referral_milestone_achieved': z.object({
    category: z.literal('Growth'),
    milestone: z.string(),
    fraud_score: z.string(),
    version: z.literal('1.0')
  })
} as const;

export type EventName = keyof typeof EventSchemas;

export interface ClientContext {
  browser: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  country?: string;
  referrer?: string;
}

export interface AnalyticsPayload<T extends EventName> {
  session_id: string;
  event_name: T;
  properties: z.infer<typeof EventSchemas[T]>;
  feature_flags?: Record<string, boolean>;
  experiments?: Record<string, string>;
  client_context?: ClientContext;
}
