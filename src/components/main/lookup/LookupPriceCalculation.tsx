import { PriceCalculationBreakdown } from "../discount/PriceCalculationBreakdown";
import type { PriceCalculation } from "@/lib/discount-link/types";

function LookupPriceCalculationBody({
  priceCalculation,
}: {
  priceCalculation?: PriceCalculation | null;
}) {
  if (priceCalculation) {
    return <PriceCalculationBreakdown calculation={priceCalculation} />;
  }
  return (
    <p className="price-calculation__empty">적용된 할인 없이 계산되었습니다.</p>
  );
}

export function LookupPriceCalculationBlock({
  title = "참가비 계산",
  hasPriceCalculation,
  priceCalculation,
}: {
  title?: string;
  hasPriceCalculation?: boolean;
  priceCalculation?: PriceCalculation | null;
}) {
  if (!hasPriceCalculation) return null;

  return (
    <section className="ticket-notice lookup-price-calc" aria-label={title}>
      <p className="ticket-notice__title">{title}</p>
      <LookupPriceCalculationBody priceCalculation={priceCalculation} />
    </section>
  );
}

/** 단체 조회 — 구성원 행 안 */
export function LookupMemberPriceCalculation({
  hasPriceCalculation,
  priceCalculation,
}: {
  hasPriceCalculation?: boolean;
  priceCalculation?: PriceCalculation | null;
}) {
  if (!hasPriceCalculation) return null;

  return (
    <div className="lookup-members__calc" aria-label="참가비 계산">
      <p className="lookup-members__calc-title">참가비 계산</p>
      <LookupPriceCalculationBody priceCalculation={priceCalculation} />
    </div>
  );
}
