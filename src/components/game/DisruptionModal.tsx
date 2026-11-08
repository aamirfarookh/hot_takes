"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import type { DisruptionEventConfig } from "@/types/game";

interface DisruptionModalProps {
  disruption: DisruptionEventConfig | null;
  onRespond: (disruptionId: string, optionId: string, action: string) => void;
}

export default function DisruptionModal({ disruption, onRespond }: DisruptionModalProps) {
  if (!disruption) return null;

  const getIcon = () => {
    switch (disruption.impactType) {
      case "discount":
        return <Zap className="w-5 h-5 text-amber-400" />;
      case "budget_reduction":
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case "price_surge":
        return <TrendingUp className="w-5 h-5 text-violet-400" />;
    }
  };

  const getBorderColor = () => {
    switch (disruption.impactType) {
      case "discount":
        return "border-amber-500/40 bg-amber-500/10";
      case "budget_reduction":
        return "border-rose-500/40 bg-rose-500/10";
      case "price_surge":
        return "border-violet-500/40 bg-violet-500/10";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl text-zinc-100"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-xl border ${getBorderColor()}`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 leading-tight">
                {disruption.title}
              </h3>
              <p className="text-xs text-zinc-400 font-medium">
                {disruption.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="my-4 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
            {disruption.description}
          </div>

          {/* Impact Explainer (Micro-Callout) */}
          <div className="mb-5 text-[11px] text-zinc-500 italic">
            💡 Behavioral test: {disruption.impactDetails.explanation}
          </div>

          {/* Interactive Response Buttons */}
          <div className="space-y-2.5">
            {disruption.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onRespond(disruption.id, opt.id, opt.action)}
                className="w-full text-left p-3.5 rounded-xl border border-zinc-800 bg-zinc-800/80 hover:bg-zinc-700/80 hover:border-zinc-600 transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {opt.description}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
