/**
 * Unit Tests for Response Quality & Engagement Scoring Engine
 * Executed via Node 26 Native Test Runner: `npm test`
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { computeResponseQuality, classifyClosetPersonality } from "../src/lib/scoring.ts";
import type { ProductCard } from "../src/types/game.ts";

const mockCertifiedItem: ProductCard = {
  id: "cert-top",
  name: "GOTS Organic Linen Shirt",
  category: "top",
  price: 950,
  styleTag: "Clean Minimalist",
  brandFamiliarity: "Artisan Studio",
  sustainabilityTier: "certified_sustainable",
  sustainabilityAttribute: "100% GOTS Organic Certified",
  certification: "GOTS Certified",
  imageEmoji: "👔",
  description: "Verified organic linen with living wage audit.",
};

const mockGreenwashedItem: ProductCard = {
  id: "greenwash-bottom",
  name: "Eco-Aura Botanical Trousers",
  category: "bottom",
  price: 750,
  styleTag: "Relaxed Fit",
  brandFamiliarity: "Mass Retailer",
  sustainabilityTier: "greenwashed_decoy",
  sustainabilityAttribute: "Eco-Inspired Natural Touch",
  imageEmoji: "👖",
  description: "Vague green claims without third-party verification.",
};

const mockConventionalItem: ProductCard = {
  id: "fast-outerwear",
  name: "Glossy Poly Bomber",
  category: "outerwear",
  price: 450,
  styleTag: "Streetwear Essential",
  brandFamiliarity: "Global Fast-Fashion Icon",
  sustainabilityTier: "conventional_fast",
  sustainabilityAttribute: "None (Synthetic Blend)",
  imageEmoji: "🧥",
  description: "Ultra-cheap trendy synthetic jacket.",
};

describe("Response Quality & Engagement Scoring Engine", () => {
  it("evaluates a high-quality, deliberate participant as HIGH quality", () => {
    const result = computeResponseQuality({
      totalDurationMs: 42_000,
      slotDecisionLatenciesMs: [8000, 7500, 9000, 8500, 9000],
      cardPositionsSelected: [1, 2, 0, 3, 1], // Varied positions (no straight-lining)
      hoverCount: 10,
      reversalCount: 2,
      selectionChangesCount: 3,
      tabBlurCount: 0,
      repeatedScenarioChoice1Id: "item-a",
      repeatedScenarioChoice2Id: "item-a", // Consistent
      passedAttentionCheck: true,
      choseReverseFramedBadItem: false,
      selectedItems: [mockCertifiedItem, mockConventionalItem, mockGreenwashedItem, mockCertifiedItem, mockConventionalItem],
      totalBudget: 3000,
      spentBudget: 2700,
      statedSustainabilityLikert: 4,
    });

    assert.strictEqual(result.quality.verdict, "HIGH");
    assert.ok(result.quality.responseQualityScore >= 80, `Expected score >= 80, got ${result.quality.responseQualityScore}`);
    assert.strictEqual(result.quality.reasonCodes.length, 0);
    assert.strictEqual(result.quality.metrics.passedAttentionCheck, true);
    assert.strictEqual(result.quality.metrics.isRepeatedChoiceConsistent, true);
  });

  it("penalizes speedrunning when average decision time is under human reading threshold", () => {
    const result = computeResponseQuality({
      totalDurationMs: 4_500,
      slotDecisionLatenciesMs: [800, 900, 750, 600, 700], // Sub-second clicking
      cardPositionsSelected: [1, 2, 0, 1, 2],
      hoverCount: 1,
      reversalCount: 0,
      selectionChangesCount: 0,
      tabBlurCount: 0,
      repeatedScenarioChoice1Id: "item-a",
      repeatedScenarioChoice2Id: "item-a",
      passedAttentionCheck: true,
      choseReverseFramedBadItem: false,
      selectedItems: [mockConventionalItem, mockConventionalItem, mockConventionalItem, mockConventionalItem, mockConventionalItem],
      totalBudget: 3000,
      spentBudget: 2250,
      statedSustainabilityLikert: 3,
    });

    assert.ok(result.quality.reasonCodes.includes("SPEEDING"), "Expected SPEEDING reason code");
    assert.ok(result.quality.componentScores.speedingScore <= 40, "Speeding score should be heavily penalized");
    assert.ok(result.quality.responseQualityScore < 85);
  });

  it("detects position bias (straight-lining) when user always clicks the first card", () => {
    const result = computeResponseQuality({
      totalDurationMs: 35_000,
      slotDecisionLatenciesMs: [7000, 7000, 7000, 7000, 7000],
      cardPositionsSelected: [0, 0, 0, 0, 0], // Always card index 0
      hoverCount: 4,
      reversalCount: 0,
      selectionChangesCount: 0,
      tabBlurCount: 0,
      repeatedScenarioChoice1Id: "item-a",
      repeatedScenarioChoice2Id: "item-a",
      passedAttentionCheck: true,
      choseReverseFramedBadItem: false,
      selectedItems: [mockConventionalItem, mockConventionalItem, mockConventionalItem, mockConventionalItem, mockConventionalItem],
      totalBudget: 3000,
      spentBudget: 2250,
      statedSustainabilityLikert: 3,
    });

    assert.ok(result.quality.reasonCodes.includes("POSITION_BIAS"), "Expected POSITION_BIAS code");
    assert.strictEqual(result.quality.componentScores.positionScore, 15);
  });

  it("detects inconsistency when repeated choice scenario with swapped positions fails", () => {
    const result = computeResponseQuality({
      totalDurationMs: 38_000,
      slotDecisionLatenciesMs: [7000, 8000, 7500, 7500, 8000],
      cardPositionsSelected: [1, 2, 3, 0, 1],
      hoverCount: 6,
      reversalCount: 1,
      selectionChangesCount: 1,
      tabBlurCount: 0,
      repeatedScenarioChoice1Id: "item-linen-shirt",
      repeatedScenarioChoice2Id: "item-poly-shirt", // Fails repeated scenario!
      passedAttentionCheck: true,
      choseReverseFramedBadItem: false,
      selectedItems: [mockConventionalItem, mockConventionalItem, mockConventionalItem, mockConventionalItem, mockConventionalItem],
      totalBudget: 3000,
      spentBudget: 2250,
      statedSustainabilityLikert: 3,
    });

    assert.ok(result.quality.reasonCodes.includes("INCONSISTENT"), "Expected INCONSISTENT code");
    assert.strictEqual(result.quality.componentScores.consistencyScore, 0);
  });

  it("flags failure on disguised attention check probe", () => {
    const result = computeResponseQuality({
      totalDurationMs: 35_000,
      slotDecisionLatenciesMs: [7000, 7000, 7000, 7000, 7000],
      cardPositionsSelected: [1, 2, 0, 1, 2],
      hoverCount: 6,
      reversalCount: 1,
      selectionChangesCount: 1,
      tabBlurCount: 0,
      repeatedScenarioChoice1Id: "item-a",
      repeatedScenarioChoice2Id: "item-a",
      passedAttentionCheck: false, // FAILED attention check
      choseReverseFramedBadItem: false,
      selectedItems: [mockConventionalItem, mockConventionalItem, mockConventionalItem, mockConventionalItem, mockConventionalItem],
      totalBudget: 3000,
      spentBudget: 2250,
      statedSustainabilityLikert: 3,
    });

    assert.ok(result.quality.reasonCodes.includes("ATTENTION_FAILED"), "Expected ATTENTION_FAILED code");
    assert.strictEqual(result.quality.componentScores.attentionScore, 0);
  });

  it("accurately computes the Stated-vs-Revealed attitude-behaviour gap", () => {
    // Participant states 5/5 (Extremely important, 100%) but chooses 0% certified sustainable items
    const result = computeResponseQuality({
      totalDurationMs: 40_000,
      slotDecisionLatenciesMs: [8000, 8000, 8000, 8000, 8000],
      cardPositionsSelected: [1, 2, 1, 2, 1],
      hoverCount: 8,
      reversalCount: 2,
      selectionChangesCount: 2,
      tabBlurCount: 0,
      repeatedScenarioChoice1Id: "item-a",
      repeatedScenarioChoice2Id: "item-a",
      passedAttentionCheck: true,
      choseReverseFramedBadItem: false,
      selectedItems: [
        mockConventionalItem,
        mockConventionalItem,
        mockConventionalItem,
        mockConventionalItem,
        mockConventionalItem,
      ],
      totalBudget: 3000,
      spentBudget: 2250,
      statedSustainabilityLikert: 5, // 100% stated
    });

    assert.strictEqual(result.insights.statedSustainabilityScore, 5);
    assert.strictEqual(result.insights.revealedSustainabilityShare, 0);
    // Stated (100%) - Revealed (0%) = +100% gap
    assert.strictEqual(result.insights.statedVsRevealedGap, 100);
  });

  it("calculates greenwash susceptibility index correctly", () => {
    const result = computeResponseQuality({
      totalDurationMs: 40_000,
      slotDecisionLatenciesMs: [8000, 8000, 8000, 8000, 8000],
      cardPositionsSelected: [1, 2, 1, 2, 1],
      hoverCount: 8,
      reversalCount: 2,
      selectionChangesCount: 2,
      tabBlurCount: 0,
      repeatedScenarioChoice1Id: "item-a",
      repeatedScenarioChoice2Id: "item-a",
      passedAttentionCheck: true,
      choseReverseFramedBadItem: false,
      selectedItems: [
        mockGreenwashedItem,
        mockGreenwashedItem,
        mockCertifiedItem,
        mockConventionalItem,
        mockConventionalItem,
      ],
      totalBudget: 3000,
      spentBudget: 2700,
      statedSustainabilityLikert: 4,
    });

    // 2 out of 5 items are greenwashed decoys = 40%
    assert.strictEqual(result.insights.greenwashSusceptibilityScore, 40);
    assert.strictEqual(result.insights.greenwashItemsChosen, 2);
  });

  it("classifies personality archetypes appropriately", () => {
    const conscious = classifyClosetPersonality(80, 10, 2800, 3000);
    assert.strictEqual(conscious.id, "conscious_curator");

    const greenwashVictim = classifyClosetPersonality(0, 60, 2500, 3000);
    assert.strictEqual(greenwashVictim.id, "eco_optimist_decoy");

    const budgetSaver = classifyClosetPersonality(10, 10, 1800, 3000);
    assert.strictEqual(budgetSaver.id, "budget_pragmatist");

    const trendLover = classifyClosetPersonality(0, 0, 2900, 3000);
    assert.strictEqual(trendLover.id, "trend_chaser");
  });
});
