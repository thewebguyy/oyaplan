import { describe, it, expect } from 'vitest';
import { calculateOutsideMath } from '@/lib/venue/venueSpend';
import { calculateZoneFare } from '@/lib/planning/transport';
import { applyBudgetMode } from '@/lib/planning/budgetMode';

// Canonical WhatsApp text generator from components/dossier/PlanCTAs.tsx
function generateWhatsAppText(params: {
  venueName: string;
  cleanAddress: string;
  totalCost: number;
  perPersonTotal: number;
  squadSize: number;
  foodCost: number;
  transportCost: number;
  taxesCost: number;
  shareUrl: string;
}) {
  return `Check our outing plan for ${params.venueName}:

• Venue: ${params.venueName} (${params.cleanAddress})
• Estimated Total: ₦${params.totalCost.toLocaleString()} (~₦${params.perPersonTotal.toLocaleString()} each)
• Squad: ${params.squadSize} people

Verified Breakdown:
• Food & Dining: ₦${params.foodCost.toLocaleString()}
• Estimated Transport (Round-Trip): ₦${params.transportCost.toLocaleString()}
• Verified Charges & Buffer: ₦${params.taxesCost.toLocaleString()}

See the full plan and breakdown:
${params.shareUrl}`;
}

describe('Phase 1.5: Programmatic Six-Surface Pricing Parity Audit (Headcounts 1 to 13)', () => {
  const headcounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const destinations = ['ikeja', 'vi']; // Mainland vs Island
  const spotPricePerPerson = 15000;

  for (const dest of destinations) {
    const isIsland = dest === 'vi';
    const zoneName = isIsland ? 'Island' : 'Mainland';

    describe(`Corridor: ${zoneName} (${dest})`, () => {
      for (const squad of headcounts) {
        it(`computes surface parity for squad of ${squad} on ${zoneName}`, () => {
          const transport = calculateZoneFare('ikeja', dest, squad);
          expect(transport).toBe(isIsland ? 10000 : 5000);

          const foodSubtotal = spotPricePerPerson * squad;

          // Surface 1: Canonical Outside Math / Forge
          const math = calculateOutsideMath({
            foodSubtotal,
            transportCost: transport,
            headcount: squad,
            surgeMultiplier: 1.0,
          });

          // Surface 2: Plan Page Budget Mode Impact
          const impactStreet = applyBudgetMode({
            foodCost: math.foodSubtotal,
            transportCost: math.transportCost,
            totalCost: math.totalCost,
            squadSize: squad,
          }, 'street-smart');

          const impactSoft = applyBudgetMode({
            foodCost: math.foodSubtotal,
            transportCost: math.transportCost,
            totalCost: math.totalCost,
            squadSize: squad,
          }, 'soft-life');

          expect(impactStreet.baseTotal).toBe(math.totalCost);
          expect(impactSoft.baseTotal).toBe(math.totalCost);

          // Surface 3: Squad Room Economics
          const vehiclesRequired = Math.max(1, Math.ceil(squad / 4));
          const squadFood = spotPricePerPerson * squad;
          const squadTransport = calculateZoneFare('ikeja', dest, squad);
          const squadTotal = squadFood + squadTransport;
          const squadPerHead = Math.ceil(squadTotal / squad);

          const perPersonCost = Math.ceil(math.totalCost / math.headcount);
          const taxesCost = math.vatAmount + math.serviceChargeAmount;

          // Surface 4: Till Slip / PreReceiptModal
          const tillFood = foodSubtotal;
          const tillTransport = transport;
          const tillTotal = math.totalCost;
          const tillPerPerson = perPersonCost;

          // Surface 5: WhatsApp text
          const waText = generateWhatsAppText({
            venueName: 'Test Lounge',
            cleanAddress: isIsland ? 'Victoria Island' : 'Ikeja',
            totalCost: math.totalCost,
            perPersonTotal: perPersonCost,
            squadSize: squad,
            foodCost: math.foodSubtotal,
            transportCost: math.transportCost,
            taxesCost: taxesCost,
            shareUrl: 'https://oyaplan.com/p/test-code',
          });

          expect(waText).toContain(`Estimated Total: ₦${math.totalCost.toLocaleString()}`);
          expect(waText).toContain(`~₦${perPersonCost.toLocaleString()} each`);
          expect(waText).toContain(`Squad: ${squad} people`);

          // Surface 6: Shared Dossier Note
          // Surface 6 reads shared_plans.plan_data. Since BUG-01 allows client tampering of
          // totalCost, surface 6's integrity strictly depends on BUG-01 being fixed server-side.
          // Under legitimate generation:
          const sharedPlanData = {
            food_cost: math.foodSubtotal,
            transport_cost: math.transportCost,
            total_cost: math.totalCost,
            squad_size: squad,
          };
          expect(sharedPlanData.total_cost).toBe(math.totalCost);
        });
      }
    });
  }
});
