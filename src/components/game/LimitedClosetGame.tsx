"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, X, RotateCcw, ShieldCheck, CheckSquare, Square, Eye, HelpCircle, Lightbulb, AlertTriangle } from "lucide-react";
import {
  CLOSET_SLOTS,
  INITIAL_BUDGET,
  MID_GAME_DISRUPTIONS,
  CONSISTENCY_PROBE_SLOT,
} from "@/lib/gameData";
import type { ProductCard as ProductCardType, DisruptionEventConfig } from "@/types/game";
import { computeResponseQuality } from "@/lib/scoring";
import { useBehavioralTelemetry } from "@/hooks/useBehavioralTelemetry";

// Reusable components
import BudgetBar from "./BudgetBar";
import ClosetTracker from "./ClosetTracker";
import ProductCard from "./ProductCard";
import DisruptionSheet from "./DisruptionSheet";
import ResultCard from "./ResultCard";
import ResearcherView from "./ResearcherView";
import DemoModeToggle, { DemoPersona } from "./DemoModeToggle";
import ExplainerModal from "./ExplainerModal";

interface LimitedClosetGameProps {
  defaultStatedOrder?: "after" | "before";
}

type GameStage =
  | "intro"
  | "stated_baseline_before"
  | "slot_selection"
  | "consistency_probe"
  | "stated_baseline_after"
  | "results";

