"use client";

import type { DiscountLinkEntry } from "@/lib/discount-link/config";
import { DiscountPartnerMark } from "./DiscountPartnerMark";

export const DISCOUNT_STEPS = ["할인 안내", "유의사항 동의", "신청 작성"] as const;

export function DiscountStepBar({
  entry,
  step,
  onBack,
}: {
  entry: DiscountLinkEntry;
  step: 0 | 1 | 2;
  onBack?: () => void;
}) {
  const total = DISCOUNT_STEPS.length;

  return (
    <nav className="dl-steps" aria-label="할인 접수 단계">
      <div className="wrap dl-steps__inner">
        {onBack ? (
          <button
            type="button"
            className="dl-steps__back"
            onClick={onBack}
            aria-label={`${DISCOUNT_STEPS[step - 1]}(으)로 돌아가기`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <DiscountPartnerMark entry={entry} className="dl-steps__tag" />
        )}

        <div className="dl-steps__now">
          <span className="dl-steps__count">
            STEP {String(step + 1).padStart(2, "0")}
            <i>/ {String(total).padStart(2, "0")}</i>
          </span>
          <strong>{DISCOUNT_STEPS[step]}</strong>
        </div>

        <ol className="dl-steps__list">
          {DISCOUNT_STEPS.map((label, i) => (
            <li
              key={label}
              className={i < step ? "is-done" : i === step ? "is-on" : undefined}
              aria-current={i === step ? "step" : undefined}
            >
              <span className="dl-steps__no">{String(i + 1).padStart(2, "0")}</span>
              <span className="dl-steps__label">{label}</span>
            </li>
          ))}
        </ol>
      </div>
      <span className="dl-steps__track" aria-hidden>
        <span style={{ width: `${((step + 1) / total) * 100}%` }} />
      </span>
    </nav>
  );
}
