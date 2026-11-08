/**
 * Heuristic Fallback Engine for Question Intelligence Lab
 * Ensures 100% reliability even if Gemini API is unreachable or offline
 */

import type { QuestionAnalysisResult, RecommendedFormat } from "../types/question-lab.ts";

export const CLOTHING_SUSTAINABILITY_DEMO_QUESTION =
  "How important is sustainability to you when buying clothing? (1: Not important ... 5: Extremely important)";

/**
 * Pre-computed high-fidelity domain analysis for the clothing sustainability baseline
 */
export const CLOTHING_DEMO_ANALYSIS: QuestionAnalysisResult = {
  originalQuestion: CLOTHING_SUSTAINABILITY_DEMO_QUESTION,
  overallRiskScore: 88,
  biasFlags: [
    {
      flag: "social_desirability_risk",
      displayName: "Social Desirability Bias",
      severity: 3,
      explanation:
        "Respondents are socially incentivized to claim strong ethical virtues when no financial, aesthetic, or brand sacrifice is required.",
      mitigation:
        "Remove green framing entirely from the prompt. Measure revealed preference via actual basket allocations under a constrained budget.",
    },
    {
      flag: "abstract_unanchored",
      displayName: "Abstract / Unanchored Construct",
      severity: 3,
      explanation:
        "'Sustainability' is an undefined, abstract term. In isolation, participants cannot evaluate trade-offs against price, durability, or style appeal.",
      mitigation:
        "Replace the abstract concept with concrete attributes (e.g., GOTS certified organic linen vs. cheap virgin polyester) alongside real rupee prices.",
    },
    {
      flag: "leading_wording",
      displayName: "Leading / Priming Risk",
      severity: 2,
      explanation:
        "Directly asking 'How important is sustainability' primes the participant to hyper-focus on eco-credentials, distorting authentic shopping heuristics.",
      mitigation:
        "Neutral framing: 'Build your capsule wardrobe on a budget'. Reveal the importance metric implicitly from choices.",
    },
    {
      flag: "predictable_pattern_risk",
      displayName: "Predictable Autopilot Responding",
      severity: 2,
      explanation:
        "Likert 1-5 scales induce rapid satisficing (clicking '4' or '5' in under 1 second without cognitive reflection).",
      mitigation:
        "Embed micro-disruptions (flash sales, price hikes) and decoy options to demand active cognitive deliberation.",
    },
    {
      flag: "double_barrelled",
      displayName: "Double-Barrelled Inquiry",
      severity: 0,
      explanation: "Question addresses a single topic, but suffers from severe lack of trade-off context.",
      mitigation: "N/A",
    },
  ],
  recommendedFormat: {
    format: "trade_off_budget_allocation",
    displayName: "Budget-Allocation Trade-Off Game ('Limited Closet')",
    rationale:
      "A fixed budget forces zero-sum trade-offs where paying a green premium requires sacrificing style, brand status, or wallet savings.",
  },
  redesignedConcept: {
    title: "Limited Closet: Capsule Wardrobe Challenge",
    behaviouralVersion:
      "You have ₹3,000 to curate 5 closet slots (Top, Bottom, Outerwear, Shoes, Accessory). Build your look.",
    gamifiedMechanic:
      "Multi-slot card selection with price tags, verified eco-certifications, vague greenwashed decoys, and mid-game price shock disruptions.",
    participantTimeEstimate: "2 - 3 minutes",
    primaryBehavioralMetric:
      "Revealed Sustainability Share (%) vs. Stated Likert Score (Attitude-Behaviour Gap Index).",
  },
  constructPreservation: {
    isPreserved: true,
    constructBeingMeasured: "Personal valuation of environmental ethics in apparel procurement",
    analysis:
      "The underlying psychometric construct (willingness to prioritize sustainability) is fully preserved, but transformed from an unconstrained hypothetical self-image statement into an operationalized economic trade-off with tangible opportunity costs.",
    tradeOffs:
      "Slightly higher participant cognitive load (2 minutes vs 5 seconds), offset by orders-of-magnitude higher signal validity and immunity to social desirability.",
    fidelityScore: 94,
  },
  isHeuristicFallback: true,
};

/**
 * Intelligent pattern-matching heuristic analyzer for arbitrary survey questions
 */
