import { formatFee } from "@/lib/register";
import type { PriceOption } from "@/lib/discount-link/types";

export function DiscountFeeLine({ option }: { option?: PriceOption }) {
  if (!option) {
    return <p className="fee-text fee-text--wait">안내 가격이 없습니다</p>;
  }
  return (
    <div className="discount-fee">
      <p className="fee-text">{formatFee(option.finalAmount)}</p>
      {option.description ? (
        <p className="form-row__hint">{option.description}</p>
      ) : null}
    </div>
  );
}
