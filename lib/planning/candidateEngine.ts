import { Spot } from '../types';
import { CandidateEngine, PlanningContext, PlanningCandidate } from './types';
import { isSpotInArea, getZoneForArea } from './utils';

const CATEGORY_MAP: Record<string, string[]> = {
  "Eat and drink": ["restaurant", "bar", "cafe"],
  "Activity and fun": ["activity", "entertainment", "experience"],
  "Nature and outdoors": ["nature", "beach"]
};

const ADJACENT_ZONES: Record<string, string[]> = {
  mainland: ["mainland", "central"],
  central: ["central", "mainland"],
  island: ["island", "central"],
  other: ["other", "central"],
};

export class DefaultCandidateEngine implements CandidateEngine {
  run(spots: Spot[], context: PlanningContext): PlanningCandidate[] {
    const { startArea, vibe, pinnedSpotId, categoryGroup, daypart, isAdjacent } = context.request;
    const hasSpecificArea = Boolean(startArea && startArea !== "Anywhere" && startArea !== "anywhere");

    const filtered = spots.filter((spot) => {
      // Hard check: active spots only
      if (spot.active === false) return false;

      // Daypart Filter
      if (daypart && daypart !== "Any time") {
        const cat = spot.category || "restaurant";
        const duration = spot.typical_duration_hours || 0;

        if (daypart === "Morning") {
          if (["bar", "entertainment", "beach"].includes(cat)) return false;
        } else if (daypart === "Night") {
          if (["nature", "beach"].includes(cat)) return false;
          if (cat === "activity" && duration > 2) return false;
        }
      }

      // Category Group Filter
      if (categoryGroup && categoryGroup !== "Anywhere") {
        const allowedCategories = CATEGORY_MAP[categoryGroup] || [];
        const spotCategory = spot.category || "restaurant";
        if (!allowedCategories.includes(spotCategory)) return false;
      }

      // Location checks
      if (isAdjacent) {
        if (!startArea || startArea === "anywhere" || startArea === "Anywhere") return false;

        // Must NOT be in the selected area itself
        if (isSpotInArea(spot, startArea)) return false;

        // Must be in same or adjacent zone
        const spotAreaSlug = spot.address_slug || spot.areas?.slug || "";
        const spotZone = getZoneForArea(spotAreaSlug);
        const originZone = getZoneForArea(startArea);
        const allowedZones = ADJACENT_ZONES[originZone] || [originZone];
        if (!allowedZones.includes(spotZone)) return false;
      } else {
        // STRICT LOCATION FILTER (pinnedSpotId bypasses this)
        if (hasSpecificArea && startArea && !isSpotInArea(spot, startArea)) {
          if (spot.id !== pinnedSpotId) return false;
        }
      }


      // Vibe Filter (pinnedSpotId bypasses this)
      if (spot.id === pinnedSpotId) return true;
      if (!vibe) return true;
      return spot.vibe_tags.includes(vibe);
    });

    return filtered.map(spot => ({ spot }));
  }
}
