/**
 * Canonical Business WhatsApp Configuration and Helper
 *
 * Single source of truth for all business-facing WhatsApp communication.
 * Normalizes phone numbers, rejects dummy/placeholder values, provides
 * contextual message builders, and safely returns null when unconfigured
 * so the UI can gracefully fall back instead of sending users to dead accounts.
 */

const KNOWN_DUMMY_NUMBERS = new Set([
  '2348000000000',
  '2340000000000',
  '08000000000',
  '00000000000',
]);

/**
 * Normalizes a raw phone string to international E.164 digits without leading '+'.
 * Returns null if the number is missing, malformed, or a known placeholder.
 */
export function normalizeWhatsAppNumber(rawPhone?: string | null): string | null {
  if (!rawPhone) return null;

  // Strip spaces, parentheses, dashes, dots, and plus signs
  const cleaned = rawPhone.replace(/[\s\(\)\-\.\+]/g, '').trim();

  if (!cleaned || cleaned.length < 10 || cleaned.length > 15) {
    return null;
  }

  // Reject known test placeholders
  if (KNOWN_DUMMY_NUMBERS.has(cleaned)) {
    return null;
  }

  // Reject all identical repeating digits (e.g. 0000000000 or 1111111111)
  if (/^(\d)\1+$/.test(cleaned)) {
    return null;
  }

  // Nigerian local prefix conversion: 080... -> 23480...
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `234${cleaned.slice(1)}`;
  }

  // Nigerian international prefix: 234...
  if (cleaned.startsWith('234') && cleaned.length >= 13) {
    return cleaned;
  }

  // Generic valid international number (must be digits only)
  if (/^\d{10,15}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Returns whether a legitimate, validated business WhatsApp number is configured.
 */
export function isBusinessWhatsAppConfigured(): boolean {
  const raw = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP;
  return normalizeWhatsAppNumber(raw) !== null;
}

export type WhatsAppContext =
  | 'claim_support'
  | 'add_venue'
  | 'spotlight_inquiry'
  | 'pricing_update'
  | 'invitation_help'
  | 'availability_inquiry'
  | 'general_support';

export interface AvailabilityParams {
  venueName: string;
  squadSize: number;
  date: string;
  time: string;
  estimatedSpend?: number;
}

/**
 * Contextual WhatsApp pre-filled message builders.
 */
export const WhatsAppMessageTemplates = {
  claim_support: (venueName?: string) =>
    venueName
      ? `Hi OyaPlan Operations, I manage ${venueName} in Lagos and need help claiming our listing.`
      : `Hi OyaPlan Operations, I manage a venue in Lagos and would like to claim our listing.`,

  add_venue: (query?: string) =>
    query
      ? `Hi OyaPlan Team, I'd like to get my venue (${query}) listed on OyaPlan for Lagos squads.`
      : `Hi OyaPlan Team, I'd like to get my Lagos venue listed on OyaPlan.`,

  spotlight_inquiry: (venueName?: string) =>
    venueName
      ? `Hi OyaPlan Team, I manage ${venueName} in Lagos and want to learn more about becoming a Verified Partner on OyaPlan.`
      : `Hi OyaPlan Team, I own a venue in Lagos and want to learn more about becoming a Verified Partner on OyaPlan.`,

  pricing_update: (venueName?: string) =>
    venueName
      ? `Hi OyaPlan Team, I manage ${venueName} and would like to update our verified menu pricing and policies.`
      : `Hi OyaPlan Team, I'd like to update our venue's menu pricing and policies on OyaPlan.`,

  invitation_help: (venueName?: string) =>
    venueName
      ? `Hi OyaPlan Team, our invitation link for ${venueName} has expired or needs assistance.`
      : `Hi OyaPlan Team, my venue invitation link expired or failed to open.`,

  availability_inquiry: (params: AvailabilityParams) => {
    const spendText = params.estimatedSpend
      ? `\n- Budget target: ~₦${params.estimatedSpend.toLocaleString('en-NG')}`
      : '';
    return (
      `Hi ${params.venueName}, checking table availability via OyaPlan:\n` +
      `- Squad size: ${params.squadSize} people\n` +
      `- Outing date: ${params.date}\n` +
      `- Intended time: ${params.time}` +
      spendText +
      `\nDo you have open seating for this squad?`
    );
  },

  general_support: (venueName?: string) =>
    venueName
      ? `Hi OyaPlan Operations, I have a question about ${venueName} on OyaPlan for Business.`
      : `Hi OyaPlan Operations, I have a question about OyaPlan for Business.`,
};

/**
 * Returns a canonical wa.me deep link URL, or null if WhatsApp contact is unconfigured/dummy.
 */
export function getBusinessWhatsAppUrl(
  context: WhatsAppContext,
  params?: {
    venueName?: string;
    query?: string;
    availability?: AvailabilityParams;
    customPhone?: string | null;
  }
): string | null {
  // Allow using venue-specific contact number if provided (e.g. for direct venue availability)
  const phone = normalizeWhatsAppNumber(params?.customPhone) ||
                normalizeWhatsAppNumber(process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP);

  if (!phone) {
    return null;
  }

  let text = '';
  switch (context) {
    case 'claim_support':
      text = WhatsAppMessageTemplates.claim_support(params?.venueName);
      break;
    case 'add_venue':
      text = WhatsAppMessageTemplates.add_venue(params?.query);
      break;
    case 'spotlight_inquiry':
      text = WhatsAppMessageTemplates.spotlight_inquiry(params?.venueName);
      break;
    case 'pricing_update':
      text = WhatsAppMessageTemplates.pricing_update(params?.venueName);
      break;
    case 'invitation_help':
      text = WhatsAppMessageTemplates.invitation_help(params?.venueName);
      break;
    case 'availability_inquiry':
      if (params?.availability) {
        text = WhatsAppMessageTemplates.availability_inquiry(params.availability);
      } else {
        text = WhatsAppMessageTemplates.general_support(params?.venueName);
      }
      break;
    case 'general_support':
    default:
      text = WhatsAppMessageTemplates.general_support(params?.venueName);
      break;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
