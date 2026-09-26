import { createServerClient } from "@/lib/supabase-server";
import { DataQualityIssue, TrustHealthMetrics } from "../types";
import { TransportPricingProvider } from "@/lib/planning/transport";

interface QualitySpotDbRow {
  id: string;
  name: string;
  address_slug?: string | null;
  cover_url?: string | null;
  price_per_person?: number | null;
  price_source?: string | null;
  price_updated_at?: string | null;
  verified_by?: string | null;
  computed_confidence_score?: number | null;
  transport_matrix?: Record<string, number> | null;
  is_featured?: boolean | null;
  area_id?: string | null;
  areas?: { name: string; slug: string; active: boolean } | null;
}

interface EvidenceDbRow {
  id: string;
  venue_id: string;
  verification_status: string;
}

interface SpendReportDbRow {
  id: string;
  spot_id: string | null;
  estimated_total: number;
  actual_total: number;
}

export class QualityService {
  static async getTrustHealthMetrics(): Promise<TrustHealthMetrics> {
    const supabase = await createServerClient();
    
    const [spotsRes, evidenceRes] = await Promise.all([
      supabase.from("spots").select("id, price_per_person, price_source, verified_by, transport_matrix, address_slug, areas(slug)"),
      supabase.from("price_evidence").select("id, venue_id, verification_status"),
    ]);

    const data = (spotsRes.data as unknown as QualitySpotDbRow[]) || [];
    const evidence = (evidenceRes.data as unknown as EvidenceDbRow[]) || [];

    const verifiedVenueIds = new Set<string>();
    evidence.forEach((e) => {
      if (e.verification_status === "approved" && e.venue_id) {
        verifiedVenueIds.add(e.venue_id);
      }
    });

    const total = data.length;
    if (total === 0) {
      return {
        totalSpots: 0,
        priceCoveragePct: 0,
        priceProvenancePct: 0,
        evidenceCoveragePct: 0,
        verifiedPct: 0,
        transportCoveragePct: 0,
        criticalIssuesCount: 0,
        highIssuesCount: 0,
        mediumIssuesCount: 0,
        lowIssuesCount: 0,
        scannedAt: new Date().toISOString(),
      };
    }

    let priced = 0;
    let provenanced = 0;
    let verified = 0;
    let transportCovered = 0;

    data.forEach((spot) => {
      if (spot.price_per_person && spot.price_per_person > 0) priced++;
      if (spot.price_source && spot.price_source.trim().length > 0) provenanced++;
      if (spot.verified_by === "owner_verified" || verifiedVenueIds.has(spot.id)) verified++;
      
      const targetSlug = spot.address_slug || spot.areas?.slug;
      if (targetSlug) {
        transportCovered++;
      }
    });

    const issues = await this.getChecklist();
    const criticalCount = issues.filter((i) => i.severity === "critical").length;
    const highCount = issues.filter((i) => i.severity === "high").length;
    const mediumCount = issues.filter((i) => i.severity === "medium").length;
    const lowCount = issues.filter((i) => i.severity === "low").length;

    return {
      totalSpots: total,
      priceCoveragePct: Math.round((priced / total) * 100),
      priceProvenancePct: Math.round((provenanced / total) * 100),
      evidenceCoveragePct: Math.round((verifiedVenueIds.size / total) * 100),
      verifiedPct: Math.round((verified / total) * 1000) / 10,
      transportCoveragePct: Math.round((transportCovered / total) * 100),
      criticalIssuesCount: criticalCount,
      highIssuesCount: highCount,
      mediumIssuesCount: mediumCount,
      lowIssuesCount: lowCount,
      scannedAt: new Date().toISOString(),
    };
  }

