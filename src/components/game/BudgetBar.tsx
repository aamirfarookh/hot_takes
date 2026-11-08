"use client";

import React from "react";
import { motion } from "framer-motion";

interface BudgetBarProps {
  remainingBudget: number;
  totalBudget: number;
}

export default function BudgetBar({ remainingBudget, totalBudget }: BudgetBarProps) {
  const isNegative = remainingBudget < 0;
  const percentage = Math.max(0, Math.min(100, (remainingBudget / totalBudget) * 100));
  const isTight = remainingBudget < 500 || isNegative;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-stone-500 uppercase tracking-wider text-[10px]">Budget Allowance</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-sm font-semibold tracking-tight font-mono ${isNegative ? "text-rose-700" : isTight ? "text-amber-800" : "text-stone-900"}`}>
            {isNegative ? `-₹${Math.abs(remainingBudget).toLocaleString("en-IN")} (Over)` : `₹${remainingBudget.toLocaleString("en-IN")}`}
          </span>
          <span className="text-[11px] text-stone-500">/ ₹{totalBudget.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="h-1.5 w-full bg-stone-200/80 rounded-full overflow-hidden" role="progressbar" aria-valuenow={remainingBudget} aria-valuemin={0} aria-valuemax={totalBudget}>
        <motion.div
          className={`h-full rounded-full transition-colors ${isNegative ? "bg-rose-500" : isTight ? "bg-amber-600" : "bg-stone-800"}`}
          initial={{ width: "100%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
