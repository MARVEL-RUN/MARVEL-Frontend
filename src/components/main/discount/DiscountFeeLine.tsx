import { formatFee } from "@/lib/register";
import { priceOptionDescLabel } from "@/lib/discount-link/display";
import type { PriceOption } from "@/lib/discount-link/types";

export function DiscountFeeLine({ option }: { option?: PriceOption }) {
  if (!option) {
    return <p className="fee-text fee-text--wait">안내 가격이 없습니다</p>;
  }
  const desc = priceOptionDescLabel(option);
  return (
    <div className="discount-fee">
      <p className="fee-text">{formatFee(option.finalAmount)}</p>
      {desc ? <p className="form-row__hint">{desc}</p> : null}
    </div>
  );
}
