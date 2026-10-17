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
    <aside id="discount-info" className="discount-panel" aria-label="할인 안내">
      <div className="discount-panel__head">
        <h2 className="discount-panel__title">할인 안내</h2>
        <p className="discount-panel__sub">서버 기준 안내 가격 · 접수 가능 여부는 아래 상태를 확인하세요</p>
      </div>

      {options.message ? (
        <p className="discount-panel__message">{options.message}</p>
      ) : null}

      {statusNote ? (
        <div
          className={`discount-alert${accepting ? " discount-alert--ok" : " discount-alert--warn"}`}
          role="status"
        >
          <strong>{statusNote}</strong>
          {!accepting ? (
            <span>
              아래 안내 가격과 달리 지금은 할인 링크로 신규 접수가 제한될 수 있습니다.
            </span>
          ) : (
            <span>현재 할인 링크로 신규 접수가 가능합니다.</span>
          )}
        </div>
      ) : null}

      <ul className="discount-rules">
        {options.minimumGroupSize != null && options.minimumGroupSize > 0 ? (
          <li>
            <span className="discount-rules__label">인원</span>
            <span>단체 최소 {options.minimumGroupSize}명</span>
          </li>
        ) : null}
        {entry.extraNotices?.map((line) => (
          <li key={line}>
            <span className="discount-rules__label">안내</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {options.categories.length ? (
        <div className="discount-price-grid">
          {options.categories.map((row) => {
            const category = findCategory(categories, row.categoryId);
            const label = category ? categoryLabel(category) : row.categoryId;
            return (
              <article
                key={row.categoryId}
                className={`discount-price-card${row.linkDiscountApplicable ? "" : " discount-price-card--plain"}`}
              >
                <header className="discount-price-card__head">
                  <h3>{label}</h3>
                  {!row.linkDiscountApplicable ? (
                    <span className="discount-price-card__flag">링크 감액 없음</span>
                  ) : (
                    <span className="discount-price-card__flag discount-price-card__flag--on">
                      할인 적용
                    </span>
                  )}
                </header>
                <ul className="discount-price-card__list">
                  {row.priceOptions.map((opt) => (
                    <li key={`${row.categoryId}-${opt.scenario}-${opt.applicationType}`}>
                      <span className="discount-price-card__desc">
                        {opt.description || label}
                      </span>
                      <strong className="discount-price-card__amount">
                        {formatFee(opt.finalAmount)}
                      </strong>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      ) : null}
    </aside>
  );
}
