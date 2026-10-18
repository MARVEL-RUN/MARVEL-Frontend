"use client";

import { useEffect, useRef } from "react";
import { formatFee } from "@/lib/register";
import type { AppliedDiscount, PriceCalculation } from "@/lib/discount-link/types";

function discountLabel(item: AppliedDiscount) {
  const stage = item.stage === "INTERNAL" ? "서비스 할인" : "링크·외부 할인";
  if (item.method === "PERCENT" && item.ratePercent != null) {
    return `${stage} · ${item.ratePercent}%`;
  }
  if (item.method === "FIXED_PRICE" && item.fixedAmount != null) {
    return `${stage} · 고정 ${formatFee(item.fixedAmount)}`;
  }
  return stage;
}

export function LookupPriceLedger({ calculation }: { calculation: PriceCalculation }) {
  const { appliedDiscounts, baseAmount, finalAmount, roundingAdjustmentAmount } =
    calculation;

  return (
    <div className="lookup-ledger__body">
      <dl className="lookup-ledger__rows">
        <div className="lookup-ledger__row">
          <dt>기준 금액</dt>
          <dd>{formatFee(baseAmount)}</dd>
        </div>
        {appliedDiscounts.map((item, index) => (
          <div
            key={`${item.policyId}-${item.revision}-${index}`}
            className="lookup-ledger__row lookup-ledger__row--minus"
          >
            <dt>{discountLabel(item)}</dt>
            <dd>-{formatFee(item.reductionAmount)}</dd>
          </div>
        ))}
        {roundingAdjustmentAmount !== 0 ? (
          <div className="lookup-ledger__row">
            <dt>원 단위 조정</dt>
            <dd>{formatFee(roundingAdjustmentAmount)}</dd>
          </div>
        ) : null}
        <div className="lookup-ledger__row lookup-ledger__row--total">
          <dt>참가비</dt>
          <dd>{formatFee(finalAmount)}</dd>
        </div>
      </dl>
      <p className="lookup-ledger__note">
        저장된 참가비 내역이며, 실제 납부·환불 완료액과 다를 수 있습니다.
      </p>
    </div>
  );
}

export function LookupPriceLedgerDetails({
  defaultOpen = false,
  priceCalculation,
}: {
  defaultOpen?: boolean;
  priceCalculation?: PriceCalculation | null;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (defaultOpen && ref.current) ref.current.open = true;
  }, [defaultOpen]);

  return (
    <details ref={ref} className="lookup-ledger">
      <summary className="lookup-ledger__summary">
        <span>참가비 내역</span>
        <span className="lookup-ledger__chev" aria-hidden />
      </summary>
      <div className="lookup-ledger__panel">
        {priceCalculation ? (
          <LookupPriceLedger calculation={priceCalculation} />
        ) : (
          <p className="lookup-ledger__empty">적용된 할인 없이 계산되었습니다.</p>
        )}
      </div>
    </details>
  );
}
