import { formatFee } from "@/lib/register";
import {
  discountLinkAcceptingRegistration,
  discountLinkStatusLabel,
} from "@/lib/discount-link/pricing";
import type { DiscountLinkEntry } from "@/lib/discount-link/config";
import type { DiscountOptions } from "@/lib/discount-link/types";
import { categoryLabel, findCategory } from "@/lib/registration-options";
import type { RegistrationCategory } from "@/services/main/types";

export function DiscountLinkNotice({
  entry,
  options,
  categories,
}: {
  entry: DiscountLinkEntry;
  options: DiscountOptions | null;
  categories: RegistrationCategory[];
}) {
  if (!options) return null;

  const statusNote = discountLinkStatusLabel(options.linkStatus);
  const accepting = discountLinkAcceptingRegistration(options);

  return (
    <section className="block discount-link-notice" aria-label="할인 안내">
      {entry.lead ? <p className="discount-link-notice__lead">{entry.lead}</p> : null}
      {options.message ? (
        <p className="discount-link-notice__message">{options.message}</p>
      ) : null}
      {statusNote ? (
        <p className="discount-link-notice__status" role="status">
          {statusNote}
          {!accepting ? " — 아래 안내 가격과 달리 지금은 할인 링크로 신규 접수가 제한될 수 있습니다." : null}
        </p>
      ) : null}
      {options.minimumGroupSize != null && options.minimumGroupSize > 0 ? (
        <p className="discount-link-notice__min">
          단체 최소 {options.minimumGroupSize}명 이상 신청해야 합니다.
        </p>
      ) : null}
      {entry.extraNotices?.map((line) => (
        <p key={line} className="discount-link-notice__extra">
          {line}
        </p>
      ))}
      {options.categories.length ? (
        <div className="discount-link-notice__prices">
          <p className="discount-link-notice__prices-title">종목별 안내 참가비</p>
          <ul>
            {options.categories.map((row) => {
              const category = findCategory(categories, row.categoryId);
              const label = category ? categoryLabel(category) : row.categoryId;
              const lines = row.priceOptions.map((opt) => (
                <li key={`${row.categoryId}-${opt.scenario}-${opt.applicationType}`}>
                  <span>{opt.description || label}</span>
                  <strong>{formatFee(opt.finalAmount)}</strong>
                  {!row.linkDiscountApplicable ? (
                    <span className="discount-link-notice__no-link"> (링크 감액 없음)</span>
                  ) : null}
                </li>
              ));
              return (
                <li key={row.categoryId}>
                  <strong>{label}</strong>
                  <ul>{lines}</ul>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
