import { ticketForBirth, type TicketKind } from "@/lib/register";
import type { DiscountOptions, PriceOption } from "./types";

export type DiscountFeeKind = "individual" | "group";

function applicationTypeForKind(kind: DiscountFeeKind) {
  return kind === "group" ? "ORGANIZATION" : "PERSONAL";
}

export function selectPriceOption(
  options: PriceOption[],
  ticket: TicketKind,
): PriceOption | undefined {
  if (!options.length) return undefined;
  const preferredScenario = ticket === "child" ? "AGE_CONDITION" : "STANDARD";
  return (
    options.find((item) => item.scenario === preferredScenario) ??
    options.find((item) => item.scenario === "STANDARD") ??
    options[0]
  );
}

export function discountFeeForCategory(
  discount: DiscountOptions | null | undefined,
  categoryId: string,
  birth: string,
  kind: DiscountFeeKind,
): PriceOption | undefined {
  if (!discount) return undefined;
  const row = discount.categories.find((item) => item.categoryId === categoryId);
  if (!row) return undefined;
  const appType = applicationTypeForKind(kind);
  const scoped = row.priceOptions.filter((item) => item.applicationType === appType);
  const ticket = /^\d{8}$/.test(birth) ? ticketForBirth(birth) : "adult";
  return selectPriceOption(scoped, ticket);
}

export function discountLinkAcceptingRegistration(
  discount: DiscountOptions | null | undefined,
) {
  return discount?.linkStatus === "AVAILABLE";
}

export function discountLinkStatusLabel(status: DiscountOptions["linkStatus"]) {
  if (status === "NOT_STARTED") return "할인 링크 시작 전";
  if (status === "EXPIRED") return "할인 링크 종료";
  return "";
}

export function discountNewRegistrationBlockedMessage(
  discount: DiscountOptions | null | undefined,
) {
  if (!discount || discountLinkAcceptingRegistration(discount)) return "";
  const status = discountLinkStatusLabel(discount.linkStatus);
  return status
    ? `${status}. 지금은 이 할인 링크로 신규 접수를 받지 않습니다.`
    : "지금은 이 할인 링크로 신규 접수를 받지 않습니다.";
}

export function sumDiscountFees(
  discount: DiscountOptions | null | undefined,
  members: { categoryId: string; birth: string }[],
  kind: DiscountFeeKind,
) {
  if (!discount) return undefined;
  let total = 0;
  for (const member of members) {
    if (!member.categoryId) return undefined;
    const option = discountFeeForCategory(
      discount,
      member.categoryId,
      member.birth,
      kind,
    );
    if (!option) return undefined;
    total += option.finalAmount;
  }
  return total;
}
