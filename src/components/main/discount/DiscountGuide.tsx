"use client";

import Link from "next/link";
import { useState } from "react";
import { formatFee } from "@/lib/register";
import type { DiscountLinkEntry } from "@/lib/discount-link/config";
import {
  discountApplyTypeLabel,
  discountHeadline,
  discountPeriodLabel,
  discountStatusTone,
  priceOptionDescLabel,
  priceOptionKindChipClass,
  priceOptionKindLabel,
  priceOptionListAmount,
  priceOptionPercent,
} from "@/lib/discount-link/display";
import {
  discountLinkAcceptingRegistration,
  discountNewRegistrationBlockedMessage,
} from "@/lib/discount-link/pricing";
import type { DiscountOptions, PriceOption } from "@/lib/discount-link/types";
import { useAppBasePath } from "@/lib/main/useAppBasePath";
import { withAppBase } from "@/lib/preview";
import { categoryLabel, courseForCategory, findCategory } from "@/lib/registration-options";
import type { RegistrationCategory } from "@/services/main/types";
import { DiscountPartnerMark } from "./DiscountPartnerMark";

type GuidePanel = "prices" | "notes";
type PriceKindPanel = "PERSONAL" | "ORGANIZATION";

function priceOptionsForKind(options: PriceOption[], kind: PriceKindPanel) {
  return options.filter((opt) => opt.applicationType === kind);
}

function guideNotes(entry: DiscountLinkEntry, options: DiscountOptions) {
  const notes = [...(entry.extraNotices ?? [])];
  if (options.minimumGroupSize && !notes.length) {
    notes.push(`단체는 ${options.minimumGroupSize}명 이상이어야 결제할 수 있습니다.`);
  }
  notes.push("할인은 이 링크로 접수한 신청에만 적용됩니다.");
  notes.push("입력 항목은 일반 접수와 같습니다. 최종 금액은 신청 단계에서 확정됩니다.");
  return [...new Set(notes)];
}

