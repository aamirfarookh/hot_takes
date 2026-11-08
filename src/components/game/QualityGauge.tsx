"use client";

import React from "react";
import type { QualityVerdict, QualityReasonCode } from "@/types/telemetry";

interface QualityGaugeProps {
  score: number;
  engagementScore: number;
  verdict: QualityVerdict;
  reasonCodes: QualityReasonCode[];
}

export default function QualityGauge({
  score,
  engagementScore,
  verdict,
  reasonCodes,
}: QualityGaugeProps) {
  const getVerdictStyle = () => {
    switch (verdict) {
      case "HIGH":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "REVIEW":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "LOW":
        return "bg-rose-50 text-rose-800 border-rose-200";
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Response Quality (RQS)
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold font-mono text-stone-900">{score}</span>
            <span className="text-xs text-stone-400 font-mono">/ 100</span>
          </div>
        </div>

        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getVerdictStyle()}`}>
          {verdict} VERDICT
        </span>
      </div>

      {/* RQS Progress Track */}
      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score >= 75 ? "bg-emerald-600" : score >= 50 ? "bg-amber-600" : "bg-rose-600"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      {/* Engagement comparison */}
      <div className="flex justify-between items-center text-xs pt-1 border-t border-stone-100">
        <span className="text-stone-500">Interaction Engagement:</span>
        <span className="font-mono font-medium text-stone-800">{engagementScore} / 100</span>
      </div>

      {/* Reason Code Chips */}
      {reasonCodes.length > 0 ? (
        <div className="pt-2 border-t border-stone-100 space-y-1.5">
          <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
            Flagged Diagnostic Codes
          </span>
          <div className="flex flex-wrap gap-1.5">
            {reasonCodes.map((code) => (
              <span
                key={code}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-100">
          Clean response pattern. No satisficing or speedrun anomalies detected.
        </div>
      )}
    </div>
  );
}
