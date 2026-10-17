"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { SideBanner } from "../layout/SideBanner";
import { MediaLoader } from "../MediaLoader";
import { DiscountLinkNotice } from "../discount/DiscountLinkNotice";
import { discountLinkEntry } from "@/lib/discount-link/config";
import { useAppBasePath } from "@/lib/main/useAppBasePath";
import { withAppBase } from "@/lib/preview";
import { RegisterFlow } from "./RegisterFlow";
import { useRegistrationOptions } from "./useRegistrationOptions";
import { useDiscountOptions } from "./useDiscountOptions";

function DiscountLoadError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <section className="block wait">
      <h2>{title}</h2>
      <p className="sec__body">{message}</p>
      {onRetry ? (
        <div className="flow__nav">
          <button type="button" className="btn btn--red" onClick={onRetry}>
            다시 시도
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function DiscountRegisterPage({ slug }: { slug: string }) {
  const entry = discountLinkEntry(slug);
  const base = useAppBasePath();
  if (!entry) notFound();

  const registration = useRegistrationOptions();
  const discount = useDiscountOptions(entry.linkCode);

  const loading = registration.loading || discount.loading;
  const down = registration.down || discount.down;

  if (
    discount.errorCode === "DISCOUNT_LINK_NOT_FOUND" ||
    discount.errorCode === "DISCOUNT_LINK_DISABLED"
  ) {
    return (
      <MediaLoader>
        <main className="page">
          <SideBanner
            kicker={entry.kicker}
            title={entry.title}
            en={entry.en}
          />
          <div className="page__body wrap">
            <DiscountLoadError
              title="할인 링크를 사용할 수 없습니다"
              message={
                discount.errorMessage ||
                "할인 링크를 찾을 수 없거나 사용할 수 없습니다."
              }
            />
            <p className="discount-link-fallback">
              <Link href={withAppBase(base, "/")}>대회 메인으로 이동</Link>
              <Link href={withAppBase(base, "/register")}>일반 참가신청으로 이동</Link>
            </p>
          </div>
        </main>
      </MediaLoader>
    );
  }

  if (loading && !registration.categories.length && !discount.options) {
    return (
      <MediaLoader>
        <main className="page">
          <SideBanner kicker={entry.kicker} title={entry.title} en={entry.en} />
          <div className="page__body wrap">
            <p className="form__hint">할인 안내를 불러오는 중입니다.</p>
          </div>
        </main>
      </MediaLoader>
    );
  }

  if (
    !loading &&
    ((registration.errorMessage && !registration.categories.length) ||
      (discount.errorMessage && !discount.options))
  ) {
    return (
      <MediaLoader>
        <main className="page">
          <SideBanner kicker={entry.kicker} title={entry.title} en={entry.en} />
          <div className="page__body wrap">
            <DiscountLoadError
              title={down ? "접속이 원활하지 않습니다" : "할인 안내를 불러오지 못했습니다"}
              message={
                discount.errorMessage ||
                registration.errorMessage ||
                "할인 안내를 불러오지 못했습니다."
              }
              onRetry={() => {
                discount.retry();
                registration.retry();
              }}
            />
          </div>
        </main>
      </MediaLoader>
    );
  }

  return (
    <MediaLoader>
      <main className="page">
        <SideBanner kicker={entry.kicker} title={entry.title} en={entry.en} />
        <div className="page__body wrap">
          <DiscountLinkNotice
            entry={entry}
            options={discount.options}
            categories={registration.categories}
          />
          <RegisterFlow
            discount={{
              entry,
              linkCode: entry.linkCode,
              options: discount.options,
              optionsLoading: discount.loading,
              optionsError: discount.errorMessage,
              optionsErrorCode: discount.errorCode,
              optionsDown: discount.down,
              retryOptions: () => {
                discount.retry();
                registration.retry();
              },
            }}
          />
        </div>
      </main>
    </MediaLoader>
  );
}
