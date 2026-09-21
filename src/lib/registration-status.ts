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

export const PAYMENT_CANCEL_STATUSES = [
  "PROCESSING",
  "DONE",
  "FAILED",
  "UNKNOWN",
] as const;

export type PaymentCancelStatus = (typeof PAYMENT_CANCEL_STATUSES)[number];

export const PAYMENT_CANCEL_STATUS_LABEL: Record<PaymentCancelStatus, string> = {
  PROCESSING: "환불 처리 중",
  DONE: "환불 완료",
  FAILED: "환불 실패",
  UNKNOWN: "확인 중",
};

export const PAYMENT_ACTIONS = [
  "PREPARE_PAYMENT",
  "WAIT",
  "NONE",
  "PAYMENT_CLOSED",
  "CONTACT_SUPPORT",
] as const;

export type PaymentAction = (typeof PAYMENT_ACTIONS)[number];

export const PAYMENT_ACTION_LABEL: Record<PaymentAction, string> = {
  PREPARE_PAYMENT: "추가 결제 가능",
  WAIT: "결제 확인 중",
  NONE: STATUS_NOT_APPLICABLE,
  PAYMENT_CLOSED: "결제 기한 종료",
  CONTACT_SUPPORT: "운영 문의 필요",
};

export const PAYMENT_ACTION_NOTE: Partial<Record<PaymentAction, string>> = {
  WAIT: "결제를 확인하고 있습니다. 잠시 후 다시 조회해 주세요.",
  PAYMENT_CLOSED: "결제 기한이 종료되었습니다.",
  CONTACT_SUPPORT: "운영 문의가 필요합니다.",
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

export function isPaymentStatus(value: string): value is PaymentStatus {
  return PAYMENT_STATUSES.includes(value as PaymentStatus);
}

export function isPaymentCancelStatus(value: string): value is PaymentCancelStatus {
  return PAYMENT_CANCEL_STATUSES.includes(value as PaymentCancelStatus);
}

export function isPaymentAction(value: string): value is PaymentAction {
  return PAYMENT_ACTIONS.includes(value as PaymentAction);
}

export function paymentStatusKey(value?: string | null): PaymentStatus | "" {
  const key = statusKey(value);
  return isPaymentStatus(key) ? key : "";
}

/** 결제 필드에 신청 상태가 들어온 경우만 대응 */
export function paymentStatusFromUnknown(value?: string | null): PaymentStatus | "" {
  const payment = paymentStatusKey(value);
  if (payment) return payment;
  const key = statusKey(value);
  if (key === "PENDING" || key === "PAYMENT_PENDING" || key === "EXPIRED") return "UNPAID";
  if (key === "ADDITIONAL_PAYMENT_REQUIRED") return "UNPAID";
  if (key === "PARTIAL_REFUND_REQUIRED") return "NEED_PARTIAL_REFUND";
  if (key === "CANCELLATION_PENDING") return "NEED_REFUND";
  return "";
}

export function registrationStatusFromParam(value: string | null): RegistrationStatus | "" {
  const key = statusKey(value);
  return isRegistrationStatus(key) ? key : "";
}

export function registrationStatusLabel(status?: string | null) {
  const key = statusKey(status);
  if (isRegistrationStatus(key)) return REGISTRATION_STATUS_LABEL[key];
  return STATUS_NOT_APPLICABLE;
}

export function refundStatusLabel(status?: string | null) {
  const key = statusKey(status);
  if (isPaymentCancelStatus(key)) return PAYMENT_CANCEL_STATUS_LABEL[key];
  return "";
}

export function refundStatusDisplay(status?: string | null) {
  const label = refundStatusLabel(status);
  return label || STATUS_NOT_APPLICABLE;
}

export function paymentActionLabel(action?: string | null) {
  const key = statusKey(action);
  if (isPaymentAction(key)) return PAYMENT_ACTION_LABEL[key];
  return "";
}

export function paymentActionNote(action?: string | null) {
  const key = statusKey(action);
  if (isPaymentAction(key)) return PAYMENT_ACTION_NOTE[key] ?? "";
  return "";
}

export function paymentActionDisplay(action?: string | null) {
  const label = paymentActionLabel(action);
  return label || STATUS_NOT_APPLICABLE;
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
  const key = paymentStatusFromUnknown(status);
  const meta = key ? PAYMENT_STATUS[key] : undefined;
  const api = apiLabel?.trim();
  return {
    label: api || meta?.label || STATUS_NOT_APPLICABLE,
    hint: meta?.hint ?? "",
  };
}

export function paymentStatusDisplay(status?: string | null, apiLabel?: string | null) {
  return paymentStatusInfo(status, apiLabel).label;
}

export function paymentStatusLabel(status?: string | null, apiLabel?: string | null) {
  return paymentStatusInfo(status, apiLabel).label;
}

export function paymentStatusBadge(status?: string | null) {
  const key = paymentStatusFromUnknown(status);
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
