import { statusKey } from "@/lib/registration-status";

export const PAYMENT_PROCESS_TYPES = [
  "PAYMENT_PREPARED",
  "CONFIRM_REQUESTED",
  "CONFIRM_SUCCEEDED",
  "CONFIRM_FAILED",
  "CANCEL_PREPARED",
  "CANCEL_REQUESTED",
  "CANCEL_SUCCEEDED",
  "CANCEL_FAILED",
  "CANCEL_UNKNOWN",
  "WEBHOOK_RECEIVED",
  "WEBHOOK_CONFIRM",
  "WEBHOOK_CANCEL",
  "RETRY_REQUESTED",
  "STATUS_SYNC",
  "EXPIRED",
] as const;

export type PaymentProcessType = (typeof PAYMENT_PROCESS_TYPES)[number];

export const PAYMENT_PROCESS_TYPE_LABEL: Record<PaymentProcessType, string> = {
  PAYMENT_PREPARED: "결제 준비",
  CONFIRM_REQUESTED: "승인 요청",
  CONFIRM_SUCCEEDED: "승인 완료",
  CONFIRM_FAILED: "승인 실패",
  CANCEL_PREPARED: "취소 준비",
  CANCEL_REQUESTED: "취소 요청",
  CANCEL_SUCCEEDED: "취소 완료",
  CANCEL_FAILED: "취소 실패",
  CANCEL_UNKNOWN: "취소 확인 불가",
  WEBHOOK_RECEIVED: "웹훅 수신",
  WEBHOOK_CONFIRM: "웹훅 승인 처리",
  WEBHOOK_CANCEL: "웹훅 취소 처리",
  RETRY_REQUESTED: "재시도 요청",
  STATUS_SYNC: "상태 동기화",
  EXPIRED: "결제 만료",
};

export const PAYMENT_LOG_SOURCES = [
  "API",
  "WEBHOOK",
  "SCHEDULER",
  "CRON",
  "ADMIN",
  "SYSTEM",
  "INTERNAL",
] as const;

export type PaymentLogSource = (typeof PAYMENT_LOG_SOURCES)[number];

export const PAYMENT_LOG_SOURCE_LABEL: Record<PaymentLogSource, string> = {
  API: "API",
  WEBHOOK: "웹훅",
  SCHEDULER: "배치",
  CRON: "배치",
  ADMIN: "관리자",
  SYSTEM: "시스템",
  INTERNAL: "내부",
};

function isPaymentProcessType(value: string): value is PaymentProcessType {
  return PAYMENT_PROCESS_TYPES.includes(value as PaymentProcessType);
}

function isPaymentLogSource(value: string): value is PaymentLogSource {
  return PAYMENT_LOG_SOURCES.includes(value as PaymentLogSource);
}

export function paymentLogProcessLabel(value?: string | null) {
  const key = statusKey(value);
  if (!key) return "-";
  if (isPaymentProcessType(key)) return PAYMENT_PROCESS_TYPE_LABEL[key];
  return value?.trim() || "-";
}

export function paymentLogSourceLabel(value?: string | null) {
  const key = statusKey(value);
  if (!key) return "-";
  if (isPaymentLogSource(key)) return PAYMENT_LOG_SOURCE_LABEL[key];
  return value?.trim() || "-";
}
