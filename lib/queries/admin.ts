import { supabase } from '../supabase';

export async function getTesterObservations(): Promise<{
  data: Array<{
    id: string;
    resolved: boolean;
    created_at: string;
    tester_name: string;
    device_and_network: string;
    what_they_tried: string;
    what_frustrated_them: string | null;
    what_they_wished_existed: string | null;
  }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('tester_observations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching tester observations' };
  }
}

export async function getSpotSuggestions(): Promise<{
  data: Array<{
    id: string;
    created_at: string;
    reviewed: boolean;
    spot_name: string;
    area_name: string;
    rough_price_per_person: number | null;
    suggester_whatsapp: string | null;
  }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('spot_suggestions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching spot suggestions' };
  }
}

export async function getOperatorInquiries(): Promise<{
  data: Array<{
    id: string;
    created_at: string;
    converted: boolean;
    contacted: boolean;
    business_name: string;
    owner_name: string;
    whatsapp_number: string;
    area_slug: string;
    listing_tier: string;
    monthly_budget_ngn: number | null;
  }> | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('operator_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Unexpected error fetching operator inquiries' };
  }
}
