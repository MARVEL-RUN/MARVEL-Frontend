import { categoryFeeAmount } from "@/lib/registration-options";
import type { RegistrationCategory } from "@/services/main/types";
import type { AppliedDiscount, PriceCalculation } from "./types";

export function lookupPriceSnapshotKey(categoryId: string, birth: string) {
  return `${categoryId.trim()}:${birth.replace(/\D/g, "")}`;
}

export type LookupStoredPricing = {
  hasPriceCalculation?: boolean;
  priceCalculation?: PriceCalculation;
  priceSnapshotKey?: string;
};

export function lookupStoredPricing(
  categoryId: string,
  birth: string,
  hasPriceCalculation?: boolean,
  priceCalculation?: PriceCalculation,
): LookupStoredPricing {
  if (!hasPriceCalculation || !priceCalculation) return {};
  return {
    hasPriceCalculation: true,
    priceCalculation,
    priceSnapshotKey: lookupPriceSnapshotKey(categoryId, birth),
  };
}

function applyStoredPercentDiscounts(baseAmount: number, appliedDiscounts: AppliedDiscount[]) {
  if (!appliedDiscounts.length) return baseAmount;
  let amount = baseAmount;
  for (const item of appliedDiscounts) {
    if (item.method !== "PERCENT" || item.ratePercent == null) continue;
    amount -= (amount * item.ratePercent) / 100;
  }
  return Math.round(amount);
}

export function lookupEditFeeAmount(
  pricing: LookupStoredPricing,
  categoryId: string,
  birth: string,
  category: RegistrationCategory | undefined,
): number {
  if (!category) return 0;
  const baseAmount = categoryFeeAmount(category, birth);
  if (!pricing.hasPriceCalculation || !pricing.priceCalculation) {
    return baseAmount;
  }

  const key = lookupPriceSnapshotKey(categoryId, birth);
  if (pricing.priceSnapshotKey === key) {
    return pricing.priceCalculation.finalAmount;
  }

  return applyStoredPercentDiscounts(
    baseAmount,
    pricing.priceCalculation.appliedDiscounts,
  );
}
