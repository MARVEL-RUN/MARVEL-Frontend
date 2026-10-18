import { formatFee } from "@/lib/register";
import type { LookupStoredPricing } from "./lookup-fee";
import type { AppliedDiscount } from "./types";

export function appliedDiscountLabel(item: AppliedDiscount): string {
  const stage = item.stage === "INTERNAL" ? "서비스 할인" : "링크·외부 할인";
  if (item.method === "PERCENT" && item.ratePercent != null) {
    return `${stage} ${item.ratePercent}%`;
  }
  if (item.method === "FIXED_PRICE" && item.fixedAmount != null) {
    return `${stage} 고정 ${formatFee(item.fixedAmount)}`;
  }
  return stage;
}

export function collectAppliedDiscountLabels(sources: LookupStoredPricing[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const source of sources) {
    const items = source.priceCalculation?.appliedDiscounts;
    if (!items?.length) continue;
    for (const item of items) {
      const label = appliedDiscountLabel(item);
      if (seen.has(label)) continue;
      seen.add(label);
      labels.push(label);
    }
  }
  return labels;
}

export function lookupEditDiscountGuide(labels: string[]): string | null {
  if (!labels.length) return null;
  const joined =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(", ")} 및 ${labels[labels.length - 1]}`;
  return `이 접수에는 ${joined}이(가) 적용되어 있습니다. 아래 요금표는 정가이며, 표·합계 참가비는 할인 반영 금액입니다. 종목·생년월일을 바꾸면 같은 할인율로 재계산됩니다.`;
}
