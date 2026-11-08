/**
 * Behavioral Event Taxonomy & Telemetry Schemas
 * Hot Takes Consumer Research Platform
 */

export type BehavioralEventType =
  | "session_start"
  | "screen_view"
  | "question_shown"
  | "card_hover"
  | "card_selected"
  | "selection_changed"
  | "budget_adjusted"
  | "disruption_shown"
  | "disruption_response"
  | "probe_answered"
  | "session_complete"
  | "session_abandon";

export interface BehavioralTelemetryEvent {
  sessionId: string;
  userId: string; // Anonymous persistent or ephemeral identifier
  timestamp: number;
  screenId: string;
  latencyMs: number; // Latency from immediate preceding event in session
  eventType: BehavioralEventType;
  payload: Record<string, unknown>;
}

export type QualityVerdict = "HIGH" | "REVIEW" | "LOW";

export type QualityReasonCode =
  | "SPEEDING"
  | "POSITION_BIAS"
  | "INCONSISTENT"
  | "SD_PATTERN"
  | "ATTENTION_FAILED"
  | "REVERSE_FRAME_FAILED"
  | "LOW_INTERACTION_DEPTH"
  | "TAB_BLUR_EXCESSIVE";

export interface ResponseQualityMetrics {
  responseQualityScore: number; // 0-100
  engagementScore: number; // 0-100
  verdict: QualityVerdict;
  reasonCodes: QualityReasonCode[];
  componentScores: {
    speedingScore: number; // 0-100 (penalty for sub-median rushing)
    positionScore: number; // 0-100 (penalty for straight-lining / edge bias)
    consistencyScore: number; // 0-100 (repeated scenario match)
    attentionScore: number; // 0 or 100 (disguised attention check)
    socialDesirabilityScore: number; // 0-100 (penalty for unconstrained virtue signaling)
    interactionDepthScore: number; // 0-100 (hovers, comparisons, reversals)
  };
  metrics: {
    totalDurationMs: number;
    avgSlotLatencyMs: number;
    hoverCount: number;
    reversalCount: number;
    selectionChangesCount: number;
    tabBlurCount: number;
    cardPositionsSelected: number[]; // Index of cards chosen in each slot
    isRepeatedChoiceConsistent: boolean;
    passedAttentionCheck: boolean;
    choseReverseFramedBadItem: boolean;
    alwaysPickedGreenest: boolean;
  };
}

export interface ResearchInsights {
  statedSustainabilityScore: number; // 1 to 5 (from Likert baseline)
  revealedSustainabilityShare: number; // 0% to 100% of chosen items that are certified sustainable
  statedVsRevealedGap: number; // Normalized gap: -1.0 to +1.0 (-100% to +100%)
  wtpPremiumCurve: {
    slotId: string;
    sustainablePremiumOffered: number;
    choseSustainable: boolean;
    switchedOnDisruption?: boolean;
    effectiveSurgeAccepted?: number;
  }[];
  maxPremiumAccepted: number; // Maximum ₹ premium paid for a certified sustainable item
  greenwashSusceptibilityScore: number; // 0 to 100% (chose vague buzzword decoy)
  greenwashItemsChosen: number;
  certifiedItemsChosen: number;
  cheapFastFashionChosen: number;
  totalBudgetSpent: number;
  initialBudget: number;
  finalBudget: number;
}
