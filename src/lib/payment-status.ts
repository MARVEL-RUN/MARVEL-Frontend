import { statusKey } from "@/lib/registration-status";

export const PAYMENT_ORDER_STATUSES = [
  "READY",
  "CONFIRMING",
  "COMPLETED",
  "FAILED",
  "UNKNOWN",
  "INVALIDATED",
] as const;

export type PaymentOrderStatus = (typeof PAYMENT_ORDER_STATUSES)[number];

export const PAYMENT_ORDER_STATUS_LABEL: Record<PaymentOrderStatus, string> = {
  READY: "결제 대기",
  CONFIRMING: "승인 중",
  COMPLETED: "결제 완료",
  FAILED: "결제 실패",
  UNKNOWN: "확인 필요",
  INVALIDATED: "무효",
};

export const PAYMENT_CANCEL_STATUSES = [
  "PROCESSING",
  "DONE",
  "FAILED",
  "UNKNOWN",
] as const;

export type PaymentCancelStatus = (typeof PAYMENT_CANCEL_STATUSES)[number];

export const PAYMENT_CANCEL_STATUS_LABEL: Record<PaymentCancelStatus, string> = {
  PROCESSING: "진행 중",
  DONE: "환불 완료",
  FAILED: "환불 실패",
  UNKNOWN: "확인 필요",
};

export const PAYMENT_PURPOSES: Record<string, string> = {
  REGISTRATION_TRY: "최초 접수",
  ADDITIONAL_PAYMENT: "추가 결제",
  MIXED_PAYMENT: "혼합 결제",
};

export const PAYMENT_CANCEL_PURPOSES: Record<string, string> = {
  REGISTRATION_CANCELLATION: "참가 취소",
  PRICE_ADJUSTMENT: "차액 조정",
  ADMIN_ADJUSTMENT: "관리자 조정",
  EVENT_POLICY: "대회 정책",
};

function isPaymentOrderStatus(value: string): value is PaymentOrderStatus {
  return PAYMENT_ORDER_STATUSES.includes(value as PaymentOrderStatus);
}

function isPaymentCancelStatus(value: string): value is PaymentCancelStatus {
  return PAYMENT_CANCEL_STATUSES.includes(value as PaymentCancelStatus);
}

export function paymentOrderStatusLabel(value?: string | null) {
  const key = statusKey(value);
  if (!key) return "-";
  if (isPaymentOrderStatus(key)) return PAYMENT_ORDER_STATUS_LABEL[key];
  return value?.trim() || "확인 필요";
}

export function paymentCancelStatusLabel(value?: string | null) {
  const key = statusKey(value);
  if (!key) return "-";
  if (isPaymentCancelStatus(key)) return PAYMENT_CANCEL_STATUS_LABEL[key];
  return value?.trim() || "확인 필요";
}

export function paymentPurposeLabel(value?: string | null) {
  const key = statusKey(value);
  if (!key) return "";
  return PAYMENT_PURPOSES[key] || value?.trim() || "";
}

export function paymentCancelPurposeLabel(value?: string | null) {
  const key = statusKey(value);
  if (!key) return "";
  return PAYMENT_CANCEL_PURPOSES[key] || value?.trim() || "";
}

export const PAYMENT_CANCEL_ERROR_LABEL: Record<string, string> = {
  CANCEL_RESPONSE_MISMATCH: "취소 결과를 확정하지 못했습니다.",
  CANCEL_UNKNOWN: "취소 확인이 불가합니다.",
};

export function paymentCancelErrorText(errorCode?: string | null, errorMessage?: string | null) {
  const message = errorMessage?.trim();
  if (message) return message;
  const key = statusKey(errorCode);
  if (!key) return "";
  return PAYMENT_CANCEL_ERROR_LABEL[key] || "확인 필요";
}

export function paymentOrderStatusBadge(value?: string | null) {
  const key = statusKey(value);
  if (key === "COMPLETED") return "paid";
  if (key === "READY" || key === "CONFIRMING") return "pending";
  if (key === "FAILED" || key === "INVALIDATED") return "refunded";
  return "must";
}

export function paymentCancelStatusBadge(value?: string | null) {
  const key = statusKey(value);
  if (key === "DONE") return "refunded";
  if (key === "PROCESSING") return "pending";
  if (key === "FAILED") return "refund_requested";
  return "must";
}
