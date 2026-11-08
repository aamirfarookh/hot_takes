"use client";

import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, ShieldCheck, Share2, RotateCcw } from "lucide-react";
import type { ClosetPersonality, ProductCard } from "@/types/game";
import type { ResearchInsights } from "@/types/telemetry";

interface PersonalityResultCardProps {
  personality: ClosetPersonality;
  insights: ResearchInsights;
  selectedItems: ProductCard[];
  onRestart: () => void;
  onOpenResearcherView: () => void;
}

export default function PersonalityResultCard({
  personality,
  insights,
  selectedItems,
  onRestart,
  onOpenResearcherView,
}: PersonalityResultCardProps) {
  const getBadgeStyle = () => {
    switch (personality.badgeColor) {
      case "emerald":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "amber":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "cyan":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      case "violet":
        return "bg-violet-500/20 text-violet-300 border-violet-500/40";
      default:
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
    }
  };

  return (
    <div className="space-y-6">
      {/* Consumer Personality Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 md:p-8 shadow-2xl relative overflow-hidden text-center"
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border mb-4 shadow-sm backdrop-blur-sm" style={{}}>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${getBadgeStyle()}`}>
            <Sparkles className="w-3.5 h-3.5" />
            Capsule Archetype
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-50 tracking-tight">
          {personality.archetype}
        </h2>

        <p className="mt-1.5 text-sm font-medium text-zinc-400 italic">
          &ldquo;{personality.tagline}&rdquo;
        </p>

        <p className="mt-4 text-xs md:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
          {personality.description}
        </p>

        {/* Personality Traits */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {personality.traits.map((trait) => (
            <span
              key={trait}
              className="px-3 py-1 rounded-full text-[11px] font-medium bg-zinc-800/80 border border-zinc-700/60 text-zinc-300"
            >
              ✦ {trait}
            </span>
          ))}
        </div>

        {/* Quick Summary Pill */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-zinc-800 text-left">
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Budget Spent</span>
            <div className="text-sm font-bold text-zinc-200 mt-0.5">
              ₹{insights.totalBudgetSpent.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-zinc-600">of ₹{insights.initialBudget}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Eco Choices</span>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">
              {insights.certifiedItemsChosen} / {selectedItems.length}
            </div>
            <span className="text-[10px] text-zinc-600">Certified GOTS/GRS</span>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Green Decoys</span>
            <div className="text-sm font-bold text-amber-400 mt-0.5">
              {insights.greenwashItemsChosen}
            </div>
            <span className="text-[10px] text-zinc-600">Buzzwords</span>
          </div>
        </div>
      </motion.div>

      {/* Capsule Wardrobe Breakdown */}
      <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-5 space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-2">
          <ShoppingBag className="w-3.5 h-3.5 text-zinc-500" />
          Your Curated Capsule Look ({selectedItems.length} Pieces)
        </h3>

        <div className="space-y-2">
          {selectedItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.imageEmoji}</span>
                <div>
                  <div className="font-semibold text-zinc-200">{item.name}</div>
                  <div className="text-[10px] text-zinc-500">
                    {item.category.toUpperCase()} · {item.styleTag}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-zinc-200">₹{item.price}</div>
                <div className="text-[10px] font-medium">
                  {item.sustainabilityTier === "certified_sustainable" ? (
                    <span className="text-emerald-400 flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3 h-3" /> Certified
                    </span>
                  ) : item.sustainabilityTier === "greenwashed_decoy" ? (
                    <span className="text-amber-400">Decoy Buzzword</span>
                  ) : (
                    <span className="text-zinc-500">Conventional</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onOpenResearcherView}
          className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs tracking-wide bg-emerald-500 text-black hover:bg-emerald-400 shadow-md shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          View Researcher Intelligence Dashboard
        </button>

        <button
          onClick={onRestart}
          className="py-3 px-4 rounded-xl font-medium text-xs text-zinc-400 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition-all flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retake Capsule Challenge
        </button>
      </div>
    </div>
  );
}
