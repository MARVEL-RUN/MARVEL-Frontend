import type { PriceCalculation } from "@/lib/discount-link/types";
import { LookupPriceLedgerDetails } from "./LookupPriceLedger";

export function LookupPriceCalculationBlock({
  hasPriceCalculation,
  priceCalculation,
}: {
  hasPriceCalculation?: boolean;
  priceCalculation?: PriceCalculation | null;
}) {
  if (!hasPriceCalculation) return null;

  return (
    <div className="lookup-price-calc" aria-label="참가비 내역">
      <LookupPriceLedgerDetails defaultOpen priceCalculation={priceCalculation} />
    </div>
  );
}

/** 단체 조회 — 구성원 행 안 */
export function LookupMemberPriceCalculation({
  hasPriceCalculation,
  priceCalculation,
  defaultOpen = false,
}: {
  hasPriceCalculation?: boolean;
  priceCalculation?: PriceCalculation | null;
  defaultOpen?: boolean;
}) {
  if (!hasPriceCalculation) return null;

  return (
    <div className="lookup-members__ledger">
      <LookupPriceLedgerDetails
        defaultOpen={defaultOpen}
        priceCalculation={priceCalculation}
      />
    </div>
  );
}
