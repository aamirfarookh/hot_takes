"use client";

import React, { useState } from "react";
import {
  Activity,
  ArrowLeft,
  ChevronDown,
  Clock,
  Terminal,
  Scale,
  DollarSign,
  ShieldAlert,
  Sliders,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type {
  ResponseQualityMetrics,
  ResearchInsights,
  BehavioralTelemetryEvent,
} from "@/types/telemetry";
import QualityGauge from "./QualityGauge";

interface ResearcherViewProps {
  metrics: ResponseQualityMetrics;
  insights: ResearchInsights;
  events: BehavioralTelemetryEvent[];
  sessionId: string;
  onBackToConsumer?: () => void;
}

export default function ResearcherView({
  metrics,
  insights,
  events,
  sessionId,
  onBackToConsumer,
}: ResearcherViewProps) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [showFormulas, setShowFormulas] = useState(true);

  // Stated normalized (1 to 5 Likert -> 0 to 100%)
  const statedPct = Math.round(((insights.statedSustainabilityScore - 1) / 4) * 100);
  const revealedPct = insights.revealedSustainabilityShare;
  const gap = statedPct - revealedPct;

  return (
    <div className="space-y-4 w-full text-stone-900">
      {/* Top Researcher Header Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          {onBackToConsumer && (
            <button
              type="button"
              onClick={onBackToConsumer}
              className="p-1.5 -ml-1 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="Return to Consumer View"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-stone-900">
              Researcher Intelligence Audit
            </h2>
            <p className="text-[10px] text-stone-500 font-mono">
              Session: {sessionId.slice(0, 16)}…
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFormulas(!showFormulas)}
          className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
            showFormulas
              ? "bg-stone-900 text-white border-stone-900"
              : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200/80"
          }`}
        >
          <HelpCircle className="w-3 h-3" />
          <span>{showFormulas ? "Hide Definitions" : "Show Definitions"}</span>
        </button>
      </div>

      {/* DEFINITIONS ACCORDION (WHAT DEFINES WHAT) */}
      {showFormulas && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2.5 text-stone-800">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950">
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>What Defines What: Metric Dictionary</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed">
            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200/60">
              <strong className="text-stone-900">1. Stated-vs-Revealed Gap:</strong>
              <p className="text-stone-600 mt-0.5">
                Measures the <em>attitude-behaviour gap</em>. Stated score is 1-5 Likert normalized to 0-100%. Revealed share is % of 5 slots with verified sustainable items. A positive gap indicates stated virtue exceeded real financial commitment.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200/60">
              <strong className="text-stone-900">2. Response Quality Score (0-100):</strong>
              <p className="text-stone-600 mt-0.5">
                Weighted composite checking: Attention Check (25%), Consistency (20%), Speeding threshold (20%), Position Bias (15%), Virtue Signaling pattern (10%), and Interaction Depth (10%).
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200/60">
              <strong className="text-stone-900">3. Greenwash Susceptibility:</strong>
              <p className="text-stone-600 mt-0.5">
                % of choices where the user picked an unverified marketing buzzword (&quot;Eco-inspired&quot;, &quot;Earth-wash&quot;) thinking it was sustainable.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200/60">
              <strong className="text-stone-900">4. WTP Premium Curve:</strong>
              <p className="text-stone-600 mt-0.5">
                Tracks the highest ₹ premium above fast-fashion baseline paid for sustainability, and at what price shock (e.g. Flash Drop) the user switched away.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary Research Finding: Stated vs Revealed Two-Bar Comparison */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-600">
            <Scale className="w-3.5 h-3.5 text-stone-700" />
            Attitude-Behaviour Gap Analysis
          </div>
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${gap > 20 ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-700"}`}>
            Delta: {gap > 0 ? `+${gap}%` : `${gap}%`}
          </span>
        </div>

        {/* Two-Bar Visual Comparison */}
        <div className="space-y-3 pt-1">
          {/* Stated Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-stone-600">Stated Priority ({insights.statedSustainabilityScore}/5 Likert)</span>
              <span className="font-mono font-semibold">{statedPct}%</span>
            </div>
            <div className="h-3 w-full bg-stone-100 rounded-md overflow-hidden">
              <div
                className="h-full bg-stone-400 rounded-md transition-all duration-300"
                style={{ width: `${statedPct}%` }}
              />
            </div>
          </div>

          {/* Revealed Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-stone-800 font-medium">Revealed Choice Share ({insights.certifiedItemsChosen}/5 Slots)</span>
              <span className="font-mono font-semibold text-stone-900">{revealedPct}%</span>
            </div>
            <div className="h-3 w-full bg-stone-100 rounded-md overflow-hidden">
              <div
                className="h-full bg-stone-800 rounded-md transition-all duration-300"
                style={{ width: `${revealedPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Calculation Step-by-Step */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 font-mono text-[11px] text-stone-700 space-y-1">
          <div className="font-sans font-semibold text-stone-900 text-xs">Mathematical Calculation:</div>
          <div>• Stated Priority: (({insights.statedSustainabilityScore} - 1) / 4) * 100 = <strong>{statedPct}%</strong></div>
          <div>• Revealed Share: ({insights.certifiedItemsChosen} / 5 slots) * 100 = <strong>{revealedPct}%</strong></div>
          <div className="pt-1 border-t border-stone-200 font-bold text-stone-900">
            • Stated-vs-Revealed Gap = {statedPct}% - {revealedPct}% = {gap > 0 ? `+${gap}%` : `${gap}%`}
          </div>
        </div>
      </div>

      {/* Response Quality Gauge & Reason Codes */}
      <QualityGauge
        score={metrics.responseQualityScore}
        engagementScore={metrics.engagementScore}
        verdict={metrics.verdict}
        reasonCodes={metrics.reasonCodes}
      />

      {/* Detailed Point Breakdown for RQS */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
        <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-stone-600" />
          RQS 6-Component Point Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-[10px] text-stone-500">Attention Check (25%)</span>
            <div className="font-bold text-stone-900 font-mono mt-0.5">
              {metrics.componentScores.attentionScore} / 100
            </div>
            <span className="text-[9px] text-stone-400">
              {metrics.metrics.passedAttentionCheck ? "Passed probe" : "Failed probe (0 pts)"}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-[10px] text-stone-500">Consistency Match (20%)</span>
            <div className="font-bold text-stone-900 font-mono mt-0.5">
              {metrics.componentScores.consistencyScore} / 100
            </div>
            <span className="text-[9px] text-stone-400">
              {metrics.metrics.isRepeatedChoiceConsistent ? "Identical pick" : "Inconsistent pick"}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-[10px] text-stone-500">Speeding Check (20%)</span>
            <div className="font-bold text-stone-900 font-mono mt-0.5">
              {metrics.componentScores.speedingScore} / 100
            </div>
            <span className="text-[9px] text-stone-400">
              Avg {metrics.metrics.avgSlotLatencyMs}ms / decision
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-[10px] text-stone-500">Position Bias (15%)</span>
            <div className="font-bold text-stone-900 font-mono mt-0.5">
              {metrics.componentScores.positionScore} / 100
            </div>
            <span className="text-[9px] text-stone-400">
              Positions: [{metrics.metrics.cardPositionsSelected.join(", ")}]
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-[10px] text-stone-500">Virtue Autopilot (10%)</span>
            <div className="font-bold text-stone-900 font-mono mt-0.5">
              {metrics.componentScores.socialDesirabilityScore} / 100
            </div>
            <span className="text-[9px] text-stone-400">
              {metrics.metrics.alwaysPickedGreenest ? "Auto-green flag" : "Balanced"}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-[10px] text-stone-500">Interaction Depth (10%)</span>
            <div className="font-bold text-stone-900 font-mono mt-0.5">
              {metrics.componentScores.interactionDepthScore} / 100
            </div>
            <span className="text-[9px] text-stone-400">
              {metrics.metrics.hoverCount} hovers · {metrics.metrics.reversalCount} rev
            </span>
          </div>
        </div>
      </div>

      {/* WTP Premium Curve & Greenwash Susceptibility */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* WTP Curve */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-stone-600" />
              WTP Premium Curve
            </span>
            <span className="text-xs font-mono font-bold text-stone-900">
              Max: ₹{insights.maxPremiumAccepted}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            {insights.wtpPremiumCurve.map((curve, idx) => (
              <div key={`${curve.slotId}-${idx}`} className="flex justify-between py-1 border-b border-stone-100 last:border-none">
                <span className="capitalize text-stone-600">{curve.slotId}</span>
                <span className="font-mono text-stone-800">
                  {curve.choseSustainable ? `Paid +₹${curve.sustainablePremiumOffered}` : "Declined"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Greenwash Susceptibility */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-stone-600" />
              Greenwash Susceptibility
            </span>
            <span className="text-xs font-mono font-bold text-amber-800">
              {insights.greenwashSusceptibilityScore}%
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-600">Decoy Buzzwords Picked:</span>
              <span className="font-mono font-semibold">{insights.greenwashItemsChosen} of 5</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-600">Verified Certified Picked:</span>
              <span className="font-mono font-semibold">{insights.certifiedItemsChosen} of 5</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-600">Fast Fashion Picked:</span>
              <span className="font-mono font-semibold">{insights.cheapFastFashionChosen} of 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Event Timeline */}
      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTimeline(!showTimeline)}
          className="w-full p-3.5 flex items-center justify-between text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-stone-500" />
            <span>Telemetry Event Log ({events.length} Events Emitted)</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showTimeline ? "rotate-180" : ""}`} />
        </button>

        {showTimeline && (
          <div className="p-3 border-t border-stone-100 max-h-56 overflow-y-auto font-mono text-[11px] space-y-1.5 scrollbar-thin bg-stone-50/60">
            {events.map((ev, i) => (
              <div key={`${ev.timestamp}-${i}`} className="flex items-center justify-between py-1 px-2 rounded bg-white border border-stone-200/80">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-stone-400 text-[10px]">[{ev.screenId}]</span>
                  <span className="text-stone-900 font-semibold">{ev.eventType}</span>
                  {ev.payload && (
                    <span className="text-stone-500 text-[10px] truncate max-w-xs">
                      {JSON.stringify(ev.payload)}
                    </span>
                  )}
                </div>
                <div className="text-stone-400 text-[10px] flex-shrink-0 ml-2">
                  +{ev.latencyMs}ms
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
