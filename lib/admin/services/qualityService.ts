import { createServerClient } from "@/lib/supabase-server";
import { DataQualityIssue, TrustHealthMetrics } from "../types";

interface QualitySpotDbRow {
  id: string;
  name: string;
  cover_url?: string | null;
  price_per_person?: number | null;
  price_source?: string | null;
  verified_by?: string | null;
  computed_confidence_score?: number | null;
  transport_matrix?: Record<string, number> | null;
  area_id?: string | null;
  areas?: { name: string } | null;
}

export class QualityService {
  static async getTrustHealthMetrics(): Promise<TrustHealthMetrics> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("spots")
      .select("price_per_person, price_source, verified_by, transport_matrix");

    if (error || !data) {
      console.error("Failed to fetch trust health metrics:", error);
      return {
        totalSpots: 0,
        priceCoveragePct: 0,
        priceProvenancePct: 0,
        verifiedPct: 0,
        transportCoveragePct: 0,
      };
    }

    const total = data.length;
    if (total === 0) {
      return { totalSpots: 0, priceCoveragePct: 0, priceProvenancePct: 0, verifiedPct: 0, transportCoveragePct: 0 };
    }

    let priced = 0;
    let provenanced = 0;
    let verified = 0;
    let transport = 0;

    data.forEach((spot) => {
      if (spot.price_per_person && spot.price_per_person > 0) priced++;
      if (spot.price_source && spot.price_source.trim().length > 0) provenanced++;
      if (spot.verified_by === "owner_verified") verified++;
      if (spot.transport_matrix && Object.keys(spot.transport_matrix).length > 0) transport++;
    });

    return {
      totalSpots: total,
      priceCoveragePct: Math.round((priced / total) * 100),
      priceProvenancePct: Math.round((provenanced / total) * 100),
      verifiedPct: Math.round((verified / total) * 1000) / 10,
      transportCoveragePct: Math.round((transport / total) * 100),
    };
  }

  static async getChecklist(): Promise<DataQualityIssue[]> {
    const supabase = await createServerClient();
    const { data: spots, error } = await supabase
      .from("spots")
      .select("id, name, cover_url, price_per_person, price_source, verified_by, computed_confidence_score, area_id, areas(name)");

    if (error) {
      console.error("Failed to fetch spots for QualityService:", error);
      return [];
    }

    const items: DataQualityIssue[] = [];
    const now = new Date().toISOString();

    ((spots as unknown as QualitySpotDbRow[]) || []).forEach((spot) => {
      const areaName = spot.areas?.name || "Lagos";

      // 1. Unverified seed spot (Trust Risk)
      if (spot.verified_by !== "owner_verified") {
        items.push({
          id: `${spot.id}-unverified`,
          issue_type: "UNVERIFIED_PRICE_SOURCE",
          category: "trust_risk",
          severity: "medium",
          scope: "venue",
          venue_id: spot.id,
          venue_name: spot.name,
          area_name: areaName,
          price_source: spot.price_source || "manual",
          verified_by: spot.verified_by || "seed",
          reason: `Pricing source is '${spot.price_source || "manual"}' (verified_by: ${spot.verified_by || "seed"}). Needs scout/owner verification.`,
          detected_at: now,
        });
      }

      // 2. Low Confidence Score (Trust Risk)
      if (spot.computed_confidence_score !== undefined && spot.computed_confidence_score !== null && spot.computed_confidence_score < 60) {
        items.push({
          id: `${spot.id}-low-confidence`,
          issue_type: "LOW_CONFIDENCE",
          category: "trust_risk",
          severity: "high",
          scope: "venue",
          venue_id: spot.id,
          venue_name: spot.name,
          area_name: areaName,
          price_source: spot.price_source || "manual",
          verified_by: spot.verified_by || "seed",
          reason: `Computed confidence score is low (${spot.computed_confidence_score}/100).`,
          detected_at: now,
        });
      }

      // 3. Missing Hero Image (Experience Quality)
      if (!spot.cover_url || spot.cover_url.trim() === "") {
        items.push({
          id: `${spot.id}-no-hero`,
          issue_type: "MISSING_HERO",
          category: "experience_quality",
          severity: "low",
          scope: "venue",
          venue_id: spot.id,
          venue_name: spot.name,
          area_name: areaName,
          reason: "Venue is missing a cover image.",
          detected_at: now,
        });
      }
    });

    // Sort: trust_risk first, then by severity
    const severityMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    items.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category === "trust_risk" ? -1 : 1;
      }
      return severityMap[b.severity] - severityMap[a.severity];
    });

    return items;
  }
}
