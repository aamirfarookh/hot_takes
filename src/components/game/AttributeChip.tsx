import React from "react";

interface AttributeChipProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

/**
 * AttributeChip component with strict equal visual weighting.
 * All chips share identical stone/warm-neutral styling, neutral font,
 * and zero color highlighting, avoiding any visual priming of sustainability.
 */
export default function AttributeChip({ label, onClick, className = "" }: AttributeChipProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-stone-700 bg-stone-100/90 border border-stone-200/90 tracking-normal ${className}`}
    >
      {label}
    </span>
  );
}