export function analyzeQuestionHeuristically(questionText: string): QuestionAnalysisResult {
  const normalized = questionText.toLowerCase();

  // If question matches the clothing sustainability demo
  if (
    normalized.includes("sustainability") &&
    (normalized.includes("clothing") || normalized.includes("clothes") || normalized.includes("buying"))
  ) {
    return { ...CLOTHING_DEMO_ANALYSIS, originalQuestion: questionText };
  }

  // General heuristic analysis
  const isLikert =
    normalized.includes("1 to 5") ||
    normalized.includes("1-5") ||
    normalized.includes("strongly agree") ||
    normalized.includes("scale of");

  const hasEthicalTopic =
    normalized.includes("ethical") ||
    normalized.includes("green") ||
    normalized.includes("privacy") ||
    normalized.includes("healthy") ||
    normalized.includes("organic") ||
    normalized.includes("donate") ||
    normalized.includes("charity") ||
    normalized.includes("environment");

  const isDoubleBarrelled =
    (normalized.includes(" and ") || normalized.includes(" or ")) &&
    (normalized.includes("fast and cheap") ||
      normalized.includes("easy and convenient") ||
      normalized.includes("quality and price"));

  const isLeading =
    normalized.startsWith("don't you agree") ||
    normalized.startsWith("shouldn't") ||
    normalized.includes("how much do you love") ||
    normalized.includes("how important is");

  const biasFlags = [
    {
      flag: "social_desirability_risk" as const,
      displayName: "Social Desirability Bias",
      severity: (hasEthicalTopic ? 3 : 1) as 0 | 1 | 2 | 3,
      explanation: hasEthicalTopic
        ? "Respondents tend to report idealized self-perceptions rather than true daily habits."
        : "Standard self-report variance.",
      mitigation: "Frame task around real trade-offs with budget or time constraints.",
    },
    {
      flag: "abstract_unanchored" as const,
      displayName: "Abstract / Unanchored Construct",
      severity: (isLikert ? 2 : 1) as 0 | 1 | 2 | 3,
      explanation: "Question asks for general opinion without concrete situational context or stakes.",
      mitigation: "Place participant in a concrete decision scenario with competing priorities.",
    },
    {
      flag: "leading_wording" as const,
      displayName: "Leading / Priming Risk",
      severity: (isLeading ? 3 : 1) as 0 | 1 | 2 | 3,
      explanation: isLeading
        ? "The phrasing signals a desirable direction, encouraging acquiescence."
        : "Moderate phrasing neutrality.",
      mitigation: "Use neutral framing and disguise the target metric.",
    },
    {
      flag: "double_barrelled" as const,
      displayName: "Double-Barrelled Inquiry",
      severity: (isDoubleBarrelled ? 3 : 0) as 0 | 1 | 2 | 3,
      explanation: isDoubleBarrelled
        ? "Combines multiple independent attributes into a single response scale."
        : "Single construct targeted.",
      mitigation: "Split into separate trade-off attributes.",
    },
    {
      flag: "predictable_pattern_risk" as const,
      displayName: "Predictable Autopilot Responding",
      severity: (isLikert ? 2 : 1) as 0 | 1 | 2 | 3,
      explanation: "Static linear scales encourage satisficing and straight-lining.",
      mitigation: "Introduce interactive game mechanics and attention calibration probes.",
    },
  ];

  let recommendedFormat: RecommendedFormat = "trade_off_budget_allocation";
  if (hasEthicalTopic) {
    recommendedFormat = "trade_off_budget_allocation";
  } else if (isDoubleBarrelled) {
    recommendedFormat = "forced_choice";
  } else {
    recommendedFormat = "scenario";
  }

  const riskScore = Math.min(
    100,
    biasFlags.reduce((sum, f) => sum + f.severity * 8, 20)
  );

  return {
    originalQuestion: questionText,
    overallRiskScore: riskScore,
    biasFlags,
    recommendedFormat: {
      format: recommendedFormat,
      displayName:
        recommendedFormat === "trade_off_budget_allocation"
          ? "Budget-Allocation Trade-Off Game"
          : recommendedFormat === "forced_choice"
          ? "Conjoint Forced-Choice Duel"
          : "Branching Scenario Simulation",
      rationale:
        "Replaces hypothetical self-report with revealed preference where users must allocate scarce resources between competing alternatives.",
    },
    redesignedConcept: {
      title: "Revealed Preference Simulation",
      behaviouralVersion:
        "Put participant in a contextual simulated task where their selections reveal implicit weights.",
      gamifiedMechanic:
        "Interactive decision cards with real-world constraints, decoy options, and sudden market disruptions.",
      participantTimeEstimate: "2 - 3 minutes",
      primaryBehavioralMetric: "Revealed Choice Share vs. Stated Self-Report Baseline.",
    },
    constructPreservation: {
      isPreserved: true,
      constructBeingMeasured: "Operationalized behavioral trade-off evaluation",
      analysis:
        "Preserves the target construct by capturing actual selection behavior under resource constraints rather than superficial stated intent.",
      tradeOffs: "Slightly increased completion time traded for drastically higher data reliability.",
      fidelityScore: 89,
    },
    isHeuristicFallback: true,
  };
}
