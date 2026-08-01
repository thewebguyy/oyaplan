import { describe, it, expect } from 'vitest';
import { PlanningEngineV1, createPlanningContext } from './planningEngine';
import type { Spot } from '../types';
import type { PlanningRequest } from './types';

function makeMockSpot(idNumber: number): Spot {
  return {
    id: `spot-${idNumber}-uuid-segment-placeholder`,
    name: `Spot ${idNumber}`,
    address: `${idNumber} Danfo Drive`,
    address_slug: idNumber % 3 === 0 ? 'yaba' : idNumber % 3 === 1 ? 'ikeja' : 'vi',
    area_id: `area-${idNumber % 3}`,
    vibe_tags: idNumber % 2 === 0 ? ['Chill'] : ['Dinner', 'Foodie'],
    price_per_person: 2000 + (idNumber * 50) % 50000,
    transport_matrix: {},
    is_featured: idNumber % 10 === 0,
    active: true,
    category: idNumber % 5 === 0 ? 'bar' : 'restaurant',
    has_food: true,
    typical_duration_hours: 2,
    zone: idNumber % 3 === 0 ? 'central' : idNumber % 3 === 1 ? 'mainland' : 'island',
    computed_confidence_score: 50 + (idNumber % 50),
    verified_by: 'verified',
    price_updated_at: '2026-08-01T12:00:00Z',
    price_source: 'manual'
  };
}

describe('Planning Engine Performance Benchmarks', () => {
  const request: PlanningRequest = {
    startArea: 'yaba',
    squadSize: 4,
    budget: 150000,
    vibe: 'Chill'
  };
  const context = createPlanningContext(request);

  const sizes = [50, 100, 500, 1000];

  sizes.forEach(size => {
    it(`executes successfully for ${size} spots`, () => {
      // 1. Generate spots payload
      const spots: Spot[] = Array.from({ length: size }, (_, i) => makeMockSpot(i));

      // Warmup run
      PlanningEngineV1(context, spots);

      // 2. Measure actual runs
      const iterations = 50;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        PlanningEngineV1(context, spots);
      }

      const totalTime = performance.now() - startTime;
      const avgTime = totalTime / iterations;

      console.log(`[PlanningEngine V1 Benchmark] size=${size} spots, average execution time: ${avgTime.toFixed(4)}ms`);

      // Baseline expectations: even with 1000 spots, in-memory filter + sort must be sub-15ms
      expect(avgTime).toBeLessThan(15.0); // Fail test if there is a massive latency regression
    });
  });
});
