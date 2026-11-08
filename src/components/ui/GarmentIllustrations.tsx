import React from "react";

interface GarmentSvgProps {
  className?: string;
}

export function ShirtIllustration({ className = "w-full h-full" }: GarmentSvgProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M26 18L34 26L40 20L46 26L54 18L64 28L58 36L54 32V64H26V32L22 36L16 28L26 18Z"
        fill="#F4EFEA"
        stroke="#44403C"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M40 20V64" stroke="#78716C" strokeWidth="1.25" strokeDasharray="2 2" />
      <circle cx="40" cy="30" r="1.5" fill="#44403C" />
      <circle cx="40" cy="40" r="1.5" fill="#44403C" />
      <circle cx="40" cy="50" r="1.5" fill="#44403C" />
      <path d="M46 36H50V44H46V36Z" stroke="#78716C" strokeWidth="1" />
    </svg>
  );
}

export function TeeIllustration({ className = "w-full h-full" }: GarmentSvgProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M28 20C32 24 48 24 52 20L66 28L60 38L54 34V64H26V34L20 38L14 28L28 20Z"
        fill="#F4EFEA"
        stroke="#44403C"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M28 20C34 25 46 25 52 20" stroke="#44403C" strokeWidth="1.5" />
    </svg>
  );
}

export function PantsIllustration({ className = "w-full h-full" }: GarmentSvgProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M26 18H54L56 64H44L40 38L36 64H24L26 18Z"
        fill="#F4EFEA"
        stroke="#44403C"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M26 24H54" stroke="#78716C" strokeWidth="1.25" />
      <path d="M40 24V38" stroke="#78716C" strokeWidth="1.25" />
      <path d="M30 28C30 32 34 34 36 34" stroke="#A8A29E" strokeWidth="1" />
      <path d="M50 28C50 32 46 34 44 34" stroke="#A8A29E" strokeWidth="1" />
    </svg>
  );
}

export function JacketIllustration({ className = "w-full h-full" }: GarmentSvgProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M24 20L32 18H48L56 20L68 32L60 40L54 34V64H26V34L20 40L12 32L24 20Z"
        fill="#F4EFEA"
        stroke="#44403C"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M38 18V64" stroke="#44403C" strokeWidth="1.5" />
      <path d="M42 18V64" stroke="#44403C" strokeWidth="1.5" />
      <rect x="29" y="42" width="7" height="10" rx="1" stroke="#78716C" strokeWidth="1.25" />
      <rect x="44" y="42" width="7" height="10" rx="1" stroke="#78716C" strokeWidth="1.25" />
      <path d="M26 60H54" stroke="#44403C" strokeWidth="1.5" />
    </svg>
  );
}

export function ShoeIllustration({ className = "w-full h-full" }: GarmentSvgProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M16 48L24 34C28 32 38 34 44 40L58 42C64 42 66 46 66 52L64 56H16V48Z"
        fill="#F4EFEA"
        stroke="#44403C"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 56H66V60H14V56Z" fill="#E7E2DA" stroke="#44403C" strokeWidth="1.5" />
      <path d="M34 38L38 46" stroke="#78716C" strokeWidth="1.25" />
      <path d="M38 37L42 45" stroke="#78716C" strokeWidth="1.25" />
      <circle cx="58" cy="48" r="2" fill="#78716C" />
    </svg>
  );
}

export function BagIllustration({ className = "w-full h-full" }: GarmentSvgProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M32 26C32 20 48 20 48 26"
        stroke="#44403C"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="22"
        y="26"
        width="36"
        height="38"
        rx="4"
        fill="#F4EFEA"
        stroke="#44403C"
        strokeWidth="1.75"
      />
      <path d="M22 36H58" stroke="#44403C" strokeWidth="1.5" />
      <path d="M40 36V46" stroke="#44403C" strokeWidth="1.5" />
      <rect x="37" y="44" width="6" height="5" rx="1" fill="#E7E2DA" stroke="#44403C" strokeWidth="1" />
    </svg>
  );
}

export function GarmentGraphic({ type, className = "w-12 h-12" }: { type: string; className?: string }) {
  switch (type) {
    case "shirt":
      return <ShirtIllustration className={className} />;
    case "tee":
      return <TeeIllustration className={className} />;
    case "pants":
    case "denim":
      return <PantsIllustration className={className} />;
    case "jacket":
    case "outerwear":
      return <JacketIllustration className={className} />;
    case "shoe":
    case "footwear":
      return <ShoeIllustration className={className} />;
    case "bag":
    case "accessory":
    default:
      return <BagIllustration className={className} />;
  }
}
