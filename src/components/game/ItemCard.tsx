"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck, Sparkles, Tag, AlertCircle } from "lucide-react";
import type { ProductCard } from "@/types/game";

interface ItemCardProps {
  item: ProductCard;
  selected: boolean;
  disabled: boolean;
  onSelect: (item: ProductCard) => void;
  onHover: (itemId: string) => void;
}

export default function ItemCard({
  item,
  selected,
  disabled,
  onSelect,
  onHover,
}: ItemCardProps) {
  const isCertified = item.sustainabilityTier === "certified_sustainable";
  const isGreenwashed = item.sustainabilityTier === "greenwashed_decoy";

  return (
    <motion.div
      whileHover={!disabled || selected ? { scale: 1.015, y: -2 } : {}}
      whileTap={!disabled || selected ? { scale: 0.985 } : {}}
      onMouseEnter={() => onHover(item.id)}
      onClick={() => {
        if (!disabled || selected) {
          onSelect(item);
        }
      }}
      className={`relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 select-none ${
        selected
          ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/20"
          : disabled
          ? "border-zinc-800/60 bg-zinc-900/40 opacity-45 cursor-not-allowed"
          : "border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 hover:bg-zinc-800/80"
      }`}
    >
      {/* Selected Indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold shadow-md"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </motion.div>
      )}

      {/* Top Header: Emoji + Title + Price */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-3xl p-1 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex-shrink-0">
            {item.imageEmoji}
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-1">
              {item.name}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-zinc-500 font-medium">{item.brandFamiliarity}</span>
              <span className="text-zinc-600">·</span>
              <span className="inline-flex items-center gap-1 text-zinc-300">
                <Tag className="w-2.5 h-2.5 text-zinc-500" />
                {item.styleTag}
              </span>
            </p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-base font-bold text-zinc-100 tracking-tight">
            ₹{item.price.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed line-clamp-2">
        {item.description}
      </p>

      {/* Sustainability / Attribute Badges */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isCertified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              {item.sustainabilityAttribute}
            </span>
          )}

          {isGreenwashed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3 h-3" />
              {item.sustainabilityAttribute}
            </span>
          )}

          {!isCertified && !isGreenwashed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/60">
              {item.sustainabilityAttribute}
            </span>
          )}
        </div>

        {item.certification && (
          <span className="text-[9px] uppercase tracking-wider text-emerald-400/80 font-mono">
            Audit Verified
          </span>
        )}
      </div>
    </motion.div>
  );
}
