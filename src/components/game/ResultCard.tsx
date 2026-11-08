"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, RotateCcw, Share2, BarChart2 } from "lucide-react";
import type { ClosetPersonality, ProductCard } from "@/types/game";
import type { ResearchInsights } from "@/types/telemetry";
import { GarmentGraphic } from "../ui/GarmentIllustrations";

interface ResultCardProps {
  personality: ClosetPersonality;
  insights: ResearchInsights;
  selectedItems: ProductCard[];
  onRestart: () => void;
  onOpenResearcherView: () => void;
}

export default function ResultCard({
  personality,
  insights,
  selectedItems,
  onRestart,
  onOpenResearcherView,
}: ResultCardProps) {
  return (
    <div className="space-y-5 w-full">
      {/* Consumer Personality Shareable Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm text-stone-900 space-y-5"
      >
        {/* Monogram Seal */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-mono text-xs font-semibold text-stone-700">
              HT
            </span>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
              Capsule Persona
            </span>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            5 Pieces · ₹{insights.totalBudgetSpent.toLocaleString("en-IN")}
          </span>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            {personality.archetype}
          </h2>
          <p className="text-xs text-stone-500 italic mt-1">
            &ldquo;{personality.tagline}&rdquo;
          </p>
        </div>

        <p className="text-xs text-stone-700 leading-relaxed">
          {personality.description}
        </p>

        {/* Trait Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {personality.traits.map((trait) => (
            <span
              key={trait}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200"
            >
              {trait}
            </span>
          ))}
        </div>

        {/* Financial Summary Strip */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-left">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-[10px] text-stone-400 uppercase font-medium">Total Spent</span>
            <div className="text-sm font-semibold font-mono text-stone-900 mt-0.5">
              ₹{insights.totalBudgetSpent.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-stone-500">of ₹{insights.initialBudget} limit</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-[10px] text-stone-400 uppercase font-medium">Budget Unspent</span>
            <div className="text-sm font-semibold font-mono text-stone-900 mt-0.5">
              ₹{insights.finalBudget.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-stone-500">remaining in reserve</span>
          </div>
        </div>
      </motion.div>

      {/* Selected Capsule Look Grid */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
        <h3 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
          Curated Capsule Pieces
        </h3>

        <div className="space-y-2">
          {selectedItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white border border-stone-200 flex items-center justify-center p-0.5">
                  <GarmentGraphic type={item.illustrationType || item.category} className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-medium text-stone-900 line-clamp-1">{item.name}</div>
                  <div className="text-[10px] text-stone-500">{item.brandName || item.brandFamiliarity} · {item.styleTag}</div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xs font-semibold font-mono text-stone-900">₹{item.price}</div>
                <div className="text-[10px] text-stone-400">{item.sustainabilityAttribute}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={onOpenResearcherView}
          className="w-full min-h-[44px] py-3 px-4 rounded-xl font-semibold text-xs bg-stone-900 text-white hover:bg-stone-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
        >
          <BarChart2 className="w-4 h-4" />
          <span>Open Researcher Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl font-medium text-xs text-stone-600 hover:text-stone-900 bg-white border border-stone-200 hover:border-stone-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Play Again</span>
        </button>
      </div>
    </div>
  );
}
