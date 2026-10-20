import { ConvexError } from "convex/values";

// Hard pricing rules (spec Section 5.3). Every write of a price goes through assertPriceAllowed,
// so neither the AI nor a manual edit can break them.

export const FAMILY_SETUP_MAX = 500;
export const FAMILY_MONTHLY_MAX = 100;

export function assertPriceAllowed(p: { sizeSignal: string; setupPrice: number; monthlyPrice: number }) {
  if (!Number.isInteger(p.setupPrice) || !Number.isInteger(p.monthlyPrice) || p.setupPrice < 0 || p.monthlyPrice < 0) {
    throw new ConvexError("Prices must be whole, non-negative dollar amounts.");
  }
  if (p.sizeSignal === "family_solo" && (p.setupPrice > FAMILY_SETUP_MAX || p.monthlyPrice > FAMILY_MONTHLY_MAX)) {
    throw new ConvexError(`Family/solo businesses are capped at $${FAMILY_SETUP_MAX} setup and $${FAMILY_MONTHLY_MAX}/month.`);
  }
}
