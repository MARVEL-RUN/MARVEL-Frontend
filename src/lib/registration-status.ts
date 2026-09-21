export const REGISTRATION_STATUSES = [
  "PENDING",
  "PAYMENT_PENDING",
  "CONFIRMED",
  "ADDITIONAL_PAYMENT_REQUIRED",
  "PARTIAL_REFUND_REQUIRED",
  "CANCELLATION_PENDING",
  "CANCELED",
  "EXPIRED",
] as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const STATUS_NOT_APPLICABLE = "해당 사항 없음";

export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  PENDING: "결제 대기(관리자)",
  PAYMENT_PENDING: "결제 대기",
  CONFIRMED: "확정",
  ADDITIONAL_PAYMENT_REQUIRED: "추가 결제 필요",
  PARTIAL_REFUND_REQUIRED: "부분 환불 필요",
  CANCELLATION_PENDING: "취소 처리 중",
  CANCELED: "취소",
  EXPIRED: "만료",
};

export function statusKey(value?: string | null) {
  return (value ?? "").trim().toUpperCase();
}

export function isRegistrationStatus(value: string): value is RegistrationStatus {
  return REGISTRATION_STATUSES.includes(value as RegistrationStatus);
}

export function registrationStatusFromParam(value: string | null): RegistrationStatus | "" {
  const key = statusKey(value);
  return isRegistrationStatus(key) ? key : "";
}

export function registrationStatusLabel(status?: string | null) {
  const key = statusKey(status);
  if (!key) return STATUS_NOT_APPLICABLE;
  if (key === "UNKNOWN") return "확인 불가";
  if (isRegistrationStatus(key)) return REGISTRATION_STATUS_LABEL[key];
  return STATUS_NOT_APPLICABLE;
}

export function registrationStatusBadge(status?: string | null) {
  const key = statusKey(status);
  if (key === "CONFIRMED") return "paid";
  if (key === "PENDING" || key === "PAYMENT_PENDING") return "pending";
  if (
    key === "CANCELLATION_PENDING" ||
    key === "PARTIAL_REFUND_REQUIRED" ||
    key === "ADDITIONAL_PAYMENT_REQUIRED"
  ) {
    return "refund_requested";
  }
  if (key === "CANCELED" || key === "EXPIRED") return "refunded";
  if (key === "UNKNOWN") return "must";
  return "plain";
}

export function closedRegistration(status?: string | null) {
  return ["CANCELED", "EXPIRED", "CANCELLATION_PENDING"].includes(statusKey(status));
}

export function canPrepareRegistrationPayment(status?: string | null) {
  const key = statusKey(status);
  return key === "PENDING" || key === "PAYMENT_PENDING" || key === "ADDITIONAL_PAYMENT_REQUIRED";
}
