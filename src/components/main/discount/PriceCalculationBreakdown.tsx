import { formatFee } from "@/lib/register";
import type { AppliedDiscount, PriceCalculation } from "@/lib/discount-link/types";

function stageLabel(stage: AppliedDiscount["stage"]) {
  return stage === "INTERNAL" ? "서비스 할인" : "링크·외부 할인";
}

function methodHint(item: AppliedDiscount) {
  if (item.method === "PERCENT" && item.ratePercent != null) {
    return `${item.ratePercent}%`;
  }
  if (item.method === "FIXED_PRICE" && item.fixedAmount != null) {
    return `고정 ${formatFee(item.fixedAmount)}`;
  }
  return "";
}

export function PriceCalculationBreakdown({
  calculation,
}: {
  calculation: PriceCalculation;
}) {
  const { appliedDiscounts, baseAmount, finalAmount, roundingAdjustmentAmount } =
    calculation;

  return (
    <div className="price-calculation">
      <p className="price-calculation__row">
        <span>기준 금액</span>
        <strong>{formatFee(baseAmount)}</strong>
      </p>
      {appliedDiscounts.length ? (
        <ol className="price-calculation__steps">
          {appliedDiscounts.map((item, index) => (
            <li key={`${item.policyId}-${item.revision}-${index}`}>
              <span>
                {stageLabel(item.stage)}
                {methodHint(item) ? ` · ${methodHint(item)}` : ""}
              </span>
              <span>-{formatFee(item.reductionAmount)}</span>
              <span className="price-calculation__after">
                {formatFee(item.amountAfter)}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="price-calculation__empty">적용된 할인 단계가 없습니다.</p>
      )}
      {roundingAdjustmentAmount !== 0 ? (
        <p className="price-calculation__row">
          <span>원 단위 조정</span>
          <strong>{formatFee(roundingAdjustmentAmount)}</strong>
        </p>
      ) : null}
      <p className="price-calculation__row price-calculation__final">
        <span>계산된 참가비</span>
        <strong>{formatFee(finalAmount)}</strong>
      </p>
      <p className="price-calculation__note">
        저장된 참가비 계산 결과이며, 실제 납부·환불 완료액과 다를 수 있습니다.
      </p>
    </div>
  );
}
