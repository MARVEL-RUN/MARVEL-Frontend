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
