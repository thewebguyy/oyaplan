'use server';

import { Spot, ForgeInput, Plan } from './types';

// Use realistic Lagos 2026 Bolt formula: base ₦1,500 + ₦220 per km round-trip
function calculateBoltFare(distanceKm: number): number {
  const baseFare = 1500;
  const perKmRate = 220;
  const roundTripDistance = distanceKm * 2;
  return Math.round((baseFare + (roundTripDistance * perKmRate)) / 100) * 100;
}

export async function forgePlans(input: ForgeInput, allSpots: Spot[]): Promise<Plan[]> {
  const { startArea, squadSize, budget, vibe } = input;

  // 1. Initial Filter
  let candidateSpots = allSpots.filter((spot) => {
    // Must match vibe tag
    if (!spot.vibe_tags.includes(vibe)) return false;

    // Calculate base food cost
    const foodCost = spot.price_per_person * squadSize * 1.1;

    // Quick filter using fallback transport cost before expensive API calls
    const fallbackTransportCost = spot.transport_matrix[startArea] || 5000;
    const totalCost = foodCost + fallbackTransportCost;

    // Quick prune to avoid calling maps for completely out of budget items
    if (totalCost > budget * 1.5) return false;

    return true;
  });

  // Take top 10 candidates to limit Maps API calls
  candidateSpots = candidateSpots.slice(0, 10);

  // 2. Dynamic Transport Cost via Google Maps
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  // TODO: Add your Google Maps API Key to .env.local as GOOGLE_MAPS_API_KEY
  
  const origins = `${startArea}, Lagos, Nigeria`;
  const destinations = candidateSpots.map(s => `${s.address}, Lagos, Nigeria`).join('|');

  let distances: (number | null)[] = candidateSpots.map(() => null);

  if (GOOGLE_MAPS_API_KEY && candidateSpots.length > 0) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        const row = data.rows[0];
        distances = row.elements.map((element: any) => {
          if (element.status === 'OK') {
            return element.distance.value / 1000; // convert meters to km
          }
          return null;
        });
      }
    } catch (e) {
      console.error("Google Maps API failed, falling back to matrix", e);
    }
  }

  // 3. Final Filter and Score
  const scoredSpots = candidateSpots
    .map((spot, index) => {
      const foodCost = Math.round((spot.price_per_person * squadSize * 1.1) / 100) * 100;
      
      let transportCost = spot.transport_matrix[startArea] || 5000;
      if (distances[index] !== null) {
        transportCost = calculateBoltFare(distances[index]!);
      }

      const totalCost = foodCost + transportCost;
      return { spot, foodCost, transportCost, totalCost };
    })
    .filter(({ transportCost, totalCost }) => {
      // Transport cost must be <= 35% of budget
      if (transportCost > budget * 0.35) return false;
      // Total cost must not exceed budget
      if (totalCost > budget) return false;
      return true;
    })
    .map(({ spot, foodCost, transportCost, totalCost }) => {
      // Scoring Algorithm
      // Reward plans closest to (but not over) budget
      const costScore = (1 - Math.abs(budget - totalCost) / budget) * 80;

      // Vibe Match Score
      const vibeMatches = spot.vibe_tags.filter(t => t === vibe).length;
      const vibeScore = Math.min(vibeMatches * 5, 10);

      // Featured Boost
      const featuredBoost = spot.is_featured ? 30 : 0;

      // Stable weight based on ID (to avoid random shifts)
      const idWeight = spot.id.split('-')[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;

      const totalScore = costScore + vibeScore + featuredBoost + (idWeight / 1);

      const whyItFits = generateWhyItFits(spot, vibe, totalCost, budget);

      return {
        spot,
        foodCost,
        transportCost,
        totalCost,
        whyItFits,
        score: totalScore
      };
    });

  // Sort by score descending
  const sortedPlans = scoredSpots.sort((a, b) => b.score - a.score);

  // Return top 1-3
  return sortedPlans.slice(0, 3).map(({ spot, foodCost, transportCost, totalCost, whyItFits }) => ({
    spot,
    foodCost,
    transportCost,
    totalCost,
    whyItFits
  }));
}

function generateWhyItFits(spot: Spot, vibe: string, total: number, budget: number): string {
  const diff = budget - total;
  
  if (diff <= 2000 && diff >= 0) {
    return "Right on budget. Spent well.";
  }

  const suggestions: Record<string, string> = {
    "Chill": "an extra round of drinks",
    "Foodie": "dessert and a starter",
    "Party": "cover charge or transport home",
    "Quick": "takeaway on the way back",
    "Dinner": "a bottle for the table",
    "Brunch": "cocktails or fresh juice"
  };

  const suggestion = suggestions[vibe] || "something extra for the squad";
  
  return `Your squad saves ₦${diff.toLocaleString()} under budget — enough for ${suggestion}.`;
}
