import { z } from 'zod';
import { supabase } from '../../supabase';

// Schema for the raw incoming venue data (like from Lagos on a Budget)
export const RawVenueSchema = z.object({
  venueName: z.string().min(1),
  category: z.enum(['restaurant', 'cafe', 'bar', 'lounge', 'activity', 'nature', 'experience', 'entertainment', 'beach', 'hotel-bar']),
  district: z.string().min(1),
  minPrice: z.number().positive(),
  maxPrice: z.number().positive().nullable().optional(),
  typicalSpend: z.number().positive(),
  confidence: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  address: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
});

export type RawVenuePayload = z.infer<typeof RawVenueSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  districtId?: string;
}

export class ValidationEngine {
  
  /**
   * 1. Schema Validation (Types, Shapes)
   * 2. Business Validation (District mapping)
   */
  static async validateVenueRow(rawPayload: any): Promise<ValidationResult> {
    const errors: string[] = [];
    let districtId: string | undefined;

    // 1. Schema Validation
    const parsed = RawVenueSchema.safeParse(rawPayload);
    if (!parsed.success) {
      errors.push(...parsed.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`));
      return { isValid: false, errors };
    }

    // 2. Business Validation (Resolve District)
    const slugifiedDistrict = parsed.data.district.toLowerCase().replace(/\s+/g, '-');
    const { data: districtData, error } = await supabase
      .from('districts')
      .select('id')
      .eq('slug', slugifiedDistrict)
      .single();

    if (error || !districtData) {
      errors.push(`District not found: ${parsed.data.district}`);
    } else {
      districtId = districtData.id;
    }

    return {
      isValid: errors.length === 0,
      errors,
      districtId
    };
  }
}
