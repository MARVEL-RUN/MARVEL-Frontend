"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { discountLinkEntry, type DiscountLinkEntry } from "@/lib/discount-link/config";
import { useFlowReset } from "@/lib/main/flowReset";
import { useAppBasePath } from "@/lib/main/useAppBasePath";
import { withAppBase } from "@/lib/preview";
import type { ApplyKind } from "@/lib/register";
import { scrollPageTop } from "@/lib/scroll-page";
import { RegisterFlow } from "../register/RegisterFlow";
import { useDiscountOptions } from "../register/useDiscountOptions";
import { useRegistrationOptions } from "../register/useRegistrationOptions";
import { DiscountGuide } from "./DiscountGuide";
import { DiscountIntro } from "./DiscountIntro";
import { DiscountPartnerMark } from "./DiscountPartnerMark";
import { DiscountShell } from "./DiscountShell";
import { DiscountStepBar } from "./DiscountStepBar";

type Stage = "guide" | "apply";

function DiscountState({
  entry,
  title,
  message,
  onRetry,
}: {
  entry: DiscountLinkEntry;
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  const base = useAppBasePath();
  return (
    <section className="dl-stage dl-state" role="alert">
      <div className="wrap dl-state__inner">
        <span className="dl-state__mark" aria-hidden>
          !
        </span>
        <p className="dl-state__tag">
          <DiscountPartnerMark entry={entry} />
          <span>{entry.en}</span>
        </p>
        <h1 className="dl-state__title">{title}</h1>
        <p className="dl-state__msg">{message}</p>
        <div className="dl-state__actions">
          {onRetry ? (
            <button type="button" className="btn btn--red" onClick={onRetry}>
              다시 시도
            </button>
          ) : (
            <Link className="btn btn--red" href={withAppBase(base, "/register")}>
              일반 참가신청
            </Link>
          )}
          <Link className="btn btn--ghost" href={withAppBase(base, "/")}>
            대회 메인
          </Link>
        </div>
      </div>
    </section>
  );
}

export function DiscountEntryPage({ slug }: { slug: string }) {
  const entry = discountLinkEntry(slug);
  if (!entry) notFound();

  const registration = useRegistrationOptions();
  const discount = useDiscountOptions(entry.linkCode);
  const [introDone, setIntroDone] = useState(false);
  const [stage, setStage] = useState<Stage>("guide");
  const [kind, setKind] = useState<ApplyKind | "">("");

  const loading = registration.loading || discount.loading;
  const down = registration.down || discount.down;

  function go(next: Stage) {
    setStage(next);
    if (next === "guide") setKind("");
    requestAnimationFrame(scrollPageTop);
  }

  function retry() {
    setIntroDone(false);
    discount.retry();
    registration.retry();
  }

  useFlowReset("discount-link", () => go("guide"));

  const linkGone =
    discount.errorCode === "DISCOUNT_LINK_NOT_FOUND" ||
    discount.errorCode === "DISCOUNT_LINK_DISABLED";
  const loadFailed =
    !loading &&
    ((registration.errorMessage && !registration.categories.length) ||
      (discount.errorMessage && !discount.options));

  let body: React.ReactNode = null;

  if (!introDone) {
    body = null;
  } else if (linkGone) {
    body = (
      <DiscountState
        entry={entry}
        title="사용할 수 없는 할인 링크입니다"
        message={discount.errorMessage || "할인 링크를 찾을 수 없거나 사용이 중지되었습니다."}
      />
    );
  } else if (loadFailed || !discount.options) {
    body = (
      <DiscountState
        entry={entry}
        title={down ? "접속이 원활하지 않습니다" : "할인 안내를 불러오지 못했습니다"}
        message={
          discount.errorMessage ||
          registration.errorMessage ||
          "잠시 후 다시 시도해 주세요."
        }
        onRetry={retry}
      />
    );
  } else if (stage === "guide") {
    body = (
      <>
        <DiscountStepBar entry={entry} step={0} />
        <DiscountGuide
          entry={entry}
          options={discount.options}
          categories={registration.categories}
          onNext={() => go("apply")}
        />
      </>
    );
  } else {
    const step = kind ? 2 : 1;
    body = (
      <>
        <DiscountStepBar
          entry={entry}
          step={step}
          onBack={step === 1 ? () => go("guide") : undefined}
        />
        <section
          className={`dl-stage dl-apply dl-apply--${step === 1 ? "terms" : "form"}`}
          aria-label={step === 1 ? "유의사항 동의" : "신청 작성"}
        >
          <div className="wrap dl-apply__inner">
            {step === 2 ? (
              <p className="dl-ribbon">
                <DiscountPartnerMark entry={entry} />
                {entry.title} 적용 중
              </p>
            ) : null}
            <RegisterFlow
              onKindChange={setKind}
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
        </section>
      </>
    );
  }

  return (
    <DiscountShell entry={entry}>
      {introDone ? null : (
        <DiscountIntro
          entry={entry}
          settled={!loading || linkGone}
          onDone={() => {
            setIntroDone(true);
            window.scrollTo(0, 0);
          }}
        />
      )}
      <div className="dl__body" aria-busy={!introDone}>
        {body}
      </div>
    </DiscountShell>
  );
}
