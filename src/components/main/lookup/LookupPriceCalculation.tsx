import { PriceCalculationBreakdown } from "../discount/PriceCalculationBreakdown";
import type { PriceCalculation } from "@/lib/discount-link/types";

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
      {priceCalculation ? (
        <PriceCalculationBreakdown calculation={priceCalculation} />
      ) : (
        <p className="price-calculation__empty">적용된 할인 없이 계산되었습니다.</p>
      )}
    </section>
  );
}

export function LookupGroupPriceCalculations({
  participants,
}: {
  participants: {
    registrationId: string;
    name?: string;
    hasPriceCalculation?: boolean;
    priceCalculation?: PriceCalculation | null;
    canceled?: boolean;
  }[];
}) {
  const rows = participants.filter(
    (row) => row.hasPriceCalculation && !row.canceled,
  );
  if (!rows.length) return null;

  return (
    <div className="lookup-price-records" aria-label="구성원별 참가비 계산">
      {rows.map((row) => (
        <details key={row.registrationId} className="lookup-price-record">
          <summary>
            {row.name?.trim() || "참가자"} · 참가비 계산
          </summary>
          {row.priceCalculation ? (
            <PriceCalculationBreakdown calculation={row.priceCalculation} />
          ) : (
            <p className="price-calculation__empty">적용된 할인 없이 계산되었습니다.</p>
          )}
        </details>
      ))}
    </div>
  );
}
