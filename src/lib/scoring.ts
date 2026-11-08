/**
 * Response Quality & Engagement Scoring Engine
 * Hot Takes Behavioral Intelligence Engine
 * 
 * NOTE: The weights below are heuristic initial baselines designed for cold-start
 * survey instrument evaluation. In production, these parameters are continuously
 * calibrated against gold-standard trap question pass rates, seeded adversarial
 * sessions, and cross-study empirical verification.
 */

import type {
  ResponseQualityMetrics,
  QualityVerdict,
  QualityReasonCode,
  ResearchInsights,
} from "../types/telemetry.ts";
import type { ProductCard, ClosetPersonality } from "../types/game.ts";

export interface ScoringHeuristicConfig {
  /**
   * Expected human cognitive deliberation medians (in milliseconds)
   */
  expectedMedianDecisionTimeMs: number; // e.g. 7,000ms per card decision
  minHumanSpeedLimitMs: number; // Under 2,200ms is mechanically implausible for reading 4 cards
  
  /**
   * Response Quality Score component weights (Sum = 100)
   * Rationale:
   * - attentionCheck (25%): Hard failure directly indicates satisficing / bot activity
   * - consistency (20%): Repeated choice scenario with swapped positions catches random clicking
   * - speeding (20%): Extremely fast selections fail human reading threshold
   * - positionBias (15%): Straight-lining (picking card 0 or card 3 across every slot) indicates mechanical bias
   * - socialDesirabilityPattern (10%): Auto-picking sustainable regardless of price/budget without inspecting attributes
   * - interactionDepth (10%): Natural humans hover, compare, or revise choices
   */
  weights: {
    attentionCheck: number; // 25
    consistency: number;    // 20
    speeding: number;       // 20
    positionBias: number;   // 15
    socialDesirability: number; // 10
    interactionDepth: number;   // 10
  };

  /**
   * Thresholds for verdict bands
   */
  thresholds: {
    highQualityMin: number; // >= 75
    reviewQualityMin: number; // 50 - 74 (< 50 is LOW)
  };
}

export const DEFAULT_SCORING_CONFIG: ScoringHeuristicConfig = {
  expectedMedianDecisionTimeMs: 7_000,
  minHumanSpeedLimitMs: 2_200,
  weights: {
    attentionCheck: 25,
    consistency: 20,
    speeding: 20,
    positionBias: 15,
    socialDesirability: 10,
    interactionDepth: 10,
  },
  thresholds: {
    highQualityMin: 75,
    reviewQualityMin: 50,
  },
};

export interface SessionScoringInput {
  totalDurationMs: number;
  slotDecisionLatenciesMs: number[];
  cardPositionsSelected: number[]; // e.g. [0, 1, 0, 2, 0]
  hoverCount: number;
  reversalCount: number;
  selectionChangesCount: number;
  tabBlurCount: number;
  
  // Probe results
  repeatedScenarioChoice1Id: string | null;
  repeatedScenarioChoice2Id: string | null;
  passedAttentionCheck: boolean;
  choseReverseFramedBadItem: boolean;
  
  // Game selections
  selectedItems: ProductCard[];
  totalBudget: number;
  spentBudget: number;
  statedSustainabilityLikert: number; // 1 to 5
}

/**
 * Calculates Response Quality Score (0-100) and Engagement Score (0-100)
 * along with explainable diagnostic reason codes and research metrics.
 */
