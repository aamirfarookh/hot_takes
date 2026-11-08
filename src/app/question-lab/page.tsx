"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Loader2,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { CLOTHING_SUSTAINABILITY_DEMO_QUESTION } from "@/lib/questionLabFallback";
import type { QuestionAnalysisResult, BiasFlag } from "@/types/question-lab";

const SAMPLE_PRESETS = [
  {
    label: "Clothing Sustainability (Baseline)",
    question: CLOTHING_SUSTAINABILITY_DEMO_QUESTION,
  },
  {
    label: "Data Privacy Valuation",
    question:
      "How much do you value your digital data privacy when using free mobile apps? (1: Not at all ... 5: Extremely)",
  },
  {
    label: "Fast Delivery vs Packaging",
    question:
      "Do you support eco-friendly delivery packaging even if it delays your order?",
  },
];

export default function QuestionLabPage() {
  const [questionInput, setQuestionInput] = useState<string>(
    CLOTHING_SUSTAINABILITY_DEMO_QUESTION
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<QuestionAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleAnalyze(CLOTHING_SUSTAINABILITY_DEMO_QUESTION);
  }, []);

  const handleAnalyze = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/question-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }

      const data: QuestionAnalysisResult = await res.json();
      setAnalysis(data);
    } catch (err: unknown) {
      console.error("[Question Lab Error]", err);
      setError("Failed to run analysis. Check network or server logs.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: BiasFlag["severity"]) => {
    switch (severity) {
      case 3:
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          label: "Critical (Level 3)",
        };
      case 2:
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          label: "Moderate (Level 2)",
        };
      case 1:
        return {
          bg: "bg-stone-100 text-stone-700 border-stone-200",
          label: "Low (Level 1)",
        };
      default:
        return {
          bg: "bg-stone-50 text-stone-400 border-stone-200",
          label: "Neutral (Level 0)",
        };
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 max-w-3xl mx-auto bg-[#F2EFE9] text-stone-900 space-y-6">
      {/* Editorial Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-300">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1.5 -ml-1 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
            title="Return to Prototype"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-stone-900">
              Question Intelligence Lab
            </h1>
            <p className="text-xs text-stone-500">
              Methodological audit & revealed-preference redesign engine
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
        >
          <span>Play Prototype</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Input Section */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
        <label htmlFor="question-input" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
          Conventional Survey Question to Audit
        </label>

        <div className="flex gap-2">
          <input
            id="question-input"
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Type or paste any survey inquiry..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 font-sans"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAnalyze(questionInput);
            }}
          />
          <button
            type="button"
            onClick={() => handleAnalyze(questionInput)}
            disabled={loading || !questionInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Analyze</span>
          </button>
        </div>

        {/* Demo Preset Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-stone-400">Presets:</span>
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setQuestionInput(preset.question);
                handleAnalyze(preset.question);
              }}
              className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200/80 text-[11px] text-stone-700 transition-colors border border-stone-200/80 cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Structured Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Top Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-stone-200">
              <span className="text-[10px] text-stone-400 uppercase font-semibold">Bias Vulnerability</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-bold font-mono text-rose-700">{analysis.overallRiskScore}</span>
                <span className="text-xs text-stone-400">/ 100</span>
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5">Exposure to social desirability bias</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-stone-200">
              <span className="text-[10px] text-stone-400 uppercase font-semibold">Recommended Format</span>
              <div className="text-xs font-semibold text-stone-900 mt-1 line-clamp-1">
                {analysis.recommendedFormat.displayName}
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5 font-mono">
                {analysis.recommendedFormat.format}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-stone-200">
              <span className="text-[10px] text-stone-400 uppercase font-semibold">Construct Fidelity</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-bold font-mono text-stone-900">
                  {analysis.constructPreservation.fidelityScore}%
                </span>
                <span className="text-xs text-stone-400">Preserved</span>
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5">Target construct operationalized</p>
            </div>
          </div>

          {/* Diagnostic Bias Dimensions */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
            <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-stone-500" />
              Cognitive Bias Audit (5 Dimensions)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {analysis.biasFlags.map((flag) => {
                const badge = getSeverityBadge(flag.severity);
                return (
                  <div key={flag.flag} className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-medium text-stone-900">{flag.displayName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">{flag.explanation}</p>
                    <p className="text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
                      <strong>Mitigation:</strong> {flag.mitigation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Redesigned Behavioral Concept */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Gamified Redesign Concept
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                Est: {analysis.redesignedConcept.participantTimeEstimate}
              </span>
            </div>

            <h3 className="text-base font-semibold text-stone-900">
              {analysis.redesignedConcept.title}
            </h3>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700 leading-relaxed italic">
              &ldquo;{analysis.redesignedConcept.behaviouralVersion}&rdquo;
            </div>

            <div className="space-y-1.5 text-xs text-stone-700">
              <p><strong>Mechanic:</strong> {analysis.redesignedConcept.gamifiedMechanic}</p>
              <p><strong>Revealed Metric:</strong> {analysis.redesignedConcept.primaryBehavioralMetric}</p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                This redesigned mechanic is live in our prototype.
              </span>
              <Link
                href="/"
                className="px-3.5 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs font-medium transition-colors inline-flex items-center gap-1"
              >
                <span>Launch Prototype</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Construct Preservation Check */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-600" />
                Construct Preservation Proof
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                Valid: 100% Preserved
              </span>
            </div>

            <div className="text-xs space-y-1 text-stone-700 leading-relaxed">
              <p><strong>Construct:</strong> {analysis.constructPreservation.constructBeingMeasured}</p>
              <p>{analysis.constructPreservation.analysis}</p>
              <p className="text-[11px] text-stone-500 pt-1">
                <strong>Trade-offs:</strong> {analysis.constructPreservation.tradeOffs}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
