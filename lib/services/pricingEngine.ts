import { MenuItem } from '../types';

function getMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const half = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[half];
  }
  return (sorted[half - 1] + sorted[half]) / 2;
}

function getAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function calculateTypicalOutingCost(
  menuItems: MenuItem[],
  category: string,
  taxRules: {
    vat_pct: number;
    service_charge_pct: number;
    minimum_spend: number;
  }
): number {
  if (menuItems.length === 0) {
    // If no menu items exist yet, fallback to a standard base cost
    return Math.max(5000, taxRules.minimum_spend);
  }

  let subtotal = 0;

  // Filter items by category groupings
  const mains = menuItems.filter(m => m.category === 'main').map(m => m.price);
  const starters = menuItems.filter(m => m.category === 'starter').map(m => m.price);
  const activityFees = menuItems.filter(m => m.category === 'activity_fee').map(m => m.price);
  
  const alcoholDrinks = menuItems.filter(m => ['cocktail', 'wine', 'beer', 'spirits'].includes(m.category)).map(m => m.price);
  const softDrinks = menuItems.filter(m => m.category === 'soft_drink').map(m => m.price);
  const allDrinks = [...alcoholDrinks, ...softDrinks];

  const allPrices = menuItems.map(m => m.price);

  // Category specific pricing models
  if (category === 'restaurant') {
    // 1 Main Course + 1 Drink
    const typicalMain = mains.length > 0 ? getMedian(mains) : getMedian(allPrices);
    const typicalDrink = allDrinks.length > 0 ? getMedian(allDrinks) : 3500; // default drink cost
    subtotal = typicalMain + typicalDrink;
  } else if (category === 'bar') {
    // 2 Drinks + 1 Starter/Bite
    const typicalDrink = alcoholDrinks.length > 0 ? getMedian(alcoholDrinks) : (allDrinks.length > 0 ? getMedian(allDrinks) : 4500);
    const typicalStarter = starters.length > 0 ? getMedian(starters) : (mains.length > 0 ? getMedian(mains) * 0.6 : 5000);
    subtotal = (2 * typicalDrink) + typicalStarter;
  } else if (category === 'activity') {
    // 1 Entry Fee + 1 Soft Drink
    const typicalFee = activityFees.length > 0 ? getMedian(activityFees) : getMedian(allPrices);
    const typicalSoftDrink = softDrinks.length > 0 ? getMedian(softDrinks) : 1500;
    subtotal = typicalFee + typicalSoftDrink;
  } else {
    // Generic default category average
    subtotal = getMedian(allPrices);
  }

  // Fallback check
  if (subtotal <= 0) {
    subtotal = getAverage(allPrices);
  }

  // Apply Taxes
  const taxMultiplier = 1 + (Number(taxRules.vat_pct) + Number(taxRules.service_charge_pct)) / 100;
  let total = subtotal * taxMultiplier;

  // Apply Minimum Spend
  total = Math.max(total, taxRules.minimum_spend);

  // Round to nearest 100 for clean currency figures
  return Math.round(total / 100) * 100;
}
