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
  'AI',
  'Feedback',
  'Monetization',
  'Reliability',
  'Growth',
  'Scout'
]);

export type EventCategoryType = z.infer<typeof EventCategory>;

/**
 * Product Validation Layer Taxonomy
 * Every event maps to a specific product question.
 */
export const EventSchemas = {
  // Acquisition
  'landing_page_view': z.object({
    category: z.literal('Acquisition'),
    path: z.string(),
    ref: z.string().optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    version: z.literal('1.0')
  }),
  'signup_started': z.object({
    category: z.literal('Acquisition'),
    source: z.string().optional(),
    path: z.string().optional(),
    version: z.literal('1.0')
  }),
  'signup_completed': z.object({
    category: z.literal('Acquisition'),
    user_id: z.string(),
    method: z.string().optional(),
    source: z.string().optional(),
    version: z.literal('1.0')
  }),
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

  // Activation & Planning
  'forge_started': z.object({
    category: z.literal('Activation'),
    source: z.string().optional(),
    area: z.string().optional(),
    budget: z.number().optional(),
    squad_size: z.number().optional(),
    version: z.literal('1.0')
  }),
  'forge_completed': z.object({
    category: z.literal('Activation'),
    budget: z.number().optional(),
    squad_size: z.number().optional(),
    vibe: z.string().optional(),
    start_area: z.string().optional(),
    plans_generated: z.number().optional(),
    results_count: z.number().optional(),
    top_spot_id: z.string().optional(),
    duration_ms: z.number().optional(), // Answers: How long does it take?
    version: z.literal('1.0')
  }),
  'auth_initiated': z.object({
    category: z.literal('Activation'),
    source: z.string(), // e.g. "save_plan", "trust_engine"
    path: z.string(),
    version: z.literal('1.0')
  }),
  'recovery_shown': z.object({
    category: z.literal('Activation'),
    vibe: z.string().optional(),
    budget: z.number().optional(),
    squad_size: z.number().optional(),
    start_area: z.string().optional(),
    suggestions_count: z.number().optional(),
    version: z.literal('1.0')
  }),
  'recovery_accepted': z.object({
    category: z.literal('Activation'),
    suggestion_type: z.string(),
    delta_budget: z.number().nullable(),
    suggested_area: z.string().nullable(),
    suggested_vibe: z.string().nullable(),
    unlocked_venue_count: z.number(),
    version: z.literal('1.0')
  }),
  
  // Engagement
  'plan_saved': z.object({
    category: z.literal('Engagement'),
    shared_plan_id: z.string(),
    spot_id: z.string().optional(),
    total_cost: z.number().optional(),
    version: z.literal('1.0')
  }),
  'spot_saved': z.object({
    category: z.literal('Engagement'),
    spot_id: z.string(),
    position_in_stack: z.number().optional(),
    area: z.string().optional(),
    vibe: z.string().optional(),
    version: z.literal('1.0')
  }),
  'spot_passed': z.object({
    category: z.literal('Engagement'),
    spot_id: z.string(),
    position_in_stack: z.number(),
    area: z.string(),
    vibe: z.string(),
    version: z.literal('1.0')
  }),
  'page_viewed': z.object({
    category: z.literal('Engagement'),
    path: z.string(),
    version: z.literal('1.0')
  }),
  'plan_viewed': z.object({
    category: z.literal('Engagement'),
    plan_id: z.string(),
    version: z.literal('1.0')
  }),
  'venue_viewed': z.object({
    category: z.literal('Engagement'),
    spot_id: z.string(),
    rank: z.number().optional(),
    area: z.string().optional(),
    version: z.literal('1.0')
  }),
  'recommendation_viewed': z.object({
    category: z.literal('Engagement'),
    spot_id: z.string(),
    rank: z.number(),
    version: z.literal('1.0')
  }),
  'budget_modified': z.object({
    category: z.literal('Engagement'),
    previous_budget: z.number(),
    new_budget: z.number(),
    version: z.literal('1.0')
  }),
  'budget_breakdown_viewed': z.object({
    category: z.literal('Engagement'),
    spot_id: z.string().optional(),
    total_cost: z.number().optional(),
    version: z.literal('1.0')
  }),
  'transport_breakdown_viewed': z.object({
    category: z.literal('Engagement'),
    origin: z.string().optional(),
    destination: z.string().optional(),
    mode: z.string().optional(),
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
    utm_source: z.string().optional(),
    version: z.literal('1.0')
  }),
  'recipient_engaged': z.object({
    category: z.literal('Sharing'),
    plan_id: z.string(),
    action: z.string(), // 'vote', 'save', 'plan_own', 'whatsapp_join'
    version: z.literal('1.0')
  }),

  // Trust & Feedback
  'confidence_badge_clicked': z.object({
    category: z.literal('Trust'),
    spot_id: z.string(),
    confidence_score: z.number(),
    version: z.literal('1.0')
  }),
  'feedback_prompt_eligible': z.object({
    category: z.literal('Feedback'),
    plan_id: z.string(),
    spot_id: z.string(),
    version: z.literal('1.0')
  }),
  'feedback_prompt_shown': z.object({
    category: z.literal('Feedback'),
    plan_id: z.string(),
    spot_id: z.string(),
    version: z.literal('1.0')
  }),
  'feedback_prompt_dismissed': z.object({
    category: z.literal('Feedback'),
    plan_id: z.string(),
    spot_id: z.string(),
    version: z.literal('1.0')
  }),
  'outing_confirmed': z.object({
    category: z.literal('Feedback'),
    plan_id: z.string(),
    spot_id: z.string(),
    version: z.literal('1.0')
  }),
  'outing_not_yet': z.object({
    category: z.literal('Feedback'),
    plan_id: z.string(),
    spot_id: z.string(),
    version: z.literal('1.0')
  }),
  'outing_not_happened': z.object({
    category: z.literal('Feedback'),
    plan_id: z.string(),
    spot_id: z.string(),
    version: z.literal('1.0')
  }),
  'actual_spend_started': z.object({
    category: z.literal('Feedback'),
    plan_id: z.string(),
    spot_id: z.string(),
    version: z.literal('1.0')
  }),
  'actual_spend_submitted': z.object({
    category: z.literal('Feedback'),
    shared_plan_id: z.string(),
    spot_id: z.string().optional(),
    actual_total: z.number(),
    estimated_total: z.number(),
    version: z.literal('1.0')
  }),
  'actual_spend_submission_failed': z.object({
    category: z.literal('Feedback'),
    shared_plan_id: z.string(),
    spot_id: z.string().optional(),
    error: z.string(),
    version: z.literal('1.0')
  }),
  'plan_usefulness_rated': z.object({
    category: z.literal('Trust'),
    plan_id: z.string(),
    rating: z.enum(['up', 'down']),
    version: z.literal('1.0')
  }),
  'price_accuracy_reported': z.object({
    category: z.literal('Trust'),
    venue_id: z.string(),
    venue_name: z.string(),
    status: z.enum(['accurate', 'changed', 'outdated']),
    version: z.literal('1.0')
  }),
  'estimate_feedback_submitted': z.object({
    category: z.literal('Feedback'),
    plan_id: z.string(),
    feedback_text: z.string().optional(),
    rating: z.string().optional(),
    version: z.literal('1.0')
  }),
  'venue_correction_submitted': z.object({
    category: z.literal('Contribution'),
    venue_id: z.string(),
    field: z.string(),
    corrected_value: z.string(),
    version: z.literal('1.0')
  }),
  'transport_actual_feedback': z.object({
    category: z.literal('Trust'),
    mode: z.string(),
    result: z.enum(['about_right', 'higher', 'lower']),
    estimated_min: z.number().optional(),
    estimated_max: z.number().optional(),
    origin_district_id: z.string().optional(),
    destination_district_id: z.string().optional(),
    spot_id: z.string().optional(),
    actual_amount: z.number().optional(),
    departure_at: z.string().optional(),
    version: z.literal('1.0')
  }),
  'spot_suggested': z.object({
    category: z.literal('Contribution'),
    spot_name: z.string(),
    area: z.string(),
    rough_price: z.number().optional(),
    version: z.literal('1.0')
  }),

  // Monetization
  'premium_viewed': z.object({
    category: z.literal('Monetization'),
    feature: z.string().optional(),
    version: z.literal('1.0')
  }),
  'payment_started': z.object({
    category: z.literal('Monetization'),
    plan_tier: z.string(),
    amount_ngn: z.number(),
    version: z.literal('1.0')
  }),
  'payment_completed': z.object({
    category: z.literal('Monetization'),
    reference: z.string(),
    amount_ngn: z.number(),
    version: z.literal('1.0')
  }),

  // Reliability
  'plan_generation_failed': z.object({
    category: z.literal('Reliability'),
    start_area: z.string().optional(),
    budget: z.number().optional(),
    squad_size: z.number().optional(),
    reason: z.string(),
    version: z.literal('1.0')
  }),
  'account_load_failed': z.object({
    category: z.literal('Reliability'),
    user_id: z.string().optional(),
    error: z.string(),
    version: z.literal('1.0')
  }),
  'api_error': z.object({
    category: z.literal('Reliability'),
    endpoint: z.string(),
    status_code: z.number(),
    error_message: z.string(),
    version: z.literal('1.0')
  }),
  'otp_failed': z.object({
    category: z.literal('Reliability'),
    reason: z.string(),
    version: z.literal('1.0')
  }),

  // Growth & Referrals
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
  }),
  'referral_code_requested': z.object({
    category: z.literal('Growth'),
    version: z.literal('1.0')
  }),
  'referral_code_generated': z.object({
    category: z.literal('Growth'),
    code: z.string(),
    version: z.literal('1.0')
  }),

  // Operations & Identity
  'identity_merge_skipped_no_session': z.object({
    category: z.literal('Operations'),
    reason: z.string(),
    version: z.literal('1.0')
  }),

  // Scout Portal
  'scout_profile_attempt': z.object({
    category: z.literal('Scout'),
    username: z.string(),
    version: z.literal('1.0')
  }),
  'scout_profile_created': z.object({
    category: z.literal('Scout'),
    username: z.string(),
    version: z.literal('1.0')
  }),
  'scout_profile_failed': z.object({
    category: z.literal('Scout'),
    username: z.string(),
    error: z.string(),
    version: z.literal('1.0')
  }),

  // OyaSquad / Planning Groups
  'group_created': z.object({
    category: z.literal('Planning'),
    group_id: z.string(),
    member_count: z.number(),
    version: z.literal('1.0')
  }),
  'group_member_added': z.object({
    category: z.literal('Planning'),
    group_id: z.string(),
    version: z.literal('1.0')
  }),
  'group_member_removed': z.object({
    category: z.literal('Planning'),
    group_id: z.string(),
    version: z.literal('1.0')
  }),
  'group_selected': z.object({
    category: z.literal('Planning'),
    group_id: z.string(),
    member_count: z.number(),
    version: z.literal('1.0')
  }),
  'group_plan_started': z.object({
    category: z.literal('Planning'),
    group_id: z.string(),
    squad_size: z.number(),
    is_repeat_plan: z.boolean(),
    version: z.literal('1.0')
  }),
  'group_plan_shared': z.object({
    category: z.literal('Planning'),
    group_id: z.string(),
    shared_plan_id: z.string(),
    version: z.literal('1.0')
  }),
  'group_plan_repeated': z.object({
    category: z.literal('Planning'),
    group_id: z.string(),
    version: z.literal('1.0')
  }),

  // Venue Partner Supply-Side Events
  'venue_claim_started': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    version: z.literal('1.0')
  }),
  'venue_claim_submitted': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    claim_id: z.string().optional(),
    role: z.string().optional(),
    proof_type: z.string().optional(),
    version: z.literal('1.0')
  }),
  'venue_claim_approved': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    claim_id: z.string(),
    version: z.literal('1.0')
  }),
  'venue_claim_rejected': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    claim_id: z.string(),
    version: z.literal('1.0')
  }),
  'venue_onboarding_started': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    version: z.literal('1.0')
  }),
  'venue_onboarding_step_completed': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    step: z.number(),
    version: z.literal('1.0')
  }),
  'venue_onboarding_completed': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    version: z.literal('1.0')
  }),
  'venue_verification_submitted': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    version: z.literal('1.0')
  }),
  'venue_pricing_viewed': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    version: z.literal('1.0')
  }),
  'venue_pricing_updated': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    menu_item_id: z.string().optional(),
    price: z.number().optional(),
    version: z.literal('1.0')
  }),
  'venue_photo_uploaded': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    photo_type: z.string().optional(),
    version: z.literal('1.0')
  }),
  'venue_change_reported': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    category_type: z.string().optional(),
    version: z.literal('1.0')
  }),
  'venue_closure_reported': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    version: z.literal('1.0')
  }),
  'venue_partner_home_viewed': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    partner_state: z.string().optional(),
    version: z.literal('1.0')
  }),
  'business_portal_opened': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    page: z.string().optional(),
    version: z.literal('1.0')
  }),
  'pricing_updated_in_portal': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    item_id: z.string().optional(),
    price: z.number().optional(),
    version: z.literal('1.0')
  }),
  'table_policy_updated_in_portal': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    policy_count: z.number(),
    version: z.literal('1.0')
  }),
  'celebration_rules_updated_in_portal': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    has_cake_fee: z.boolean(),
    has_corkage_fee: z.boolean(),
    version: z.literal('1.0')
  }),
  'closure_updated_in_portal': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    is_closed: z.boolean(),
    version: z.literal('1.0')
  }),
  'whatsapp_support_clicked': z.object({
    category: z.literal('Operations'),
    context: z.string(),
    venue_id: z.string().optional(),
    version: z.literal('1.0')
  }),
  'availability_whatsapp_clicked': z.object({
    category: z.literal('Engagement'),
    venue_id: z.string().optional(),
    venue_name: z.string(),
    squad_size: z.number().optional(),
    version: z.literal('1.0')
  }),
  'visit_confirmation_attempted': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    plan_code: z.string(),
    version: z.literal('1.0')
  }),
  'visit_confirmation_succeeded': z.object({
    category: z.literal('Operations'),
    venue_id: z.string(),
    plan_code: z.string(),
    already_confirmed: z.boolean(),
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
