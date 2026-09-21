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

export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  PENDING: "결제 대기",
  PAYMENT_PENDING: "결제 대기",
  CONFIRMED: "확정",
  ADDITIONAL_PAYMENT_REQUIRED: "추가 결제 필요",
  PARTIAL_REFUND_REQUIRED: "부분 환불 필요",
  CANCELLATION_PENDING: "취소 처리 중",
  CANCELED: "취소",
  EXPIRED: "만료",
};

export const PAYMENT_STATUSES = [
  "UNPAID",
  "COMPLETED",
  "MUST_CHECK",
  "NEED_PARTITIAL_REFUND",
  "NEED_PARTIAL_REFUND",
  "NEED_REFUND",
  "REFUNDED",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS: Record<
  PaymentStatus,
  { label: string; hint: string }
> = {
  UNPAID: {
    label: "미결제",
    hint: "결제가 아직 완료되지 않았습니다.",
  },
  COMPLETED: {
    label: "결제완료",
    hint: "",
  },
  MUST_CHECK: {
    label: "확인 필요",
    hint: "결제 상태를 확인하고 있습니다. 잠시 후 다시 조회해 주세요.",
  },
  NEED_PARTITIAL_REFUND: {
    label: "차액 환불 요청",
    hint: "차액 환불이 요청되었습니다.",
  },
  NEED_PARTIAL_REFUND: {
    label: "차액 환불 요청",
    hint: "차액 환불이 요청되었습니다.",
  },
  NEED_REFUND: {
    label: "전액 환불 요청",
    hint: "전액 환불이 요청되었습니다.",
  },
  REFUNDED: {
    label: "전액 환불 완료",
    hint: "참가비가 환불되었습니다.",
  },
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
  if (isRegistrationStatus(key)) return REGISTRATION_STATUS_LABEL[key];
  return status?.trim() || "—";
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
  return "plain";
}

export function paymentStatusInfo(status?: string | null, apiLabel?: string | null) {
  const key = statusKey(status);
  const meta = PAYMENT_STATUS[key as PaymentStatus];
  return {
    label: apiLabel?.trim() || meta?.label || (status?.trim() ? status : "—"),
    hint: meta ? meta.hint : status?.trim() ? "상태 안내는 운영 문의로 확인해 주세요." : "",
  };
}

export function paymentStatusLabel(status?: string | null, apiLabel?: string | null) {
  return paymentStatusInfo(status, apiLabel).label;
}

export function paymentStatusBadge(status?: string | null) {
  const key = statusKey(status);
  if (key === "COMPLETED") return "paid";
  if (key === "UNPAID") return "pending";
  if (key === "NEED_REFUND" || key === "NEED_PARTIAL_REFUND" || key === "NEED_PARTITIAL_REFUND") {
    return "refund_requested";
  }
  if (key === "REFUNDED") return "refunded";
  if (key === "MUST_CHECK") return "must";
  return "plain";
}

export function closedRegistration(status?: string | null) {
  return ["CANCELED", "EXPIRED", "CANCELLATION_PENDING"].includes(statusKey(status));
}
