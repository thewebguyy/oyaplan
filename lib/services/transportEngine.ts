import { supabase } from '../supabase';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function roundTo500(value: number): number {
  return Math.round(value / 500) * 500;
}

export interface FareEstimate {
  provider: string;
  mode: string;
  cost_low: number;
  cost_high: number;
  confidence: number;
  distance_km: number;
  duration_minutes: number;
}

export async function estimateTransportFare(
  originDistrictId: string,
  destinationDistrictId: string,
  cityId: string
): Promise<FareEstimate[]> {
  try {
    // 1. Check for specific overrides first
    const { data: overrides, error: overrideErr } = await supabase
      .from('transport_route_overrides')
      .select('*')
      .eq('origin_district_id', originDistrictId)
      .eq('destination_district_id', destinationDistrictId);

    if (overrideErr) {
      console.error('Error fetching transport overrides:', overrideErr);
    }

    // 2. Fetch district coordinates
    const { data: districts, error: distErr } = await supabase
      .from('districts')
      .select('id, latitude, longitude, name')
      .in('id', [originDistrictId, destinationDistrictId]);

    if (distErr || !districts || districts.length < 2) {
      // Fallback: If we can't find both districts, return a default fare matrix
      console.warn('Could not locate coordinates for both districts. Using default estimation...');
      return [
        {
          provider: 'Uber',
          mode: 'UberX',
          cost_low: 4000,
          cost_high: 6000,
          confidence: 50,
          distance_km: 12.0,
          duration_minutes: 30
        },
        {
          provider: 'Bolt',
          mode: 'Bolt Lite',
          cost_low: 3500,
          cost_high: 5000,
          confidence: 50,
          distance_km: 12.0,
          duration_minutes: 30
        }
      ];
    }

    const origin = districts.find(d => d.id === originDistrictId)!;
    const dest = districts.find(d => d.id === destinationDistrictId)!;

    // Calculate distance
    let distanceKm = 10.0; // standard fallback
    if (origin.latitude && origin.longitude && dest.latitude && dest.longitude) {
      distanceKm = haversineDistance(
        Number(origin.latitude),
        Number(origin.longitude),
        Number(dest.latitude),
        Number(dest.longitude)
      );
    }

    // Dynamic travel duration: 2.5 minutes per km in typical African city traffic
    const durationMinutes = Math.max(5, Math.round(distanceKm * 2.5));

    // Fetch active transport rates for this city
    const { data: cityRates, error: ratesErr } = await supabase
      .from('city_transport_rates')
      .select('*')
      .eq('city_id', cityId);

    if (ratesErr || !cityRates || cityRates.length === 0) {
      console.error('Failed to retrieve city transport rates:', ratesErr);
      return [];
    }

    const estimates: FareEstimate[] = [];

    // Calculate fare for each city provider mode
    for (const rate of cityRates) {
      // Check if this mode is overridden on this specific route
      const override = overrides?.find(o => o.mode_slug === rate.slug);

      if (override) {
        estimates.push({
          provider: rate.provider_name,
          mode: rate.mode_name,
          cost_low: override.fixed_cost_low,
          cost_high: override.fixed_cost_high,
          confidence: 95, // overrides represent verified data
          distance_km: Math.round(distanceKm * 10) / 10,
          duration_minutes: durationMinutes
        });
      } else {
        // Compute base distance-based rate
        const calculatedFare =
          rate.base_fare +
          distanceKm * rate.per_km_rate +
          durationMinutes * rate.per_minute_rate;

        // Apply traffic surge boundaries
        const lowVal = roundTo500(calculatedFare * 0.85);
        const highVal = roundTo500(calculatedFare * 1.30);

        estimates.push({
          provider: rate.provider_name,
          mode: rate.mode_name,
          cost_low: lowVal,
          cost_high: highVal,
          confidence: 75, // centroid formulas are estimations
          distance_km: Math.round(distanceKm * 10) / 10,
          duration_minutes: durationMinutes
        });
      }
    }

    return estimates;
  } catch (err) {
    console.error('Exception in transport engine:', err);
    return [];
  }
}