export function DiscountGuide({
  entry,
  options,
  categories,
  onNext,
}: {
  entry: DiscountLinkEntry;
  options: DiscountOptions;
  categories: RegistrationCategory[];
  onNext: () => void;
}) {
  const base = useAppBasePath();
  const status = discountStatusTone(options.linkStatus);
  const headline = discountHeadline(options);
  const period = discountPeriodLabel(options);
  const accepting = discountLinkAcceptingRegistration(options);
  const blocked = discountNewRegistrationBlockedMessage(options);
  const notes = guideNotes(entry, options);
  const hasPrices = options.categories.length > 0;
  const showPriceKindTabs = options.applicationType === "BOTH";
  const [panel, setPanel] = useState<GuidePanel>(hasPrices ? "prices" : "notes");
  const [priceKind, setPriceKind] = useState<PriceKindPanel>("PERSONAL");

  function goPanel(next: GuidePanel) {
    setPanel(next);
  }

  return (
    <section className="dl-stage dl-guide" aria-labelledby="dl-guide-title">
      <div className="wrap dl-guide__grid">
        <div className="dl-guide__aside">
          <article className="dl-pass">
            <div className="dl-pass__main">
              <div className="dl-pass__head">
                <DiscountPartnerMark entry={entry} className="dl-pass__partner" />
                <span className={`dl-chip dl-chip--${status.tone}`}>{status.label}</span>
              </div>

              <p className="dl-pass__kicker">{entry.kicker}</p>
              <h1 id="dl-guide-title" className="dl-pass__title">
                {entry.title}
              </h1>
              <p className="dl-pass__en">{entry.en}</p>

              {headline ? (
                <p className="dl-pass__headline">
                  <strong>{headline.value}</strong>
                  <span>{headline.label}</span>
                </p>
              ) : null}

              {entry.lead ? <p className="dl-pass__lead">{entry.lead}</p> : null}
            </div>

            <div className="dl-pass__stub">
              <dl className="dl-pass__facts">
                <div>
                  <dt>신청 유형</dt>
                  <dd>{discountApplyTypeLabel(options.applicationType)}</dd>
                </div>
                {options.minimumGroupSize ? (
                  <div>
                    <dt>최소 인원</dt>
                    <dd>{options.minimumGroupSize}명 이상</dd>
                  </div>
                ) : null}
                {period ? (
                  <div>
                    <dt>할인 접수 기간</dt>
                    <dd className="dl-pass__period">{period}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="dl-pass__code" aria-hidden>
                <span />
                <small>MARVEL RUN 2026 · {entry.partnerTag ?? entry.slug.toUpperCase()}</small>
              </div>
            </div>
          </article>
        </div>

        <div className="dl-guide__main">
          <div className="dl-guide__body">
            <section
              className="dl-block"
              aria-labelledby={panel === "prices" && hasPrices ? "dl-prices-title" : "dl-notes-title"}
            >
              <header className="dl-block__head">
                <span className="dl-block__no">
                  {panel === "prices" && hasPrices ? "A" : hasPrices ? "B" : "A"}
                </span>
                {panel === "prices" && hasPrices ? (
                  <h2 id="dl-prices-title">
                    종목별 할인가
                    {showPriceKindTabs ? (
                      <span className="dl-block__kind-label">
                        · {priceKind === "PERSONAL" ? "개인" : "단체"}
                      </span>
                    ) : null}
                  </h2>
                ) : (
                  <h2 id="dl-notes-title">신청 전 확인</h2>
                )}
                {hasPrices ? (
                  <div className="dl-block__nav">
                    {showPriceKindTabs && panel === "prices" ? (
                      <div
                        className="dl-price-kind-tabs"
                        role="tablist"
                        aria-label="개인·단체 할인가"
                      >
                        <button
                          type="button"
                          role="tab"
                          id="dl-price-kind-personal"
                          aria-selected={priceKind === "PERSONAL"}
                          aria-controls="dl-prices-panel"
                          className={
                            priceKind === "PERSONAL"
                              ? "dl-price-kind-tabs__btn is-on dl-price-kind-tabs__btn--personal"
                              : "dl-price-kind-tabs__btn dl-price-kind-tabs__btn--personal"
                          }
                          onClick={() => setPriceKind("PERSONAL")}
                        >
                          개인
                        </button>
                        <button
                          type="button"
                          role="tab"
                          id="dl-price-kind-org"
                          aria-selected={priceKind === "ORGANIZATION"}
                          aria-controls="dl-prices-panel"
                          className={
                            priceKind === "ORGANIZATION"
                              ? "dl-price-kind-tabs__btn is-on dl-price-kind-tabs__btn--org"
                              : "dl-price-kind-tabs__btn dl-price-kind-tabs__btn--org"
                          }
                          onClick={() => setPriceKind("ORGANIZATION")}
                        >
                          단체
                        </button>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className="dl-block__jump dl-block__jump--prev"
                      disabled={panel === "prices"}
                      onClick={() => goPanel("prices")}
                      aria-label="종목별 할인가"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="dl-block__jump"
                      disabled={panel === "notes"}
                      onClick={() => goPanel("notes")}
                      aria-label="신청 전 확인"
                    >
                      →
                    </button>
                  </div>
                ) : null}
              </header>
              <div className="dl-block__panels">
                {hasPrices ? (
                  <ul
                    id={showPriceKindTabs ? "dl-prices-panel" : undefined}
                    role={showPriceKindTabs ? "tabpanel" : undefined}
                    aria-labelledby={
                      showPriceKindTabs
                        ? priceKind === "PERSONAL"
                          ? "dl-price-kind-personal"
                          : "dl-price-kind-org"
                        : undefined
                    }
                    className={panel === "prices" ? "dl-prices" : "dl-prices is-off"}
                  >
                    {options.categories.map((row) => {
                      const category = findCategory(categories, row.categoryId);
                      const label = category ? categoryLabel(category) : row.categoryId;
                      const visibleOptions = showPriceKindTabs
                        ? priceOptionsForKind(row.priceOptions, priceKind)
                        : row.priceOptions;
                      if (!visibleOptions.length) return null;
                      const priceCardKind =
                        showPriceKindTabs && visibleOptions[0]
                          ? visibleOptions[0].applicationType === "ORGANIZATION"
                            ? "org"
                            : "personal"
                          : null;
                      return (
                        <li
                          key={`${row.categoryId}-${showPriceKindTabs ? priceKind : "all"}`}
                          className={[
                            row.linkDiscountApplicable ? "dl-price" : "dl-price is-plain",
                            priceCardKind ? `dl-price--${priceCardKind}` : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <div className="dl-price__head">
                            <h3>{label}</h3>
                            <span className="dl-price__flag">
                              {row.linkDiscountApplicable ? "할인 적용" : "할인 미적용"}
                            </span>
                          </div>
                          <ul className="dl-price__opts">
                            {visibleOptions.map((opt) => {
                              const pct = priceOptionPercent(opt);
                              const listAmount = priceOptionListAmount(opt);
                              const course = category ? courseForCategory(category) : undefined;
                              const childClosed =
                                opt.scenario === "AGE_CONDITION" &&
                                course != null &&
                                !("childFee" in course);
                              return (
                                <li key={`${opt.scenario}-${opt.applicationType}`}>
                                  <span className={priceOptionKindChipClass(opt)}>
                                    {priceOptionKindLabel(opt)}
                                  </span>
                                  <span className="dl-price__desc">
                                    {priceOptionDescLabel(opt) || label}
                                  </span>
                                  {childClosed ? (
                                    <span className="dl-price__empty">참가 불가</span>
                                  ) : (
                                    <span
                                      className={
                                        row.linkDiscountApplicable &&
                                        listAmount > opt.finalAmount
                                          ? "dl-price__amt is-sale"
                                          : "dl-price__amt"
                                      }
                                    >
                                      {listAmount > opt.finalAmount ? (
                                        <s>{formatFee(listAmount)}</s>
                                      ) : null}
                                      <strong>{formatFee(opt.finalAmount)}</strong>
                                      {pct ? <em>링크 할인 {pct}%</em> : null}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                <ol className={panel === "notes" || !hasPrices ? "dl-notes" : "dl-notes is-off"}>
                  {notes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              </div>
            </section>
          </div>

          <div className={accepting ? "dl-cta" : "dl-cta is-blocked"}>
            <div className="dl-cta__bar">
              {blocked ? (
                <p className="dl-cta__note" role="status">
                  {blocked}
                </p>
              ) : null}
              {accepting ? (
                <button type="button" className="dl-cta__go" onClick={onNext}>
                  <span>유의사항 동의 후 신청하기</span>
                  <i aria-hidden>→</i>
                </button>
              ) : (
                <div className="dl-cta__links">
                  <Link className="btn btn--ghost" href={withAppBase(base, "/")}>
                    대회 메인
                  </Link>
                  <Link className="btn btn--red" href={withAppBase(base, "/register")}>
                    일반 참가신청
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
