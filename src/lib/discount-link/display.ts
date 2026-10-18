import type { DiscountOptions, PriceOption } from "./types";

const DATE_FMT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatKst(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = Object.fromEntries(
    DATE_FMT.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}

/** 종료 시각은 신규 취득 범위에서 제외 */
export function discountPeriodLabel(options: DiscountOptions) {
  const start = formatKst(options.acquisitionStartsAt);
  const end = formatKst(options.acquisitionEndsAt);
  if (start && end) return `${start} ~ ${end} 전`;
  if (start) return `${start}부터`;
  if (end) return `${end} 전까지`;
  return "";
}

export function discountApplyTypeLabel(type: DiscountOptions["applicationType"]) {
  if (type === "ORGANIZATION") return "단체 전용";
  if (type === "PERSONAL") return "개인 전용";
  return "개인 · 단체";
}

export function discountStatusTone(status: DiscountOptions["linkStatus"]) {
  if (status === "AVAILABLE") return { tone: "on" as const, label: "접수 중" };
  if (status === "NOT_STARTED") return { tone: "wait" as const, label: "시작 전" };
  return { tone: "off" as const, label: "종료" };
}

function externalPercent(option: PriceOption) {
  let best = 0;
  for (const item of option.appliedDiscounts) {
    if (item.stage === "EXTERNAL" && item.method === "PERCENT" && item.ratePercent) {
      best = Math.max(best, item.ratePercent);
    }
  }
  return best;
}

/** 서버 appliedDiscounts 값만 사용 */
export function discountHeadline(options: DiscountOptions) {
  let percent = 0;
  let reduced = false;
  for (const category of options.categories) {
    if (!category.linkDiscountApplicable) continue;
    for (const option of category.priceOptions) {
      percent = Math.max(percent, externalPercent(option));
      if (option.finalAmount < option.baseAmount) reduced = true;
    }
  }
  if (percent > 0) return { value: `${percent}%`, label: "참가비 할인" };
  if (reduced) return { value: "SPECIAL", label: "할인가 적용" };
  return null;
}

export function priceOptionKindLabel(option: PriceOption) {
  return option.applicationType === "ORGANIZATION" ? "단체" : "개인";
}

export function priceOptionKindChipClass(option: PriceOption) {
  const kind =
    option.applicationType === "ORGANIZATION"
      ? "dl-price__kind--org"
      : "dl-price__kind--personal";
  return `dl-price__kind ${kind}`;
}

/** STANDARD 설명은 "모든 서비스 내 할인 조건에 해당하지 않는 경우"처럼 길게 와서 짧게 바꿈 */
export function priceOptionDescLabel(option: PriceOption) {
  if (option.scenario === "STANDARD") {
    return option.finalAmount < option.baseAmount ? "기본 할인" : "기본 참가비";
  }
  return option.description;
}

export function priceOptionPercent(option: PriceOption) {
  return externalPercent(option);
}
