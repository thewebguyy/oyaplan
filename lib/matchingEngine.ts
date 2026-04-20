import { Spot, ForgeInput, Plan } from './types';

export function forgePlans(input: ForgeInput, allSpots: Spot[]): Plan[] {
  const { startArea, squadSize, budget, vibe } = input;

  // 1. Filter and Score
  const scoredSpots = allSpots
    .filter((spot) => {
      // Must match vibe tag
      if (!spot.vibe_tags.includes(vibe)) return false;

      // Calculate base costs
      const foodCost = spot.price_per_person * squadSize * 1.1;
      const transportCost = spot.transport_matrix[startArea] || 5000; // Fallback transport cost
      const totalCost = foodCost + transportCost;

      // Transport cost must be <= 35% of budget
      if (transportCost > budget * 0.35) return false;

      // Total cost must not exceed budget by more than 10% (slight flex)
      // Actually PRD says "without exceeding" but usually deterministic engines allow a tiny bit of flex or strict. 
      // I'll stick to strict for now:
      if (totalCost > budget) return false;

      return true;
    })
    .map((spot) => {
      const foodCost = Math.round((spot.price_per_person * squadSize * 1.1) / 100) * 100;
      const transportCost = spot.transport_matrix[startArea] || 5000;
      const totalCost = foodCost + transportCost;

      // Scoring
      // 1. Cost Score (80% weight): Closer to budget is better
      const costScore = (totalCost / budget) * 80;

      // 2. Vibe Match Score (10% weight): If multiple tags match
      const vibeMatches = spot.vibe_tags.filter(t => t === vibe).length;
      const vibeScore = Math.min(vibeMatches * 5, 10);

      // 3. Stable weight based on ID (to avoid random shifts)
      const idWeight = spot.id.split('-')[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;

      const totalScore = costScore + vibeScore + (idWeight / 1);

      // Generate "Why it fits"
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
  const saving = diff > 0 ? `with ₦${diff.toLocaleString()} left over.` : "perfectly on budget.";
  
  const reasons = [
    `This spot is a ${vibe} favorite in ${spot.address.split(',')[1] || 'Lagos'} and fits your budget ${saving}`,
    `Known for its ${spot.vibe_tags.join(', ')} vibes, it's the best value for your squad today.`,
    `Great choice for a ${vibe} outing, keeping transport costs low while maximizing the food experience.`
  ];

  // Deterministic reason selection
  const reasonIndex = (spot.name.length + spot.price_per_person) % reasons.length;
  return reasons[reasonIndex];
}
