import { supabase } from '../../supabase';
import { slugify, similarityScore } from './utils';

export interface DuplicateDetectionResult {
  status: 'unique' | 'exact_match' | 'requires_review';
  duplicateOf?: string;
  confidenceScore: number;
}

/**
 * Determines if a given venue payload matches an existing venue in the database.
 * Reduces search space by isolating the check to a specific district.
 */
export async function findDuplicateVenue(
  name: string,
  districtId: string,
  address: string
): Promise<DuplicateDetectionResult> {
  const targetSlug = slugify(name);
  
  // 1. Fetch all venues in the same district to limit the search space
  const { data: venues, error } = await supabase
    .from('venues')
    .select('id, name, address')
    .eq('district_id', districtId);
    
  if (error || !venues || venues.length === 0) {
    return { status: 'unique', confidenceScore: 0 };
  }
  
  let bestMatch: { id: string; score: number } | null = null;
  
  for (const venue of venues) {
    const existingSlug = slugify(venue.name);
    
    // EXACT MATCH
    if (existingSlug === targetSlug) {
      return { 
        status: 'exact_match', 
        duplicateOf: venue.id, 
        confidenceScore: 1.0 
      };
    }
    
    // FUZZY MATCH
    const nameScore = similarityScore(targetSlug, existingSlug);
    const addressScore = similarityScore(slugify(address), slugify(venue.address || ''));
    
    // Weighted score: Name carries 70% weight, Address carries 30%.
    const combinedScore = (nameScore * 0.7) + (addressScore * 0.3);
    
    if (!bestMatch || combinedScore > bestMatch.score) {
      bestMatch = { id: venue.id, score: combinedScore };
    }
  }
  
  // Thresholds: > 80% means it's extremely likely to be a duplicate or branch.
  if (bestMatch && bestMatch.score >= 0.80) {
    return {
      status: 'requires_review',
      duplicateOf: bestMatch.id,
      confidenceScore: bestMatch.score
    };
  }
  
  return { status: 'unique', confidenceScore: bestMatch ? bestMatch.score : 0 };
}