  static async getChecklist(): Promise<DataQualityIssue[]> {
    const supabase = await createServerClient();
    
    const [spotsRes, evidenceRes, spendRes] = await Promise.all([
      supabase.from("spots").select("id, name, address_slug, cover_url, price_per_person, price_source, price_updated_at, verified_by, computed_confidence_score, transport_matrix, is_featured, area_id, areas(name, slug, active)"),
      supabase.from("price_evidence").select("id, venue_id, verification_status"),
      supabase.from("actual_spend_reports").select("id, spot_id, estimated_total, actual_total"),
    ]);

    if (spotsRes.error) {
      console.error("Failed to fetch spots for QualityService:", spotsRes.error);
      return [];
    }

    const spots = (spotsRes.data as unknown as QualitySpotDbRow[]) || [];
    const evidence = (evidenceRes.data as unknown as EvidenceDbRow[]) || [];
    const spendReports = (spendRes.data as unknown as SpendReportDbRow[]) || [];

    // Map verified evidence counts by venue_id
    const evidenceCountMap = new Map<string, number>();
    evidence.forEach((e) => {
      if (e.verification_status === "approved" && e.venue_id) {
        evidenceCountMap.set(e.venue_id, (evidenceCountMap.get(e.venue_id) || 0) + 1);
      }
    });

    // Map actual spend discrepancies by spot_id (>15% threshold per Phase 9 operating model)
    const spendDiscrepancyMap = new Map<string, { count: number; maxVariancePct: number }>();
    spendReports.forEach((r) => {
      if (r.spot_id && r.estimated_total > 0 && r.actual_total > 0) {
        const variance = Math.abs(r.actual_total - r.estimated_total) / r.estimated_total;
        if (variance >= 0.15) {
          const current = spendDiscrepancyMap.get(r.spot_id) || { count: 0, maxVariancePct: 0 };
          current.count++;
          current.maxVariancePct = Math.max(current.maxVariancePct, Math.round(variance * 100));
          spendDiscrepancyMap.set(r.spot_id, current);
        }
      }
    });

    const items: DataQualityIssue[] = [];
    const now = new Date().toISOString();
    const BETA_AREA_SLUGS = ["ikeja", "yaba", "vi", "lekki-phase-1"];

    spots.forEach((spot) => {
      const areaName = spot.areas?.name || "Lagos";
      const areaSlug = spot.areas?.slug || "";
      const evidenceCount = evidenceCountMap.get(spot.id) || 0;
      const isOwnerVerified = spot.verified_by === "owner_verified";

      // Calculate Customer Exposure factor (traffic tier + pricing weight)
      const isTopArea = BETA_AREA_SLUGS.includes(areaSlug);
      const isHighTraffic = Boolean(spot.is_featured || (spot.price_per_person && spot.price_per_person >= 20000));
      const customerExposure = (isTopArea ? 50 : 10) + (isHighTraffic ? 100 : 0) + Math.min(100, Math.floor((spot.price_per_person || 0) / 1000));

      // ─────────────────────────────────────────────────────────────────
      // P0 — Price Trust: NO_PRICE_EVIDENCE (Critical)
      // ─────────────────────────────────────────────────────────────────
      if (evidenceCount === 0 && !isOwnerVerified) {
        const priceStr = spot.price_per_person ? `₦${spot.price_per_person.toLocaleString()}` : "unpriced";
        items.push({
          id: `${spot.id}-no-price-evidence`,
          issue_type: "NO_PRICE_EVIDENCE",
          category: "trust_risk",
          severity: "critical",
          scope: "venue",
          venue_id: spot.id,
          venue_name: spot.name,
          venue_slug: spot.address_slug || spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          area_name: areaName,
          price_per_person: spot.price_per_person || undefined,
          price_source: spot.price_source || "seed",
          verified_by: spot.verified_by || "seed",
          evidence_count: 0,
          customer_exposure: customerExposure,
          impact_score: 1000 + customerExposure,
          impact_description: `Customer may be misled on expected spend (${priceStr})`,
          reason: `Venue has pricing (${priceStr}) but 0 verified price-evidence records.`,
          action_label: "Add Evidence",
          detected_at: now,
        });
      } else if (spot.computed_confidence_score !== undefined && spot.computed_confidence_score !== null && spot.computed_confidence_score < 60) {
        // Low Confidence Score (High)
        items.push({
          id: `${spot.id}-low-confidence`,
          issue_type: "LOW_CONFIDENCE",
          category: "trust_risk",
          severity: "high",
          scope: "venue",
          venue_id: spot.id,
          venue_name: spot.name,
          venue_slug: spot.address_slug || spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          area_name: areaName,
          price_per_person: spot.price_per_person || undefined,
          price_source: spot.price_source || "seed",
          verified_by: spot.verified_by || "seed",
          evidence_count: evidenceCount,
          customer_exposure: customerExposure,
          impact_score: 500 + customerExposure,
          impact_description: `Computed confidence score is low (${spot.computed_confidence_score}/100)`,
          reason: `Pricing model confidence is low (${spot.computed_confidence_score}/100).`,
          action_label: "Add Evidence",
          detected_at: now,
        });
      }

      // ─────────────────────────────────────────────────────────────────
      // P1 — Transport Trust: TRANSPORT_GAP (High)
      // Canonical transport check: verify engine can calculate valid fare
      // ─────────────────────────────────────────────────────────────────
      const targetSlug = spot.address_slug || spot.areas?.slug;
      let hasTransportGap = false;
      if (!targetSlug) {
        hasTransportGap = true;
      } else {
        try {
          const testRange = TransportPricingProvider.calculateRange(
            "ikeja",
            targetSlug,
            "ride-hailing",
            spot.transport_matrix || undefined
          );
          if (!testRange || testRange.midpointCost <= 0) {
            hasTransportGap = true;
          }
        } catch {
          hasTransportGap = true;
        }
      }

      if (hasTransportGap) {
        items.push({
          id: `${spot.id}-transport-gap`,
          issue_type: "TRANSPORT_GAP",
          category: "transport_risk",
          severity: "high",
          scope: "venue",
          venue_id: spot.id,
          venue_name: spot.name,
          venue_slug: spot.address_slug || spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          area_name: areaName,
          customer_exposure: customerExposure,
          impact_score: 500 + customerExposure,
          impact_description: "Transport engine cannot produce calibrated fare estimate",
          reason: `Destination slug '${targetSlug}' is unresolvable by the canonical transport engine.`,
          action_label: "Fix Transport",
          detected_at: now,
        });
      }

      // ─────────────────────────────────────────────────────────────────
      // P1 — Actual Spend Discrepancy: ACTUAL_SPEND_MISMATCH (High / Med)
      // ─────────────────────────────────────────────────────────────────
      const spendDiscrepancy = spendDiscrepancyMap.get(spot.id);
      if (spendDiscrepancy) {
        const isHighVariance = spendDiscrepancy.maxVariancePct >= 30;
        items.push({
          id: `${spot.id}-spend-mismatch`,
          issue_type: "ACTUAL_SPEND_MISMATCH",
          category: "spend_discrepancy",
          severity: isHighVariance ? "high" : "medium",
          scope: "venue",
          venue_id: spot.id,
          venue_name: spot.name,
          venue_slug: spot.address_slug || spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          area_name: areaName,
          customer_exposure: customerExposure,
          impact_score: (isHighVariance ? 500 : 200) + customerExposure,
          impact_description: `Actual spend differs by ${spendDiscrepancy.maxVariancePct}% from estimate`,
          reason: `${spendDiscrepancy.count} post-outing report(s) show up to ${spendDiscrepancy.maxVariancePct}% variance from estimate (${isHighVariance ? "reverification urgent" : "reverification required within 48h"}).`,
          action_label: isHighVariance ? "Audit Venue" : "Investigate",
          detected_at: now,
        });
      }

      // ─────────────────────────────────────────────────────────────────
      // P1 — Data Freshness: STALE_PRICING (>30d Medium, >60d High)
      // ─────────────────────────────────────────────────────────────────
      if (spot.price_updated_at) {
        const daysAgo = Math.floor((Date.now() - new Date(spot.price_updated_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo > 30) {
          const isCriticalStale = daysAgo > 60;
          items.push({
            id: `${spot.id}-stale-pricing`,
            issue_type: "STALE_PRICING",
            category: "trust_risk",
            severity: isCriticalStale ? "high" : "medium",
            scope: "venue",
            venue_id: spot.id,
            venue_name: spot.name,
            venue_slug: spot.address_slug || spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            area_name: areaName,
            customer_exposure: customerExposure,
            impact_score: (isCriticalStale ? 400 : 150) + customerExposure,
            impact_description: `Pricing unverified for ${daysAgo} days (${isCriticalStale ? "deprioritize from suggestions" : "queue reverification"})`,
            reason: `Last verified ${daysAgo} days ago on ${new Date(spot.price_updated_at).toLocaleDateString("en-NG")}.`,
            action_label: "Reverify",
            detected_at: now,
          });
        }
      }

      // ─────────────────────────────────────────────────────────────────
      // P2 — Image Quality: MISSING_HERO (Medium)
      // ─────────────────────────────────────────────────────────────────
      if (!spot.cover_url || spot.cover_url.trim() === "") {
        items.push({
          id: `${spot.id}-no-hero`,
          issue_type: "MISSING_HERO",
          category: "experience_quality",
          severity: "medium",
          scope: "venue",
          venue_id: spot.id,
          venue_name: spot.name,
          venue_slug: spot.address_slug || spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          area_name: areaName,
          customer_exposure: customerExposure,
          impact_score: 200 + customerExposure,
          impact_description: "Poor decision confidence / missing visual verification",
          reason: "Venue is missing a cover hero photo.",
          action_label: "Set Image",
          detected_at: now,
        });
      }

      // ─────────────────────────────────────────────────────────────────
      // P2 — Area Bounds (Low)
      // ─────────────────────────────────────────────────────────────────
      const isBetaArea = BETA_AREA_SLUGS.includes(areaSlug);
      if (!isBetaArea && spot.areas) {
        items.push({
          id: `${spot.id}-out-of-bounds`,
          issue_type: "OUT_OF_BOUNDS_AREA",
          category: "experience_quality",
          severity: "low",
          scope: "venue",
          venue_id: spot.id,
          venue_name: spot.name,
          venue_slug: spot.address_slug || spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          area_name: areaName,
          customer_exposure: customerExposure,
          impact_score: 50 + customerExposure,
          impact_description: `Venue is in deactivated area '${areaName}'`,
          reason: `Area '${areaName}' (${areaSlug}) is deactivated for beta release.`,
          action_label: "Review Spot",
          detected_at: now,
        });
      }
    });

    // Sort by impact_score descending (which blends severity base weight + customer exposure)
    items.sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0));

    return items;
  }
}
