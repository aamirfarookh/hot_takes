"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import type { DisruptionEventConfig } from "@/types/game";

interface DisruptionSheetProps {
  disruption: DisruptionEventConfig | null;
  onRespond: (disruptionId: string, optionId: string, action: string) => void;
}

export default function DisruptionSheet({ disruption, onRespond }: DisruptionSheetProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(2);
  const [canDismiss, setCanDismiss] = useState<boolean>(false);

  useEffect(() => {
    if (!disruption) {
      setSecondsRemaining(2);
      setCanDismiss(false);
      return;
    }

    setSecondsRemaining(2);
    setCanDismiss(false);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanDismiss(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [disruption]);

  if (!disruption) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-t-3xl bg-white border-t border-x border-stone-200 p-6 shadow-2xl text-stone-900 space-y-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disruption-title"
        >
          {/* Header pill & timer badge */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
              Capsule Update
            </span>

            {!canDismiss && (
              <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                Reviewing ({secondsRemaining}s)
              </span>
            )}
          </div>

          <div>
            <h3 id="disruption-title" className="text-lg font-semibold text-stone-900 tracking-tight">
              {disruption.title}
            </h3>
            <p className="text-xs font-medium text-stone-500 mt-0.5">
              {disruption.subtitle}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 leading-relaxed">
            {disruption.description}
          </div>

          {/* Action options in bottom thumb zone */}
          <div className="space-y-2 pt-2">
            {disruption.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={!canDismiss}
                onClick={() => onRespond(disruption.id, opt.id, opt.action)}
                className={`w-full min-h-[44px] text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                  canDismiss
                    ? "border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50 active:scale-[0.99] cursor-pointer"
                    : "border-stone-100 bg-stone-50/60 opacity-60 cursor-not-allowed"
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-stone-900">
                    {opt.label}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {opt.description}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5 flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
