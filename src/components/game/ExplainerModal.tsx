"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  HelpCircle,
  Scale,
  ShieldCheck,
  Zap,
  BarChart3,
  Layers,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface ExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExplainerModal({ isOpen, onClose }: ExplainerModalProps) {
  const [activeTab, setActiveTab] = useState<"construct" | "cards" | "probes" | "scoring" | "personalities">("construct");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/50 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-white border border-stone-200 shadow-2xl flex flex-col overflow-hidden text-stone-900"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-stone-200/80 text-stone-700">
                <HelpCircle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  What Defines What: Research & Scoring Guide
                </h3>
                <p className="text-[11px] text-stone-500">
                  A transparent reference guide to the experimental methodology
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-200/70 text-stone-400 hover:text-stone-700 transition-colors"
              aria-label="Close guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-stone-100 bg-white overflow-x-auto scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("construct")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === "construct"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              Core Construct
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cards")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === "cards"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              Card Types
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("probes")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === "probes"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              Probes & Shocks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("scoring")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === "scoring"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              Scoring Formulas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("personalities")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === "personalities"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              Personalities
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs text-stone-700 leading-relaxed scrollbar-thin">
            {/* TAB 1: CORE CONSTRUCT */}
            {activeTab === "construct" && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    The Research Problem
                  </span>
                  <h4 className="text-sm font-semibold text-stone-900 mt-1">
                    The Attitude-Behaviour Gap in Survey Research
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    When asked <em>&quot;How important is sustainability to you? (1-5)&quot;</em>, 80%+ of consumers rate it 4 or 5 because self-reporting moral virtues carries <strong>₹0 cost</strong> (social desirability bias).
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-semibold text-stone-900">How the Redesign Solves It</h5>
                  <p>
                    By giving users a fixed <strong>₹3,000 budget</strong> across 5 closet slots, every choice carries a zero-sum economic trade-off. Choosing genuine sustainability requires paying a ₹300–₹700 premium, forcing participants to reveal their true behavioral priorities against style, brand status, and wallet savings.
                  </p>

                  <div className="p-3 rounded-xl bg-stone-100/80 font-mono text-[11px] text-stone-800 space-y-1">
                    <div className="font-semibold text-stone-900">The Gap Formula:</div>
                    <div>Stated Score = Normalized 1-5 Likert (e.g. 5/5 = 100%)</div>
                    <div>Revealed Share = (Certified items chosen / 5 slots) * 100</div>
                    <div className="text-stone-900 font-bold pt-1 border-t border-stone-200">
                      Stated-vs-Revealed Gap = Stated % - Revealed %
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CARD TYPES */}
            {activeTab === "cards" && (
              <div className="space-y-3">
                <p className="text-xs text-stone-600">
                  Each slot presents 3–4 items carefully designed to test competing behavioral heuristics under equal visual weight:
                </p>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">1. Verified Sustainable</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        AUDITED STANDARD
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Features verified third-party standards (GOTS Organic, GRS Recycled, FSC Rubber) at a realistic ₹300–₹700 price premium. Tests authentic willingness to pay.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">2. Greenwashed Decoy</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        DECOY BUZZWORD
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Features vague labels like <em>&quot;Eco-inspired&quot;</em>, <em>&quot;Earth-wash&quot;</em>, or <em>&quot;Planet-kind&quot;</em> with NO audit. Tests whether the consumer is fooled by superficial marketing cues.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">3. Conventional Fast Fashion</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                        VALUE MAXIMIZER
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Cheap (₹449–₹549), trendy virgin synthetics. Tests whether low price and silhouette hype override ethics.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PROBES & SHOCKS */}
            {activeTab === "probes" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <h5 className="font-semibold text-stone-900">The 3 Mid-Game Disruptions (Price Elasticity Shocks)</h5>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <strong>1. Flash Drop (-50%):</strong> Slashes fast-fashion jacket price to ₹325. Tests if bargain hunters immediately abandon sustainable outerwear.
                    </div>
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <strong>2. Surcharge Shock (-₹350):</strong> Reduces remaining budget. Observes if sustainability is the first attribute sacrificed when funds tighten.
                    </div>
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <strong>3. Raw Material Surge (+₹200):</strong> Adds surcharge to the artisan bag. Measures the exact marginal willingness-to-pay ceiling.
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <h5 className="font-semibold text-stone-900">The 3 Embedded Quality Probes</h5>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <strong>Consistency Probe:</strong> Re-presents Top slot with inverted positions (#1 Fast, #2 Decoy, #3 Sustainable). Checks if user picks the identical item or clicks randomly.
                    </div>
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <strong>Attention Check:</strong> Disguised item in Footwear stating <em>&quot;Quality probe: Select this item to confirm human review&quot;</em>.
                    </div>
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <strong>Reverse-Framed Trap:</strong> Top slot satin blouse with a high ₹1,199 price but toxic petroleum emissions. Catches respondents assuming &quot;expensive = ethical&quot;.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SCORING FORMULAS */}
            {activeTab === "scoring" && (
              <div className="space-y-3">
                <p className="text-xs text-stone-600">
                  <strong>Response Quality Score (RQS 0–100)</strong> is an explainable composite heuristic identifying bots, speedrunners, and satisficers:
                </p>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span>1. Attention Check Pass</span>
                    <span className="font-bold">25 pts</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span>2. Consistency Match (Swapped probe)</span>
                    <span className="font-bold">20 pts</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span>3. Speeding Check (&gt;2,200ms threshold)</span>
                    <span className="font-bold">20 pts</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span>4. Position Bias (No straight-lining)</span>
                    <span className="font-bold">15 pts</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span>5. Virtue Signaling (No unthinking auto-green)</span>
                    <span className="font-bold">10 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>6. Interaction Depth (Hovers & revisions)</span>
                    <span className="font-bold">10 pts</span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500">
                  <strong>Verdict Bands:</strong> &ge;75 = <code>HIGH</code> (Verified clean data), 50–74 = <code>REVIEW</code>, &lt;50 = <code>LOW</code> (Discarded/Bot).
                </div>
              </div>
            )}

            {/* TAB 5: PERSONALITIES */}
            {activeTab === "personalities" && (
              <div className="space-y-2.5">
                <p className="text-xs text-stone-600">
                  Participants are classified into consumer archetypes based on revealed behavior:
                </p>

                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <strong>Conscious Curator:</strong> &ge;60% verified sustainable items chosen. Pays green premiums even under budget stress.
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <strong>Eco-Aesthetic Explorer:</strong> &ge;40% greenwashed decoys chosen. Drawn to natural branding but susceptible to unverified claims.
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <strong>Budget Pragmatist:</strong> Leaves &gt;30% of budget unspent. Highly price-elastic; prioritizes financial reserves over ethics.
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <strong>Pragmatic Balancer:</strong> 20%–59% sustainable items chosen. Selectively invests in hero pieces (e.g., outerwear) while economizing on basics.
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <strong>Trend Chaser:</strong> Low sustainability share; prioritizes trend velocity, fast fashion silhouettes, and immediate style appeal.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
            <span className="text-stone-500 text-[11px]">
              Toggle <strong>X-Ray Mode</strong> on the game screen to inspect these live.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
