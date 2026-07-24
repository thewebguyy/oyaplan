export interface ChainVibeConfig {
  name: string;
  sequence: string[]; // Order of stops (e.g. ['restaurant', 'bar', 'entertainment'])
  budgetWeights: number[]; // Ratios for budget split (must sum to 1.0)
  description: string;
}

export const CHAIN_VIBE_SEQS: Record<string, ChainVibeConfig> = {
  "date_night": {
    name: "Ultimate Date Night",
    sequence: ["restaurant", "bar", "experience"],
    budgetWeights: [0.55, 0.25, 0.20],
    description: "Sleek dining followed by cozy drinks and an intimate couple activity.",
  },
  "squad_linkup": {
    name: "Squad Night Out",
    sequence: ["restaurant", "entertainment", "bar"],
    budgetWeights: [0.45, 0.35, 0.20],
    description: "Dinner, a group activity (bowling/games), ending with high-energy lounge drinks.",
  },
  "chill_day": {
    name: "Relaxed Day Trip",
    sequence: ["cafe", "nature", "restaurant"],
    budgetWeights: [0.20, 0.30, 0.50],
    description: "Light coffee brunch, outdoor nature walk, and a premium dinner.",
  },
};
