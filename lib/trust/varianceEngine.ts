/**
 * OyaPlan Trust & Variance Intelligence Engine
 *
 * Implements mathematical variance calculations, multi-factor variance classification,
 * freshness & threshold operational triggers, and data quality metrics.
 */

export type VarianceSeverity = 
  | "accurate"               // -10% to +10%
  | "mild_drift"              // +10.1% to +15% or -10.1% to -15%
  | "reverification_required" // > +15% to +30%
  | "severe_discrepancy";     // > +30% or < -30%

export type VarianceSource = 
  | "venue_pricing_discrepancy"
  | "transport_surge"
  | "squad_size_change"
  | "user_choice_upgrade"
  | "unspecified_variance";

export interface VarianceAnalysis {
  estimatedTotal: number;
  actualTotal: number;
  varianceAmount: number;
  variancePercentage: number;
  severity: VarianceSeverity;
  source: VarianceSource;
  operationalTrigger: {
    actionRequired: boolean;
    urgency: "none" | "routine" | "urgent" | "critical";
    recommendedAction: string;
  };
}

export interface VarianceCalculationInput {
  estimatedTotal: number;
  actualTotal: number;
  plannedSquadSize?: number;
  actualSquadSize?: number;
  estimatedTransport?: number;
  actualTransport?: number;
  estimatedFood?: number;
  actualFood?: number;
  userNotes?: string | null;
  pricesMatchedAnswer?: "yes" | "mostly" | "no" | "not_sure" | null;
}

export class VarianceEngine {
  /**
   * Calculates mathematical variance between estimate and actual spend.
   * Safe against 0 denominators, negative values, and non-integer inputs.
   */
  static calculateVariance(actualTotal: number, estimatedTotal: number): {
    amount: number;
    percentage: number;
  } {
    if (!estimatedTotal || estimatedTotal <= 0 || !actualTotal || actualTotal <= 0) {
      return { amount: 0, percentage: 0 };
    }

    const amount = actualTotal - estimatedTotal;
    const percentage = Number((((actualTotal - estimatedTotal) / estimatedTotal) * 100).toFixed(1));

    return { amount, percentage };
  }

  /**
   * Classifies the variance and determines whether operational reverification is triggered.
   */
  static analyzeVariance(input: VarianceCalculationInput): VarianceAnalysis {
    const { amount, percentage } = this.calculateVariance(input.actualTotal, input.estimatedTotal);
    const absPct = Math.abs(percentage);

    // 1. Determine Severity
    let severity: VarianceSeverity = "accurate";
    if (absPct <= 10) {
      severity = "accurate";
    } else if (absPct <= 15) {
      severity = "mild_drift";
    } else if (absPct <= 30) {
      severity = "reverification_required";
    } else {
      severity = "severe_discrepancy";
    }

    // 2. Classify Source Factor
    let source: VarianceSource = "unspecified_variance";

    if (input.plannedSquadSize && input.actualSquadSize && input.plannedSquadSize !== input.actualSquadSize) {
      source = "squad_size_change";
    } else if (
      input.actualTransport !== undefined &&
      input.estimatedTransport !== undefined &&
      Math.abs(input.actualTransport - input.estimatedTransport) >= Math.abs(amount) * 0.6
    ) {
      source = "transport_surge";
    } else if (
      input.pricesMatchedAnswer === "no" ||
      (input.actualFood !== undefined && input.estimatedFood !== undefined && Math.abs(input.actualFood - input.estimatedFood) > 0)
    ) {
      source = "venue_pricing_discrepancy";
    } else if (
      input.userNotes &&
      /extra|bottle|vip|ordered more|celebrat|upgrade/i.test(input.userNotes)
    ) {
      source = "user_choice_upgrade";
    }

    // 3. Operational Action Triggers
    const operationalTrigger = this.determineOperationalAction(severity, source);

    return {
      estimatedTotal: input.estimatedTotal,
      actualTotal: input.actualTotal,
      varianceAmount: amount,
      variancePercentage: percentage,
      severity,
      source,
      operationalTrigger,
    };
  }