export function computeResponseQuality(
  input: SessionScoringInput,
  config: ScoringHeuristicConfig = DEFAULT_SCORING_CONFIG
): {
  quality: ResponseQualityMetrics;
  insights: ResearchInsights;
  personality: ClosetPersonality;
} {
  const reasonCodes: QualityReasonCode[] = [];
  const { weights, thresholds } = config;

  // 1. Attention Check Component (0 or 100)
  const attentionScore = input.passedAttentionCheck ? 100 : 0;
  if (!input.passedAttentionCheck) {
    reasonCodes.push("ATTENTION_FAILED");
  }

  // 2. Consistency Component (Repeated Choice with Swapped Positions)
  const isRepeatedChoiceConsistent =
    Boolean(input.repeatedScenarioChoice1Id && input.repeatedScenarioChoice2Id) &&
    input.repeatedScenarioChoice1Id === input.repeatedScenarioChoice2Id;
  
  const consistencyScore = isRepeatedChoiceConsistent ? 100 : 0;
  if (!isRepeatedChoiceConsistent && input.repeatedScenarioChoice1Id && input.repeatedScenarioChoice2Id) {
    reasonCodes.push("INCONSISTENT");
  }

  // 3. Speeding Component (Decision time vs expected median)
  const avgDecisionMs =
    input.slotDecisionLatenciesMs.length > 0
      ? input.slotDecisionLatenciesMs.reduce((a, b) => a + b, 0) /
        input.slotDecisionLatenciesMs.length
      : input.totalDurationMs / Math.max(1, input.selectedItems.length);

  let speedingScore = 100;
  if (avgDecisionMs < config.minHumanSpeedLimitMs) {
    // Severe speedrun penalty: below reading threshold
    const ratio = Math.max(0, avgDecisionMs / config.minHumanSpeedLimitMs);
    speedingScore = Math.round(ratio * 40); // Max 40/100
    reasonCodes.push("SPEEDING");
  } else if (avgDecisionMs < config.expectedMedianDecisionTimeMs) {
    // Moderate gradient
    const progress =
      (avgDecisionMs - config.minHumanSpeedLimitMs) /
      (config.expectedMedianDecisionTimeMs - config.minHumanSpeedLimitMs);
    speedingScore = Math.round(50 + progress * 50);
  }

  // 4. Straight-lining / Position Bias Component
  // Detect if user repeatedly picks index 0 (first card) or index 3 (last card)
  let positionScore = 100;
  if (input.cardPositionsSelected.length >= 3) {
    const totalSlots = input.cardPositionsSelected.length;
    const countIndex0 = input.cardPositionsSelected.filter((p) => p === 0).length;
    const countIndexLast = input.cardPositionsSelected.filter((p) => p >= 2).length;
    
    const maxStraightLineShare = Math.max(countIndex0, countIndexLast) / totalSlots;
    if (maxStraightLineShare >= 0.8) {
      positionScore = 15;
      reasonCodes.push("POSITION_BIAS");
    } else if (maxStraightLineShare >= 0.6) {
      positionScore = 55;
    }
  }

  // 5. Social Desirability / Virtue-Signaling Pattern
  // Detect if user clicked 100% sustainable items without hesitating or checking prices
  const certifiedItems = input.selectedItems.filter(
    (i) => i.sustainabilityTier === "certified_sustainable"
  );
  const alwaysPickedGreenest =
    input.selectedItems.length >= 4 &&
    certifiedItems.length === input.selectedItems.length;

  let socialDesirabilityScore = 100;
  if (alwaysPickedGreenest && input.selectionChangesCount === 0 && avgDecisionMs < 4_000) {
    // Unrealistic virtue signaling on autopilot
    socialDesirabilityScore = 40;
    reasonCodes.push("SD_PATTERN");
  }

  // 6. Interaction Depth Component (Hovers, Comparisons, Reversals)
  const totalInteractions =
    input.hoverCount + input.reversalCount + input.selectionChangesCount;
  let interactionDepthScore = Math.min(100, Math.round((totalInteractions / 8) * 100));
  if (totalInteractions < 2) {
    interactionDepthScore = 25;
    reasonCodes.push("LOW_INTERACTION_DEPTH");
  }

  // 7. Check reverse framed failure
  if (input.choseReverseFramedBadItem) {
    reasonCodes.push("REVERSE_FRAME_FAILED");
  }

  // 8. Tab Blur Check
  if (input.tabBlurCount >= 4) {
    reasonCodes.push("TAB_BLUR_EXCESSIVE");
  }

  // Weighted RQS calculation
  const totalRQS = Math.round(
    (attentionScore * weights.attentionCheck +
      consistencyScore * weights.consistency +
      speedingScore * weights.speeding +
      positionScore * weights.positionBias +
      socialDesirabilityScore * weights.socialDesirability +
      interactionDepthScore * weights.interactionDepth) /
      100
  );

  // Apply tab blur penalty if present
  const blurPenalty = Math.min(input.tabBlurCount * 4, 16);
  const reverseFramePenalty = input.choseReverseFramedBadItem ? 15 : 0;
  const finalRQS = Math.max(0, Math.min(100, totalRQS - blurPenalty - reverseFramePenalty));

  // Determine Quality Verdict Band
  let verdict: QualityVerdict = "LOW";
  if (finalRQS >= thresholds.highQualityMin) {
    verdict = "HIGH";
  } else if (finalRQS >= thresholds.reviewQualityMin) {
    verdict = "REVIEW";
  }

  // Engagement Score (Measures active human energy and focus, independent of correctness)
  const durationNorm = Math.min(input.totalDurationMs / 45_000, 1.0) * 35; // 35 pts
  const interactionNorm = Math.min(totalInteractions / 12, 1.0) * 45; // 45 pts
  const hoverNorm = Math.min(input.hoverCount / 8, 1.0) * 20; // 20 pts
  const engagementScore = Math.round(
    Math.max(0, Math.min(100, (durationNorm + interactionNorm + hoverNorm) * (1 - Math.min(input.tabBlurCount * 0.1, 0.4))))
  );

  // Compute Research Insights
  const totalItems = Math.max(1, input.selectedItems.length);
  const greenwashCount = input.selectedItems.filter(
    (i) => i.sustainabilityTier === "greenwashed_decoy"
  ).length;
  const certifiedCount = certifiedItems.length;
  const conventionalCount = input.selectedItems.filter(
    (i) => i.sustainabilityTier === "conventional_fast"
  ).length;

  const revealedSustainabilityShare = Math.round((certifiedCount / totalItems) * 100);
  // Stated 1-5 normalized to 0-100%: 1 -> 0%, 3 -> 50%, 5 -> 100%
  const statedNormalized = Math.round(((input.statedSustainabilityLikert - 1) / 4) * 100);
  
  // Stated vs Revealed Gap: Positive means stated higher than revealed (Hypocrisy / Social Desirability gap)
  const statedVsRevealedGap = statedNormalized - revealedSustainabilityShare;

  // Greenwash Susceptibility: share of choices fooled by vague claims
  const greenwashSusceptibilityScore = Math.round((greenwashCount / totalItems) * 100);

  // Willingness-To-Pay (WTP) Curve
  const wtpPremiumCurve = input.selectedItems.map((item) => {
    // Typical baseline non-sustainable item costs ~₹400-500
    const baselinePrice = 450;
    const premium = Math.max(0, item.price - baselinePrice);
    return {
      slotId: item.category,
      sustainablePremiumOffered: premium,
      choseSustainable: item.sustainabilityTier === "certified_sustainable",
      effectiveSurgeAccepted: item.sustainabilityTier === "certified_sustainable" ? premium : 0,
    };
  });

  const acceptedPremiums = input.selectedItems
    .filter((i) => i.sustainabilityTier === "certified_sustainable")
    .map((i) => Math.max(0, i.price - 450));
  const maxPremiumAccepted = acceptedPremiums.length > 0 ? Math.max(...acceptedPremiums) : 0;

  const insights: ResearchInsights = {
    statedSustainabilityScore: input.statedSustainabilityLikert,
    revealedSustainabilityShare,
    statedVsRevealedGap,
    wtpPremiumCurve,
    maxPremiumAccepted,
    greenwashSusceptibilityScore,
    greenwashItemsChosen: greenwashCount,
    certifiedItemsChosen: certifiedCount,
    cheapFastFashionChosen: conventionalCount,
    totalBudgetSpent: input.spentBudget,
    initialBudget: input.totalBudget,
    finalBudget: input.totalBudget - input.spentBudget,
  };

  // Determine Consumer Closet Personality Archetype
  const personality = classifyClosetPersonality(
    revealedSustainabilityShare,
    greenwashSusceptibilityScore,
    input.spentBudget,
    input.totalBudget
  );

  return {
    quality: {
      responseQualityScore: finalRQS,
      engagementScore,
      verdict,
      reasonCodes,
      componentScores: {
        speedingScore,
        positionScore,
        consistencyScore,
        attentionScore,
        socialDesirabilityScore,
        interactionDepthScore,
      },
      metrics: {
        totalDurationMs: input.totalDurationMs,
        avgSlotLatencyMs: Math.round(avgDecisionMs),
        hoverCount: input.hoverCount,
        reversalCount: input.reversalCount,
        selectionChangesCount: input.selectionChangesCount,
        tabBlurCount: input.tabBlurCount,
        cardPositionsSelected: input.cardPositionsSelected,
        isRepeatedChoiceConsistent,
        passedAttentionCheck: input.passedAttentionCheck,
        choseReverseFramedBadItem: input.choseReverseFramedBadItem,
        alwaysPickedGreenest,
      },
    },
    insights,
    personality,
  };
}

