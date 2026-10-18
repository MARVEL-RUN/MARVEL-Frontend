import { formatFee } from "@/lib/register";
import { categoryLabel } from "@/lib/registration-options";
import type { RegistrationCategory, RegistrationPriceOption } from "@/services/main/types";

function applyKindLabel(type: RegistrationPriceOption["applicationType"]) {
  return type === "ORGANIZATION" ? "단체" : "개인";
}

export function ServiceDiscountNotice({
  categories,
  loading,
}: {
  categories: RegistrationCategory[];
  loading?: boolean;
}) {
  if (loading) return null;

  const rows = categories.filter(
    (category) => category.pricing?.serviceDiscountOptions?.length,
  );
  if (!rows.length) return null;

  return (
    <section className="service-discount-notice" aria-label="참가비 할인 안내">
      <header className="service-discount-notice__head">
        <p className="service-discount-notice__kicker">FEE GUIDE</p>
        <h2 className="service-discount-notice__title">참가비 안내</h2>
        <p className="service-discount-notice__lead">
          일반 접수 기준 안내 가격입니다. 할인 링크·티켓사 전용 페이지와는 별도입니다.
        </p>
      </header>
      <ul className="service-discount-notice__grid">
        {rows.map((category) => (
          <li key={category.categoryId} className="service-discount-notice__card">
            <h3>{categoryLabel(category)}</h3>
            <ul>
              {category.pricing!.serviceDiscountOptions!.map((opt) => (
                <li key={`${opt.applicationType}-${opt.scenario}-${opt.description}`}>
                  <span className="service-discount-notice__desc">
                    {applyKindLabel(opt.applicationType)}
                    {opt.description ? ` · ${opt.description}` : ""}
                  </span>
                  <strong>{formatFee(opt.finalAmount)}</strong>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
