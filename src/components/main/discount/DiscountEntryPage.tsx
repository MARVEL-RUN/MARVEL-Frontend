"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaLoader } from "../MediaLoader";
import { DiscountEntryHero } from "./DiscountEntryHero";
import { DiscountEntryMobileRail } from "./DiscountEntryMobileRail";
import { DiscountLinkNotice } from "./DiscountLinkNotice";
import { discountLinkEntry } from "@/lib/discount-link/config";
import { useAppBasePath } from "@/lib/main/useAppBasePath";
import { withAppBase } from "@/lib/preview";
import { RegisterFlow } from "../register/RegisterFlow";
import { useRegistrationOptions } from "../register/useRegistrationOptions";
import { useDiscountOptions } from "../register/useDiscountOptions";

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
    <section className="discount-state">
      <h2>{title}</h2>
      <p>{message}</p>
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

function DiscountEntryShell({
  entry,
  mobileRail,
  children,
}: {
  entry: NonNullable<ReturnType<typeof discountLinkEntry>>;
  mobileRail?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <MediaLoader>
      <main
        className={`page page--discount-entry page--discount-entry--${entry.variant}`}
        data-discount-slug={entry.slug}
        data-link-code={entry.linkCode}
      >
        <DiscountEntryHero entry={entry} />
        {mobileRail}
        <div className="discount-entry__sheet">
          <div className="wrap discount-entry__layout">{children}</div>
        </div>
      </main>
    </MediaLoader>
  );
}

export function DiscountEntryPage({ slug }: { slug: string }) {
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
      <DiscountEntryShell entry={entry}>
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
      </DiscountEntryShell>
    );
  }

  if (loading && !registration.categories.length && !discount.options) {
    return (
      <DiscountEntryShell entry={entry}>
        <div className="discount-entry__loading" role="status">
          <span className="discount-entry__spinner" aria-hidden />
          할인 안내를 불러오는 중입니다.
        </div>
      </DiscountEntryShell>
    );
  }

  if (
    !loading &&
    ((registration.errorMessage && !registration.categories.length) ||
      (discount.errorMessage && !discount.options))
  ) {
    return (
      <DiscountEntryShell entry={entry}>
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
      </DiscountEntryShell>
    );
  }

  return (
    <DiscountEntryShell
      entry={entry}
      mobileRail={
        discount.options ? (
          <DiscountEntryMobileRail options={discount.options} />
        ) : null
      }
    >
      <DiscountLinkNotice
        entry={entry}
        options={discount.options}
        categories={registration.categories}
      />
      <section
        id="discount-apply"
        className="discount-entry__form"
        aria-label="할인 링크 참가 신청"
      >
        <header className="discount-entry__form-head">
          <p className="discount-entry__form-kicker">APPLICATION</p>
          <h2 className="discount-entry__form-title">참가 신청</h2>
          <p className="discount-entry__form-lead">
            입력 항목은 일반 접수와 동일하며, 할인은 이 링크로 생성한 신청에만 적용됩니다.
          </p>
        </header>
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
      </section>
    </DiscountEntryShell>
  );
}
