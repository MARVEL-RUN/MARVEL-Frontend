import {
  discountLinkAcceptingRegistration,
  discountLinkStatusLabel,
} from "@/lib/discount-link/pricing";
import type { DiscountOptions } from "@/lib/discount-link/types";

export function DiscountEntryMobileRail({
  options,
}: {
  options: DiscountOptions;
}) {
  const statusNote = discountLinkStatusLabel(options.linkStatus);
  const accepting = discountLinkAcceptingRegistration(options);

  return (
    <nav className="discount-rail" aria-label="할인 페이지 단축 이동">
      <div className="discount-rail__inner wrap">
        {statusNote ? (
          <p
            className={`discount-rail__status${accepting ? " is-ok" : " is-warn"}`}
            role="status"
          >
            <span className="discount-rail__dot" aria-hidden />
            {statusNote}
          </p>
        ) : (
          <p className="discount-rail__status is-muted">할인 링크 전용 접수</p>
        )}
        <div className="discount-rail__actions">
          <a className="discount-rail__link" href="#discount-info">
            안내·가격
          </a>
          <a className="discount-rail__cta" href="#discount-apply">
            참가 신청
          </a>
        </div>
      </div>
    </nav>
  );
}