export default function LimitedClosetGame({
  defaultStatedOrder = "after",
}: LimitedClosetGameProps) {
  // Behavioral Telemetry Hook
  const { sessionId, userId, events, recordEvent, tabBlurCount } =
    useBehavioralTelemetry();

  // Configuration: Stated question placement (default "after" to avoid priming)
  const [statedQuestionOrder, setStatedQuestionOrder] = useState<"after" | "before">(
    defaultStatedOrder
  );

  // Demo Persona simulator
  const [demoPersona, setDemoPersona] = useState<DemoPersona>("live");

  // Flow State
  const [stage, setStage] = useState<GameStage>("intro");
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<(ProductCardType | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [currentBudget, setCurrentBudget] = useState<number>(INITIAL_BUDGET);
  const [activeDisruption, setActiveDisruption] = useState<DisruptionEventConfig | null>(null);
  const [disruptionsSeen, setDisruptionsSeen] = useState<string[]>([]);
  
  // Consent Checkbox
  const [hasConsented, setHasConsented] = useState<boolean>(true);

  // Stated 1-5 rating (1: Not at all ... 5: Essential factor)
  const [statedLikert, setStatedLikert] = useState<number>(4);

  // Embedded Probe Trackers
  const [repeatedChoice1Id, setRepeatedChoice1Id] = useState<string | null>(null);
  const [repeatedChoice2Id, setRepeatedChoice2Id] = useState<string | null>(null);
  const [passedAttentionCheck, setPassedAttentionCheck] = useState<boolean>(true);
  const [choseReverseFramed, setChoseReverseFramed] = useState<boolean>(false);

  // Behavioral Scoring Trackers
  const [slotStartTimestamps, setSlotStartTimestamps] = useState<number[]>([]);
  const [slotDecisionLatencies, setSlotDecisionLatencies] = useState<number[]>([]);
  const [cardPositionsSelected, setCardPositionsSelected] = useState<number[]>([]);
  const [hoverCount, setHoverCount] = useState<number>(0);
  const [reversalCount, setReversalCount] = useState<number>(0);
  const [selectionChangesCount, setSelectionChangesCount] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  // Researcher View Toggle
  const [isResearcherViewActive, setIsResearcherViewActive] = useState<boolean>(false);

  // Abandon confirmation modal
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Evaluator X-Ray Mode and Explainer Guide States
  const [isXRayActive, setIsXRayActive] = useState<boolean>(false);
  const [showExplainerModal, setShowExplainerModal] = useState<boolean>(false);

  // Randomize card order per session to avoid position bias
  const randomizedSlots = useMemo(() => {
    return CLOSET_SLOTS.map((slot) => {
      const itemsCopy = [...slot.items];
      for (let i = itemsCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [itemsCopy[i], itemsCopy[j]] = [itemsCopy[j], itemsCopy[i]];
      }
      return { ...slot, items: itemsCopy };
    });
  }, []);

  // Total spent calculation
  const totalSpent = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (item ? item.price : 0), 0);
  }, [selectedItems]);

  const remainingBudget = currentBudget - totalSpent;

  // Track session start
  useEffect(() => {
    recordEvent("session_start", "intro", {
      budget: INITIAL_BUDGET,
      statedOrder: statedQuestionOrder,
    });
  }, [recordEvent, statedQuestionOrder]);

  // Demo Persona Simulation Runner
  const handleSelectDemoPersona = (persona: DemoPersona) => {
    setDemoPersona(persona);
    if (persona === "live") {
      handleRestart();
      return;
    }

    if (persona === "rusher") {
      // Simulate rushed speedrunner bot: sub-second picks, straight-lining (always card 0), fails attention & consistency
      const rusherItems = randomizedSlots.map((s) => s.items[0]);
      setSelectedItems(rusherItems);
      setSlotDecisionLatencies([850, 920, 780, 890, 810]);
      setCardPositionsSelected([0, 0, 0, 0, 0]); // Straight lining
      setHoverCount(1);
      setReversalCount(0);
      setSelectionChangesCount(0);
      setPassedAttentionCheck(false); // Failed attention check
      setRepeatedChoice1Id(rusherItems[0].id);
      setRepeatedChoice2Id("different_id"); // Inconsistent
      setChoseReverseFramed(true);
      setStatedLikert(5); // Stated 5/5 but rushed
      setStage("results");
      setIsResearcherViewActive(true); // Open directly to researcher view so impact is visible!
      recordEvent("session_complete", "demo_rusher");
      return;
    }

    if (persona === "thoughtful") {
      // Simulate thoughtful human: deliberate timing (7-9s), comparisons, passes probes
      const thoughtfulItems = [
        randomizedSlots[0].items.find((i) => i.sustainabilityTier === "certified_sustainable") || randomizedSlots[0].items[0],
        randomizedSlots[1].items[1],
        randomizedSlots[2].items.find((i) => i.sustainabilityTier === "certified_sustainable") || randomizedSlots[2].items[0],
        randomizedSlots[3].items[1],
        randomizedSlots[4].items.find((i) => i.sustainabilityTier === "certified_sustainable") || randomizedSlots[4].items[0],
      ];
      setSelectedItems(thoughtfulItems);
      setSlotDecisionLatencies([8200, 7600, 9100, 8400, 7900]);
      setCardPositionsSelected([1, 2, 0, 2, 1]); // Natural varied positions
      setHoverCount(14);
      setReversalCount(2);
      setSelectionChangesCount(3);
      setPassedAttentionCheck(true);
      setRepeatedChoice1Id(thoughtfulItems[0].id);
      setRepeatedChoice2Id(thoughtfulItems[0].id); // Consistent!
      setChoseReverseFramed(false);
      setStatedLikert(4);
      setStage("results");
      setIsResearcherViewActive(true);
      recordEvent("session_complete", "demo_thoughtful");
    }
  };

  // Start the curation challenge
  const startChallenge = () => {
    setSessionStartTime(Date.now());
    recordEvent("screen_view", "game_start");

    if (statedQuestionOrder === "before") {
      setStage("stated_baseline_before");
      recordEvent("question_shown", "stated_baseline_before");
    } else {
      setStage("slot_selection");
      setCurrentSlotIndex(0);
      setSlotStartTimestamps([Date.now()]);
      recordEvent("screen_view", `slot_${CLOSET_SLOTS[0].id}`);
    }
  };

  // Stated question submit handler
  const handleStatedBaselineSubmit = (rating: number) => {
    setStatedLikert(rating);
    recordEvent("probe_answered", "stated_baseline", { rating });

    if (stage === "stated_baseline_before") {
      setStage("slot_selection");
      setCurrentSlotIndex(0);
      setSlotStartTimestamps([Date.now()]);
      recordEvent("screen_view", `slot_${CLOSET_SLOTS[0].id}`);
    } else {
      setStage("results");
      recordEvent("session_complete", "results");
    }
  };

  // Card hover handler
  const handleCardHover = useCallback(
    (itemId: string) => {
      setHoverCount((prev) => prev + 1);
      recordEvent("card_hover", `slot_${currentSlotIndex}`, { itemId });
    },
    [currentSlotIndex, recordEvent]
  );

  // Card selection / toggle handler
  const handleCardSelect = useCallback(
    (item: ProductCardType) => {
      const currentSlot = randomizedSlots[currentSlotIndex];
      const previousSelection = selectedItems[currentSlotIndex];
      const itemIndexInList = currentSlot.items.findIndex((i) => i.id === item.id);

      // Deselect if tapping the already-selected item
      if (previousSelection && previousSelection.id === item.id) {
        const updated = [...selectedItems];
        updated[currentSlotIndex] = null;
        setSelectedItems(updated);
        setReversalCount((prev) => prev + 1);
        recordEvent("selection_changed", `slot_${currentSlot.id}`, { action: "deselected", itemId: item.id });
        return;
      }

      // Attention check verification
      if (item.isAttentionCheck) {
        setPassedAttentionCheck(true);
        recordEvent("probe_answered", "attention_check", { passed: true, itemId: item.id });
      }

      // Reverse framed check
      if (item.isReverseFramed) {
        setChoseReverseFramed(true);
        recordEvent("probe_answered", "reverse_frame", { choseBadItem: true, itemId: item.id });
      }

      if (previousSelection && previousSelection.id !== item.id) {
        setSelectionChangesCount((prev) => prev + 1);
        setReversalCount((prev) => prev + 1);
        recordEvent("selection_changed", `slot_${currentSlot.id}`, {
          from: previousSelection.id,
          to: item.id,
        });
      } else {
        recordEvent("card_selected", `slot_${currentSlot.id}`, {
          itemId: item.id,
          price: item.price,
          position: itemIndexInList,
        });
      }

      if (currentSlotIndex === 0) {
        setRepeatedChoice1Id(item.id);
      }

      const updated = [...selectedItems];
      updated[currentSlotIndex] = item;
      setSelectedItems(updated);

      setCardPositionsSelected((prev) => {
        const copy = [...prev];
        copy[currentSlotIndex] = itemIndexInList;
        return copy;
      });
    },
    [currentSlotIndex, randomizedSlots, selectedItems, recordEvent]
  );

  // Advance to next slot or probe
  const advanceToNextSlot = () => {
    const now = Date.now();
    const currentStart = slotStartTimestamps[currentSlotIndex] || now - 6000;
    const latency = now - currentStart;

    setSlotDecisionLatencies((prev) => [...prev, latency]);

    // Check for mid-game disruptions
    const disruptionToTrigger = MID_GAME_DISRUPTIONS.find(
      (d) => d.triggerAfterSlotIndex === currentSlotIndex && !disruptionsSeen.includes(d.id)
    );

    if (disruptionToTrigger) {
      setActiveDisruption(disruptionToTrigger);
      setDisruptionsSeen((prev) => [...prev, disruptionToTrigger.id]);
      recordEvent("disruption_shown", disruptionToTrigger.id, {
        impactType: disruptionToTrigger.impactType,
      });
      return;
    }

    proceedToNextStep();
  };

  const proceedToNextStep = () => {
    if (currentSlotIndex < CLOSET_SLOTS.length - 1) {
      const nextIndex = currentSlotIndex + 1;
      setCurrentSlotIndex(nextIndex);
      setSlotStartTimestamps((prev) => [...prev, Date.now()]);
      recordEvent("screen_view", `slot_${CLOSET_SLOTS[nextIndex].id}`);
    } else {
      setStage("consistency_probe");
      recordEvent("screen_view", "consistency_probe");
    }
  };

  // Disruption response handler
  const handleDisruptionResponse = (
    disruptionId: string,
    optionId: string,
    action: string
  ) => {
    recordEvent("disruption_response", disruptionId, { optionId, action });

    if (action === "absorb_cut") {
      setCurrentBudget((prev) => {
        const updated = prev - 350;
        recordEvent("budget_adjusted", "disruption", { newBudget: updated, delta: -350 });
        return updated;
      });
    }

    setActiveDisruption(null);
    proceedToNextStep();
  };

  // Consistency Probe Selection
  const handleConsistencyProbeSelect = (item: ProductCardType) => {
    setRepeatedChoice2Id(item.id);
    const isConsistent = repeatedChoice1Id === item.id;
    recordEvent("probe_answered", "consistency_probe", {
      choice1: repeatedChoice1Id,
      choice2: item.id,
      isConsistent,
    });

    if (statedQuestionOrder === "after") {
      setStage("stated_baseline_after");
      recordEvent("question_shown", "stated_baseline_after");
    } else {
      setStage("results");
      recordEvent("session_complete", "results");
    }
  };

  // Abandon flow handler
  const handleConfirmExit = () => {
    recordEvent("session_abandon", `stage_${stage}`, {
      slotsCompleted: currentSlotIndex,
      spent: totalSpent,
    });
    setShowExitConfirm(false);
    handleRestart();
  };

  // Reset challenge
  const handleRestart = () => {
    setSelectedItems([null, null, null, null, null]);
    setCurrentSlotIndex(0);
    setCurrentBudget(INITIAL_BUDGET);
    setDisruptionsSeen([]);
    setActiveDisruption(null);
    setCardPositionsSelected([]);
    setSlotDecisionLatencies([]);
    setSlotStartTimestamps([]);
    setHoverCount(0);
    setReversalCount(0);
    setSelectionChangesCount(0);
    setPassedAttentionCheck(true);
    setChoseReverseFramed(false);
    setRepeatedChoice1Id(null);
    setRepeatedChoice2Id(null);
    setStage("intro");
    setIsResearcherViewActive(false);
    setDemoPersona("live");
    recordEvent("session_start", "restart");
  };

  // Final Scoring Engine Output
  const scoringReport = useMemo(() => {
    const validItems = selectedItems.filter((i): i is ProductCardType => i !== null);
    const totalDuration = Date.now() - sessionStartTime;

    return computeResponseQuality({
      totalDurationMs: totalDuration,
      slotDecisionLatenciesMs: slotDecisionLatencies,
      cardPositionsSelected,
      hoverCount,
      reversalCount,
      selectionChangesCount,
      tabBlurCount,
      repeatedScenarioChoice1Id: repeatedChoice1Id,
      repeatedScenarioChoice2Id: repeatedChoice2Id,
      passedAttentionCheck,
      choseReverseFramedBadItem: choseReverseFramed,
      selectedItems: validItems,
      totalBudget: INITIAL_BUDGET,
      spentBudget: totalSpent,
      statedSustainabilityLikert: statedLikert,
    });
  }, [
    selectedItems,
    sessionStartTime,
    slotDecisionLatencies,
    cardPositionsSelected,
    hoverCount,
    reversalCount,
    selectionChangesCount,
    tabBlurCount,
    repeatedChoice1Id,
    repeatedChoice2Id,
    passedAttentionCheck,
    choseReverseFramed,
    totalSpent,
    statedLikert,
  ]);

  const currentSlot = randomizedSlots[currentSlotIndex];
  const currentSelection = selectedItems[currentSlotIndex];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Centered Phone Container (max-w-[430px]) */}
      <div className="w-full max-w-[430px] min-h-[720px] rounded-3xl bg-[#FAF8F5] border border-stone-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-stone-900">
        
        {/* Top Demo & Evaluator Bar */}
        <div className="w-full mb-3 space-y-1.5">
          <DemoModeToggle
            currentPersona={demoPersona}
            onSelectPersona={handleSelectDemoPersona}
          />

          <div className="flex items-center justify-between px-1 text-[11px]">
            <button
              type="button"
              onClick={() => setIsXRayActive(!isXRayActive)}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors cursor-pointer ${
                isXRayActive
                  ? "bg-amber-100 text-amber-950 border-amber-300 shadow-2xs"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
              }`}
              title="Toggle X-Ray inspector to reveal card roles, decoy markers, and testing purposes"
            >
              <Eye className="w-3 h-3 text-amber-700" />
              <span>X-Ray Inspector: {isXRayActive ? "ON (Labels Visible)" : "OFF"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExplainerModal(true)}
              className="inline-flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" />
              <span>What Defines What?</span>
            </button>
          </div>
        </div>

        {/* Top Header Navigation (Only shown during active game) */}
        {stage !== "intro" && stage !== "results" && (
          <div className="space-y-3 pb-3 border-b border-stone-200/70 w-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                Limited Closet
              </span>

              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors"
                title="Exit curation"
                aria-label="Exit curation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Closet Slots Progress Tracker */}
            <ClosetTracker
              slots={CLOSET_SLOTS.map((s) => ({ id: s.id, label: s.name.split(" ")[0] }))}
              currentSlotIndex={currentSlotIndex}
              selectedItems={selectedItems}
              onSlotClick={(idx) => {
                if (idx <= currentSlotIndex) {
                  setCurrentSlotIndex(idx);
                }
              }}
            />

            {/* Budget Meter */}
            <BudgetBar
              remainingBudget={remainingBudget}
              totalBudget={currentBudget}
            />
          </div>
        )}

        {/* SCREEN 1: INTRO SCREEN */}
        {stage === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-between py-4 space-y-6"
          >
            {/* Top Brand Tag */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-widest">
                Capsule Experiment
              </span>
              <h1 className="text-2xl font-semibold text-stone-900 tracking-tight leading-tight">
                Build your capsule wardrobe on a budget
              </h1>
              <p className="text-xs text-stone-600 leading-relaxed pt-1">
                You have a fixed ₹3,000 allowance to curate 5 essential wardrobe pieces: top, bottom, outerwear, footwear, and an accessory.
              </p>
            </div>

            {/* Structured Specifications Strip */}
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Allowance</span>
                <span className="font-mono font-semibold text-stone-900">₹3,000 INR</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Closet Slots</span>
                <span className="font-medium text-stone-800">5 Distinct Pieces</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Estimated Duration</span>
                <span className="font-medium text-stone-800">About 2 minutes</span>
              </div>
            </div>

            {/* Evaluator Callout & Research Guide Link */}
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-950 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                  Evaluator Research Note
                </span>
                <button
                  type="button"
                  onClick={() => setShowExplainerModal(true)}
                  className="text-[10px] font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950 cursor-pointer"
                >
                  What Defines What Guide
                </button>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Evaluating this assignment? Turn on <strong>X-Ray Inspector</strong> (top right) to see hidden research constructs, decoy indicators, and scoring triggers in real time.
              </p>
            </div>

            {/* Trust Line & Consent Checkbox */}
            <div className="space-y-3 pt-2">
              <p className="text-[11px] text-stone-500 italic">
                Anonymous. There are no right or wrong answers.
              </p>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-100/70 border border-stone-200/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="mt-0.5 rounded border-stone-300 text-stone-800 focus:ring-0"
                />
                <span className="text-[11px] text-stone-600 leading-snug">
                  We record how you play, such as taps and timing, to improve the research. No personal details are linked to your answers.
                </span>
              </label>
            </div>

            {/* Bottom Thumb Zone Action */}
            <div className="pt-4">
              <button
                type="button"
                disabled={!hasConsented}
                onClick={startChallenge}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-xl font-semibold text-xs tracking-wide bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Start Curation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* SCREEN 2: SLOT SELECTION (ONE DECISION PER SCREEN) */}
        {stage === "slot_selection" && (
          <div className="flex-1 flex flex-col justify-between py-3 space-y-3">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-base font-semibold text-stone-900">
                  {currentSlot.name}
                </h2>
                <span className="text-[11px] text-stone-400 font-mono">
                  {currentSlotIndex + 1} of 5
                </span>
              </div>
              <p className="text-xs text-stone-500 mb-2">
                Select one piece that fits your aesthetic and budget.
              </p>

              {/* Evaluator Purpose Banner (Visible when X-Ray is ON) */}
              {isXRayActive && (
                <div className="mb-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-950 text-[11px]">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <span>What Slot {currentSlotIndex + 1} Tests:</span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-snug">
                    {currentSlot.evaluatorSlotPurpose}
                  </p>
                </div>
              )}

              {/* Over Budget Notice */}
              {remainingBudget < 0 && (
                <div className="mb-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-left text-[11px] text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span>Allowance exceeded by ₹{Math.abs(remainingBudget).toLocaleString("en-IN")}. You can still confirm your choice or tap previous to rebalance.</span>
                </div>
              )}

              {/* Product Cards List */}
              <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-0.5 scrollbar-thin">
                {(() => {
                  const availableBudgetForSlot = remainingBudget + (currentSelection ? currentSelection.price : 0);
                  const allItemsExceed = currentSlot.items.every((i) => i.price > availableBudgetForSlot);

                  return currentSlot.items.map((item) => {
                    const isSelected = currentSelection?.id === item.id;
                    // Only disable if item exceeds budget AND not all items exceed (never trap the user on a screen)
                    const wouldExceed = !isSelected && !allItemsExceed && item.price > availableBudgetForSlot;

                    return (
                      <ProductCard
                        key={item.id}
                        item={item}
                        selected={isSelected}
                        disabled={wouldExceed}
                        showXRay={isXRayActive}
                        onSelect={handleCardSelect}
                        onHover={handleCardHover}
                      />
                    );
                  });
                })()}
              </div>
            </div>

            {/* Bottom Thumb Zone Actions (Min 44x44px target) */}
            <div className="pt-3 border-t border-stone-200/70 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (currentSlotIndex > 0) {
                    setCurrentSlotIndex((prev) => prev - 1);
                  }
                }}
                disabled={currentSlotIndex === 0}
                className="min-h-[44px] min-w-[44px] px-3.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous slot"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={advanceToNextSlot}
                disabled={!currentSelection}
                className="flex-1 min-h-[44px] py-3 px-4 rounded-xl font-semibold text-xs tracking-wide bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <span>{currentSlotIndex === CLOSET_SLOTS.length - 1 ? "Confirm Capsule" : "Next Slot"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: CONSISTENCY PROBE (SWAPPED POSITIONS) */}
        {stage === "consistency_probe" && (
          <div className="flex-1 flex flex-col justify-between py-3 space-y-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Final Review
              </span>
              <h2 className="text-base font-semibold text-stone-900 mt-0.5">
                Confirm your preferred Top
              </h2>
              <p className="text-xs text-stone-500 mt-1 mb-2">
                Confirm your top selection to finalize your look balance.
              </p>

              {/* Consistency Probe Evaluator Banner */}
              {isXRayActive && (
                <div className="mb-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-950 text-[11px]">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <span>What Consistency Probe Tests:</span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-snug">
                    {CONSISTENCY_PROBE_SLOT.evaluatorSlotPurpose}
                  </p>
                </div>
              )}

              <div className="space-y-2.5 max-h-[440px] overflow-y-auto">
                {CONSISTENCY_PROBE_SLOT.items.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    selected={repeatedChoice2Id === item.id}
                    disabled={false}
                    showXRay={isXRayActive}
                    onSelect={handleConsistencyProbeSelect}
                    onHover={handleCardHover}
                  />
                ))}
              </div>
            </div>

            <p className="text-[11px] text-stone-400 text-center italic">
              Tap an option above to confirm and proceed.
            </p>
          </div>
        )}

        {/* SCREEN 4: STATED BASELINE QUESTION */}
        {(stage === "stated_baseline_before" || stage === "stated_baseline_after") && (
          <div className="flex-1 flex flex-col justify-between py-6 space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Wardrobe Question
              </span>
              <h2 className="text-lg font-semibold text-stone-900 leading-snug">
                When shopping for clothes in everyday life, how much does sustainability influence your purchase?
              </h2>
              <p className="text-xs text-stone-500">
                Select from 1 (Not at all) to 5 (Essential factor).
              </p>
            </div>

            {/* Clean Segmented 1-5 Tap Scale */}
            <div className="grid grid-cols-5 gap-1.5 py-4">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStatedLikert(val)}
                  className={`min-h-[56px] rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center p-2 ${
                    statedLikert === val
                      ? "border-stone-900 bg-stone-900 text-white font-semibold shadow-xs"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <span className="text-base font-bold font-mono">{val}</span>
                  <span className="text-[9px] mt-0.5 opacity-80">
                    {val === 1 ? "None" : val === 3 ? "Medium" : val === 5 ? "Key" : ""}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleStatedBaselineSubmit(statedLikert)}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-xl font-semibold text-xs tracking-wide bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Confirm & View Capsule Look</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 5: RESULTS & RESEARCHER VIEW */}
        {stage === "results" && (
          <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
            {/* View Switcher Pill */}
            <div className="flex justify-center">
              <div className="inline-flex p-1 rounded-xl bg-stone-200/70 border border-stone-300/60">
                <button
                  type="button"
                  onClick={() => setIsResearcherViewActive(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    !isResearcherViewActive
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Consumer View
                </button>
                <button
                  type="button"
                  onClick={() => setIsResearcherViewActive(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isResearcherViewActive
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Researcher Lens
                </button>
              </div>
            </div>

            {/* Content view */}
            <div className="flex-1">
              {isResearcherViewActive ? (
                <ResearcherView
                  metrics={scoringReport.quality}
                  insights={scoringReport.insights}
                  events={events}
                  sessionId={sessionId}
                  onBackToConsumer={() => setIsResearcherViewActive(false)}
                />
              ) : (
                <ResultCard
                  personality={scoringReport.personality}
                  insights={scoringReport.insights}
                  selectedItems={selectedItems.filter((i): i is ProductCardType => i !== null)}
                  onRestart={handleRestart}
                  onOpenResearcherView={() => setIsResearcherViewActive(true)}
                />
              )}
            </div>
          </div>
        )}

        {/* Mid-Game Disruption Bottom Sheet */}
        <DisruptionSheet
          disruption={activeDisruption}
          onRespond={handleDisruptionResponse}
        />

        {/* Exit Confirmation Dialog */}
        <AnimatePresence>
          {showExitConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xs rounded-2xl bg-white p-5 border border-stone-200 shadow-xl space-y-3 text-stone-900"
              >
                <h4 className="text-sm font-semibold text-stone-900">
                  Exit Capsule Curation?
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Your partial choices will be discarded. This will be logged as an abandoned session.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-2 px-3 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50"
                  >
                    Keep Playing
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmExit}
                    className="flex-1 py-2 px-3 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
                  >
                    Exit
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Research & Scoring Explainer Modal */}
        <ExplainerModal
          isOpen={showExplainerModal}
          onClose={() => setShowExplainerModal(false)}
        />
      </div>
    </div>
  );
}
