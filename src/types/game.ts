/**
 * Domain Models for "Limited Closet" Budget-Allocation Trade-Off Game
 */

export type ClosetSlotCategory = "top" | "bottom" | "outerwear" | "footwear" | "accessory";

export type SustainabilityTier =
  | "certified_sustainable" // Verified certification (GOTS Organic, Fair-Wage, GRS Recycled)
  | "greenwashed_decoy"     // Superficial buzzwords ("eco-inspired", "earth-vibe") with no certification
  | "conventional_fast";    // Non-sustainable, high-trend, cheap

export interface ProductCard {
  id: string;
  name: string;
  category: ClosetSlotCategory;
  price: number; // In INR (₹)
  styleTag: string; // e.g., "Trending Oversized", "Streetwear Essential", "Clean Minimalist"
  brandFamiliarity: "Global Fast-Fashion Icon" | "Cult Streetwear Brand" | "Artisan Studio" | "Mass Retailer";
  sustainabilityTier: SustainabilityTier;
  sustainabilityAttribute: string; // e.g. "GOTS 100% Organic Cotton" or "Eco-Inspired Natural Blend" or "None (Virgin Poly)"
  certification?: string; // e.g., "GOTS / Fair Trade Certified" (null for decoys and conventional)
  imageEmoji: string;
  illustrationType?: "shirt" | "tee" | "pants" | "denim" | "jacket" | "shoe" | "bag";
  brandName?: string; // Fictional brand name e.g. "Kite & Thread"
  attributeChips?: string[]; // Row of chips with equal visual weight
  isAttentionCheck?: boolean; // If true, this item has special instructions testing reading
  isReverseFramed?: boolean; // Reverse framed item testing attentiveness
  description: string;
  evaluatorRole?: "certified_sustainable" | "greenwashed_decoy" | "fast_fashion" | "attention_probe" | "reverse_frame_trap";
  evaluatorNote?: string; // Direct explanation of what construct this card tests
}

export interface DisruptionEventConfig {
  id: "flash_sale" | "budget_cut" | "premium_hike";
  title: string;
  subtitle: string;
  triggerAfterSlotIndex: number; // 0-based slot index after which this appears
  description: string;
  impactType: "discount" | "budget_reduction" | "price_surge";
  impactDetails: {
    targetSlot?: ClosetSlotCategory;
    targetTier?: SustainabilityTier;
    amount?: number; // e.g., ₹400 budget cut or ₹250 eco-surcharge or 50% discount
    explanation: string;
  };
  options: {
    id: string;
    label: string;
    description: string;
    action: "accept_switch" | "keep_choice" | "absorb_cut" | "rebalance_previous";
  }[];
}

export interface ClosetPersonality {
  id: string;
  archetype: string;
  tagline: string;
  description: string;
  badgeColor: string;
  traits: string[];
}
