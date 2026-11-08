"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, ChevronRight, X } from "lucide-react";
import type { ProductCard as ProductCardType } from "@/types/game";
import { GarmentGraphic } from "../ui/GarmentIllustrations";
import AttributeChip from "./AttributeChip";

interface ProductCardProps {
  item: ProductCardType;
  selected: boolean;
  disabled: boolean;
  showXRay?: boolean;
  onSelect: (item: ProductCardType) => void;
  onHover: (itemId: string) => void;
  onViewDetails?: (item: ProductCardType) => void;
}

export default function ProductCard({
  item,
  selected,
  disabled,
  showXRay = false,
  onSelect,
  onHover,
  onViewDetails,
}: ProductCardProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const chips = item.attributeChips && item.attributeChips.length > 0
    ? item.attributeChips
    : [item.styleTag, item.sustainabilityAttribute];

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHover(item.id);
    onViewDetails?.(item);
    setShowDetailsModal(true);
  };

  return (
    <>
      <motion.div
        whileTap={!disabled || selected ? { scale: 0.985 } : {}}
        onMouseEnter={() => onHover(item.id)}
        onClick={() => {
          if (!disabled || selected) {
            onSelect(item);
          }
        }}
        className={`relative w-full rounded-2xl p-3.5 transition-all duration-200 cursor-pointer select-none text-left border ${
          selected
            ? "bg-white border-stone-800 ring-2 ring-stone-800 shadow-md"
            : disabled
            ? "bg-stone-100/60 border-stone-200/60 opacity-50 cursor-not-allowed"
            : "bg-white border-stone-200/90 hover:border-stone-300 hover:shadow-xs active:bg-stone-50"
        }`}
        role="button"
        tabIndex={disabled && !selected ? -1 : 0}
        aria-pressed={selected}
        aria-label={`${item.name}, ₹${item.price}. ${item.brandName || item.brandFamiliarity}. ${selected ? "Selected" : "Not selected"}`}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && (!disabled || selected)) {
            e.preventDefault();
            onSelect(item);
          }
        }}
      >
        {/* X-Ray Research Indicator (Only visible when Evaluator X-Ray Mode is ON) */}
        {showXRay && (
          <div className="mb-2.5 p-2 rounded-xl border text-[11px] space-y-1 bg-stone-50 border-stone-200">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                {item.evaluatorRole === "certified_sustainable" ? (
                  <span className="text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Verified Sustainable
                  </span>
                ) : item.evaluatorRole === "greenwashed_decoy" ? (
                  <span className="text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                    Greenwash Decoy
                  </span>
                ) : item.evaluatorRole === "attention_probe" ? (
                  <span className="text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                    Attention Check Probe
                  </span>
                ) : item.evaluatorRole === "reverse_frame_trap" ? (
                  <span className="text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                    Reverse-Framed Trap
                  </span>
                ) : (
                  <span className="text-stone-800 bg-stone-200 px-1.5 py-0.5 rounded">
                    Fast Fashion Baseline
                  </span>
                )}
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {item.sustainabilityTier}
              </span>
            </div>
            {item.evaluatorNote && (
              <p className="text-[10px] text-stone-600 leading-tight">
                💡 {item.evaluatorNote}
              </p>
            )}
          </div>
        )}
        <div className="flex items-start gap-3">
          {/* Garment Graphic / Illustration */}
          <div className="w-14 h-14 rounded-xl bg-stone-100/80 border border-stone-200/70 p-1 flex-shrink-0 flex items-center justify-center">
            <GarmentGraphic type={item.illustrationType || item.category} className="w-11 h-11" />
          </div>

          {/* Main Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-medium text-stone-500 tracking-normal truncate">
                {item.brandName || item.brandFamiliarity}
              </span>
              <span className="text-sm font-semibold text-stone-900 font-mono tracking-tight flex-shrink-0">
                ₹{item.price.toLocaleString("en-IN")}
              </span>
            </div>

            <h3 className="text-sm font-medium text-stone-900 leading-snug line-clamp-1 mt-0.5">
              {item.name}
            </h3>

            {/* Attribute Chip Row - Strict Equal Visual Weight */}
            <div className="flex flex-wrap gap-1 mt-2">
              {chips.map((chip, idx) => (
                <AttributeChip key={`${chip}-${idx}`} label={chip} />
              ))}
            </div>
          </div>
        </div>

        {/* Card Footer: Detail view trigger & Selection check */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleDetailsClick}
            className="text-[11px] text-stone-500 hover:text-stone-800 transition-colors inline-flex items-center gap-0.5 py-1 px-1 -ml-1 rounded"
          >
            <Info className="w-3 h-3 text-stone-400" />
            <span>Fabric & details</span>
          </button>

          <div className="flex items-center gap-1.5">
            {disabled && !selected && (
              <span className="text-[10px] text-stone-400">Over remaining budget</span>
            )}

            {selected && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-900 bg-stone-100 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3 stroke-[2.5]" />
                Selected
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Details Sheet Modal */}
      <AnimatePresence>
        {showDetailsModal && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white p-5 border border-stone-200 shadow-xl space-y-3.5 text-stone-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                    {item.brandName || item.brandFamiliarity}
                  </span>
                  <h4 className="text-base font-semibold text-stone-900 mt-0.5">
                    {item.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-stone-700 leading-relaxed">
                {item.description}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Retail Price</span>
                  <span className="font-mono font-medium">₹{item.price.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Style Cut</span>
                  <span>{item.styleTag}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Fabric Attribution</span>
                  <span className="text-stone-800">{item.sustainabilityAttribute}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!disabled || selected) {
                    onSelect(item);
                  }
                  setShowDetailsModal(false);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  selected
                    ? "bg-stone-200 text-stone-800 hover:bg-stone-300"
                    : disabled
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                    : "bg-stone-900 text-white hover:bg-stone-800"
                }`}
              >
                {selected ? "Deselect from Closet" : disabled ? "Over Budget" : `Select for ₹${item.price}`}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