  /**
   * Evaluates operational reverification rules:
   * > 15% -> Reverification within 48h
   * > 30% -> Urgent escalation / review
   */
  static determineOperationalAction(
    severity: VarianceSeverity,
    source: VarianceSource
  ): {
    actionRequired: boolean;
    urgency: "none" | "routine" | "urgent" | "critical";
    recommendedAction: string;
  } {
    // If variance is driven strictly by squad size change or user choice, do not penalize venue
    if (source === "squad_size_change" || source === "user_choice_upgrade") {
      return {
        actionRequired: false,
        urgency: "none",
        recommendedAction: "No venue action required (squad/choice variance).",
      };
    }

    if (source === "transport_surge") {
      return {
        actionRequired: severity === "severe_discrepancy",
        urgency: severity === "severe_discrepancy" ? "routine" : "none",
        recommendedAction: "Review transport calibration for this route.",
      };
    }

    switch (severity) {
      case "severe_discrepancy":
        return {
          actionRequired: true,
          urgency: "critical",
          recommendedAction: "Escalate for founder review and queue urgent menu audit within 24h.",
        };
      case "reverification_required":
        return {
          actionRequired: true,
          urgency: "urgent",
          recommendedAction: "Queue venue pricing reverification within 48h.",
        };
      case "mild_drift":
        return {
          actionRequired: false,
          urgency: "routine",
          recommendedAction: "Monitor next 2 reports for recurring drift.",
        };
      case "accurate":
      default:
        return {
          actionRequired: false,
          urgency: "none",
          recommendedAction: "Pricing confirmed accurate within ±10%.",
        };
    }
  }

  /**
   * Computes the North Star Metric:
   * "% of outings where actual spend is within ±10% of estimate"
   * Enforces minimum sample size discipline (minimum 3 reports).
   */
  static calculateNorthStarAccuracy(
    reports: Array<{ actualTotal: number; estimatedTotal: number; squadMatch?: boolean }>
  ): {
    sampleSize: number;
    accuracyPercentage: number | null;
    status: "insufficient_data" | "emerging" | "supported";
    withinTenPctCount: number;
  } {
    // Exclude invalid or changed-squad rows
    const validReports = reports.filter(
      (r) => r.estimatedTotal > 0 && r.actualTotal > 0 && (r.squadMatch === undefined || r.squadMatch === true)
    );

    const sampleSize = validReports.length;

    if (sampleSize < 3) {
      return {
        sampleSize,
        accuracyPercentage: null,
        status: "insufficient_data",
        withinTenPctCount: 0,
      };
    }

    const withinTenPctCount = validReports.filter((r) => {
      const variance = Math.abs(((r.actualTotal - r.estimatedTotal) / r.estimatedTotal) * 100);
      return variance <= 10;
    }).length;

    const accuracyPercentage = Number(((withinTenPctCount / sampleSize) * 100).toFixed(1));
    const status = sampleSize >= 10 ? "supported" : "emerging";

    return {
      sampleSize,
      accuracyPercentage,
      status,
      withinTenPctCount,
    };
  }

  /**
   * Evaluates freshness operational thresholds:
   * > 30 days: queue for reverification
   * > 60 days: remove/deprioritize from active suggestions
   */
  static evaluateFreshness(lastVerifiedAtIso?: string | null): {
    daysAgo: number | null;
    status: "fresh" | "needs_reverification" | "stale_deprioritize";
    isStale: boolean;
  } {
    if (!lastVerifiedAtIso) {
      return { daysAgo: null, status: "needs_reverification", isStale: true };
    }

    const verifiedDate = new Date(lastVerifiedAtIso).getTime();
    const daysAgo = Math.floor((Date.now() - verifiedDate) / (1000 * 60 * 60 * 24));

    if (daysAgo > 60) {
      return { daysAgo, status: "stale_deprioritize", isStale: true };
    }
    if (daysAgo > 30) {
      return { daysAgo, status: "needs_reverification", isStale: true };
    }

    return { daysAgo, status: "fresh", isStale: false };
  }
}
