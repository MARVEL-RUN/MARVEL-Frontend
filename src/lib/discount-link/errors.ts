import { MainHttpError } from "@/lib/main/fetch";

export const DISCOUNT_ERROR_CODES = [
  "DISCOUNT_LINK_NOT_FOUND",
  "DISCOUNT_LINK_DISABLED",
  "REGISTRATION_DISCOUNT_LINK_UNAVAILABLE",
  "DISCOUNT_LINK_PAYMENT_DISABLED",
  "DISCOUNT_GROUP_MINIMUM_NOT_MET",
  "DISCOUNT_ZERO_AMOUNT_NOT_SUPPORTED",
  "DISCOUNT_CONFIGURATION_ERROR",
] as const;

export type DiscountErrorCode = (typeof DISCOUNT_ERROR_CODES)[number];

export function isDiscountErrorCode(code: string): code is DiscountErrorCode {
  return (DISCOUNT_ERROR_CODES as readonly string[]).includes(code);
}

export function registrationDiscountUnavailable(err: unknown) {
  return err instanceof MainHttpError && err.code === "REGISTRATION_DISCOUNT_LINK_UNAVAILABLE";
}

export function discountLinkPaymentDisabled(err: unknown) {
  return err instanceof MainHttpError && err.code === "DISCOUNT_LINK_PAYMENT_DISABLED";
}

export function discountGroupMinimumNotMet(err: unknown) {
  return err instanceof MainHttpError && err.code === "DISCOUNT_GROUP_MINIMUM_NOT_MET";
}

/** lookup·수정·결제 retry — 신규 신청용 일반 접수 이동 UI는 제외 */
export function discountActionErrorMessage(err: unknown, fallback: string) {
  if (!(err instanceof MainHttpError)) return fallback;
  const message = err.message.trim();
  const safe = message && !/^HTTP\s*\d+/i.test(message) ? message : "";

  switch (err.code) {
    case "DISCOUNT_LINK_PAYMENT_DISABLED":
      return safe || "할인 링크 결제가 중단되어 결제를 진행할 수 없습니다.";
    case "DISCOUNT_GROUP_MINIMUM_NOT_MET":
      return safe || "단체 최소 인원 조건을 충족하지 못했습니다. 명단을 확인해 주세요.";
    case "DISCOUNT_ZERO_AMOUNT_NOT_SUPPORTED":
      return safe || "0원 결제는 지원되지 않습니다.";
    case "DISCOUNT_CONFIGURATION_ERROR":
      return safe || "참가비 계산 설정 오류입니다. 잠시 후 다시 시도해 주세요.";
    case "DISCOUNT_LINK_NOT_FOUND":
    case "DISCOUNT_LINK_DISABLED":
      return safe || fallback;
    case "REGISTRATION_DISCOUNT_LINK_UNAVAILABLE":
      return safe || fallback;
    default:
      if (isDiscountErrorCode(err.code ?? "")) return safe || fallback;
      return fallback;
  }
}