/**
 * Classifies participant into a fun consumer personality archetype
 */
export function classifyClosetPersonality(
  revealedShare: number,
  greenwashScore: number,
  spent: number,
  budget: number
): ClosetPersonality {
  if (revealedShare >= 60) {
    return {
      id: "conscious_curator",
      archetype: "Conscious Curator",
      tagline: "Principles first, wardrobe second.",
      description:
        "You actively pay a premium for verified certifications (GOTS organic, fair wages) even when budget constraints bite. Your actual trade-offs align with authentic sustainability.",
      badgeColor: "emerald",
      traits: ["High Revealed Eco-Index", "Resistant to Greenwashing", "Quality Over Quantity"],
    };
  }

  if (greenwashScore >= 40) {
    return {
      id: "eco_optimist_decoy",
      archetype: "Eco-Aesthetic Explorer",
      tagline: "Drawn to nature-inspired vibes and clean aesthetics.",
      description:
        "You have strong green aspirations, but frequently gravitate toward attractive buzzwords ('eco-inspired', 'botanical blend') over third-party audits. A prime target for brand storytelling.",
      badgeColor: "amber",
      traits: ["Vulnerable to Greenwashing", "Aesthetic-Driven", "High Stated Intent"],
    };
  }

  if (spent <= budget * 0.7) {
    return {
      id: "budget_pragmatist",
      archetype: "Budget Pragmatist",
      tagline: "Every rupee earned is a rupee saved.",
      description:
        "You ruthless optimize for wallet health. While sustainability is nice in theory, price elasticity rules your closet choices when real cash is on the line.",
      badgeColor: "cyan",
      traits: ["Value Maximizer", "High Price Elasticity", "Flash-Sale Opportunist"],
    };
  }

  if (revealedShare >= 20 && revealedShare < 60) {
    return {
      id: "pragmatic_balancer",
      archetype: "Pragmatic Balancer",
      tagline: "Sustainable where it counts, sensible where it doesn't.",
      description:
        "You balance wardrobe aesthetics, staple durability, and ethical fabrics. You will pay for sustainable hero pieces (like outerwear) but save on basics.",
      badgeColor: "violet",
      traits: ["Selective Sustainability", "Balanced Budget", "Real-World Pragmatist"],
    };
  }

  return {
    id: "trend_chaser",
    archetype: "Trend Chaser",
    tagline: "Style, hype, and instant wardrobe gratification.",
    description:
      "You prioritize trend velocity, silhouette, and fashion-forward drops. Ethics take a back seat to fresh fits and fast rotations.",
    badgeColor: "rose",
    traits: ["Trend-First", "High Aesthetic Sensitivity", "Low Sustainability Weight"],
  };
}
