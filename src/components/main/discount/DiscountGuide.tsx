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
  priceOptionKindLabel,
  priceOptionPercent,
} from "@/lib/discount-link/display";
import {
  discountLinkAcceptingRegistration,
  discountNewRegistrationBlockedMessage,
} from "@/lib/discount-link/pricing";
import type { DiscountOptions } from "@/lib/discount-link/types";
import { useAppBasePath } from "@/lib/main/useAppBasePath";
import { withAppBase } from "@/lib/preview";
import { categoryLabel, findCategory } from "@/lib/registration-options";
import type { RegistrationCategory } from "@/services/main/types";
import { DiscountPartnerMark } from "./DiscountPartnerMark";

type GuidePanel = "prices" | "notes";

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
  const [panel, setPanel] = useState<GuidePanel>(hasPrices ? "prices" : "notes");

  function goPanel(next: GuidePanel) {
    setPanel(next);
  }

  return (
    <section className="dl-stage dl-guide" aria-labelledby="dl-guide-title">
      <div className="wrap dl-guide__grid">
        <div className="dl-guide__aside">
          <article className="dl-pass">
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

            <span className="dl-pass__tear" aria-hidden />

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
                <div className="is-wide">
                  <dt>할인 접수 기간</dt>
                  <dd className="dl-pass__period">
                    {period.split(" ~ ").map((part, i, all) => (
                      <span key={part}>
                        {part}
                        {i < all.length - 1 ? " ~" : ""}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>

            {options.message ? <p className="dl-pass__msg">{options.message}</p> : null}
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
                  <h2 id="dl-prices-title">종목별 할인가</h2>
                ) : (
                  <h2 id="dl-notes-title">신청 전 확인</h2>
                )}
                {hasPrices ? (
                  <div className="dl-block__nav">
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
              {panel === "prices" && hasPrices ? (
                <ul className="dl-prices">
                  {options.categories.map((row) => {
                    const category = findCategory(categories, row.categoryId);
                    const label = category ? categoryLabel(category) : row.categoryId;
                    return (
                      <li
                        key={row.categoryId}
                        className={row.linkDiscountApplicable ? "dl-price" : "dl-price is-plain"}
                      >
                        <div className="dl-price__head">
                          <h3>{label}</h3>
                          <span className="dl-price__flag">
                            {row.linkDiscountApplicable ? "할인 적용" : "할인 미적용"}
                          </span>
                        </div>
                        <ul className="dl-price__opts">
                          {row.priceOptions.map((opt) => {
                            const pct = priceOptionPercent(opt);
                            return (
                              <li key={`${opt.scenario}-${opt.applicationType}`}>
                                <span className="dl-price__kind">{priceOptionKindLabel(opt)}</span>
                                <span className="dl-price__desc">{opt.description || label}</span>
                                <span
                                  className={
                                    opt.scenario === "AGE_CONDITION"
                                      ? "dl-price__amt is-child"
                                      : "dl-price__amt"
                                  }
                                >
                                  {opt.baseAmount > opt.finalAmount ? (
                                    <s>{formatFee(opt.baseAmount)}</s>
                                  ) : null}
                                  <strong>{formatFee(opt.finalAmount)}</strong>
                                  {pct ? <em>링크 할인 {pct}%</em> : null}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ol className="dl-notes">
                  {notes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              )}
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
