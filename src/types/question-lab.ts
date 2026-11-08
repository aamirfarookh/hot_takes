/**
 * Question Intelligence Module (Question Lab) Types
 */

export type BiasFlagType =
  | "leading_wording"
  | "social_desirability_risk"
  | "double_barrelled"
  | "abstract_unanchored"
  | "predictable_pattern_risk";

export interface BiasFlag {
  flag: BiasFlagType;
  displayName: string;
  severity: 0 | 1 | 2 | 3; // 0 = None, 1 = Low, 2 = Moderate, 3 = Critical
  explanation: string;
  mitigation: string;
}

export type RecommendedFormat =
  | "trade_off_budget_allocation"
  | "forced_choice"
  | "scenario"
  | "ranking"
  | "implicit_association"
  | "likert";

export interface QuestionAnalysisResult {
  originalQuestion: string;
  biasFlags: BiasFlag[];
  overallRiskScore: number; // 0-100
  recommendedFormat: {
    format: RecommendedFormat;
    displayName: string;
    rationale: string;
  };
  redesignedConcept: {
    title: string;
    behaviouralVersion: string;
    gamifiedMechanic: string;
    participantTimeEstimate: string;
    primaryBehavioralMetric: string;
  };
  constructPreservation: {
    isPreserved: boolean;
    constructBeingMeasured: string;
    analysis: string;
    tradeOffs: string;
    fidelityScore: number; // 0-100
  };
  isHeuristicFallback?: boolean;
}
