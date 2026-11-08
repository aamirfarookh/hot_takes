"use client";

import React from "react";
import type { ClosetSlotCategory, ProductCard } from "@/types/game";

interface ClosetTrackerProps {
  slots: { id: ClosetSlotCategory; label: string }[];
  currentSlotIndex: number;
  selectedItems: (ProductCard | null)[];
  onSlotClick?: (index: number) => void;
}

function SlotIcon({ category, filled }: { category: ClosetSlotCategory; filled: boolean }) {
  const stroke = filled ? "#1C1917" : "#A8A29E";
  const fill = filled ? "#1C1917" : "none";

  switch (category) {
    case "top":
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill={fill} stroke={stroke} strokeWidth="1.75">
          <path d="M4 6L8 3H16L20 6L18 10L15 8V20H9V8L6 10L4 6Z" strokeLinejoin="round" />
        </svg>
      );
    case "bottom":
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill={fill} stroke={stroke} strokeWidth="1.75">
          <path d="M7 4H17L18 20H13L12 11L11 20H6L7 4Z" strokeLinejoin="round" />
        </svg>
      );
    case "outerwear":
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill={fill} stroke={stroke} strokeWidth="1.75">
          <path d="M5 5L9 3H15L19 5L21 11L18 12L16 9V20H8V9L6 12L3 11L5 5Z" strokeLinejoin="round" />
        </svg>
      );
    case "footwear":
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill={fill} stroke={stroke} strokeWidth="1.75">
          <path d="M4 14L8 8C10 7 14 8 16 11L20 12C21 12 21 14 21 16L20 18H4V14Z" strokeLinejoin="round" />
        </svg>
      );
    case "accessory":
    default:
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill={fill} stroke={stroke} strokeWidth="1.75">
          <rect x="5" y="8" width="14" height="12" rx="2" strokeLinejoin="round" />
          <path d="M9 8V5C9 3.5 15 3.5 15 5V8" />
        </svg>
      );
  }
}

export default function ClosetTracker({
  slots,
  currentSlotIndex,
  selectedItems,
  onSlotClick,
}: ClosetTrackerProps) {
  return (
    <div className="flex items-center justify-between gap-1 w-full py-1">
      {slots.map((slot, index) => {
        const isFilled = selectedItems[index] !== null;
        const isCurrent = index === currentSlotIndex;

        return (
          <button
            key={slot.id}
            type="button"
            onClick={() => onSlotClick?.(index)}
            className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-all ${
              isCurrent
                ? "bg-stone-200/90 border border-stone-300/80 shadow-xs"
                : isFilled
                ? "bg-white/80 border border-stone-200/80"
                : "bg-stone-100/60 border border-transparent opacity-60"
            }`}
            aria-label={`${slot.label}: ${isFilled ? "Selected" : "Empty"}`}
            aria-current={isCurrent ? "step" : undefined}
          >
            <div className={`p-1 rounded-lg ${isCurrent ? "text-stone-900" : isFilled ? "text-stone-800" : "text-stone-400"}`}>
              <SlotIcon category={slot.id} filled={isFilled} />
            </div>
            <span className={`text-[10px] font-medium leading-none capitalize truncate ${isCurrent ? "text-stone-900 font-semibold" : "text-stone-500"}`}>
              {slot.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
