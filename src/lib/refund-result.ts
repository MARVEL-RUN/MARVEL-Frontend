import { statusKey } from "@/lib/registration-status";
import type { AdminRefundCounts, AdminRefundItem } from "@/services/admin/refunds";

export const REFUND_ITEM_STATUS_LABEL: Record<string, string> = {
  PENDING: "처리 대기",
  RUNNING: "처리 중",
  SUCCEEDED: "처리 성공",
  BLOCKED: "처리 차단",
  FAILED: "환불 실패",
  NEEDS_REVIEW: "운영자 확인 필요",
};

export function refundEvidenceVerdictLabel(value?: string | null) {
  const key = statusKey(value);
  if (!key) return "-";
  return REFUND_EVIDENCE_VERDICT_LABEL[key] || `${value?.trim() || key} · 확인 필요`;
}

export const REFUND_EVIDENCE_VERDICT_LABEL: Record<string, string> = {
  EXTERNAL_CANCEL_CONFIRMED: "외부 취소 확인됨",
  NOT_IDENTIFIABLE: "특정 불가",
  KNOWN_CANCEL_NOT_OBSERVED: "기존 취소 미관측",
  RESPONSE_MISMATCH: "응답 불일치",
  LOOKUP_UNAVAILABLE: "외부 조회 실패",
  LOCAL_CHANGED: "로컬 상태 변경",
};

export const REFUND_ERROR_HINT: Record<string, string> = {
  CONCURRENT_MODIFICATION: "다른 변경이 먼저 반영되었습니다. 최신 조회 후 다시 판단하세요.",
  REGISTRATION_MODIFICATION_PAYMENT_CONFLICT: "진행 중 거래 또는 같은 요청과 충돌했습니다.",
  PAYMENT_CANCEL_CONFLICT: "진행 중·결과불명 환불을 확인하세요.",
  CAPACITY_ACQUIRE_FAILED: "정원·재고를 확보하지 못했습니다.",
  CAPACITY_CONFIGURATION_ERROR: "정원 설정을 확인하세요.",
  CAPACITY_COUNTER_MISMATCH: "정원 카운터를 확인하세요.",
  PAYMENT_CANCEL_INTEGRITY_ERROR: "금액·원장·신청 상태가 맞지 않습니다.",
  REGISTRATION_NOT_FOUND: "대상을 찾을 수 없습니다.",
  ORGANIZATION_NOT_FOUND: "단체를 찾을 수 없습니다.",
  INVALID_REGISTRATION_MODIFICATION_ARGUMENT: "요청 형식·대상을 확인하세요.",
  PREPARATION_OR_JOURNAL_ERROR: "처리를 확정할 수 없습니다. 저장 결과와 증거를 확인하세요.",
  EXECUTION_INTERRUPTED: "처리를 확정할 수 없습니다. 저장 결과와 증거를 확인하세요.",
  REFUND_RESULT_REQUIRES_CHECK: "외부 환불 결과를 확인하세요.",
  INVALID_REFUND_REQUEST: "요청 값을 확인하세요.",
};

export function refundItemStatusLabel(value?: string | null) {
  const key = statusKey(value);
  if (!key) return "-";
  return REFUND_ITEM_STATUS_LABEL[key] || `${value?.trim() || key} · 확인 필요`;
}

export const REFUND_BATCH_STATUS_LABEL: Record<string, string> = {
  PENDING: "접수 대기",
  RUNNING: "처리 중",
  COMPLETED: "배치 종료",
};

export function refundBatchUnfinished(status?: string | null) {
  const key = statusKey(status);
  return key === "PENDING" || key === "RUNNING";
}

export function refundBatchStatusLabel(value?: string | null) {
  const key = statusKey(value);
  if (!key) return "-";
  return REFUND_BATCH_STATUS_LABEL[key] || `${value?.trim() || key} · 확인 필요`;
}

export function refundItemStatusBadge(value?: string | null) {
  const key = statusKey(value);
  if (key === "SUCCEEDED") return "paid";
  if (key === "PENDING" || key === "RUNNING") return "pending";
  if (key === "FAILED" || key === "BLOCKED") return "refunded";
  return "must";
}

export function refundErrorHint(code?: string | null) {
  const key = (code ?? "").trim();
  if (!key) return "";
  return REFUND_ERROR_HINT[key] || "운영자 확인 필요";
}

export function refundCount(counts: AdminRefundCounts | undefined, key: string) {
  const value = counts?.[key as keyof AdminRefundCounts];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function refundItemMessage(item: AdminRefundItem) {
  const mapped = refundErrorHint(item.errorCode);
  if (item.errorCode && mapped) {
    return `${item.errorCode} · ${mapped}`;
  }
  return refundItemStatusLabel(item.status);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function textField(row: Record<string, unknown> | null, key: string) {
  const value = row?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function refundItemBackendMessage(item: AdminRefundItem) {
  const result = asRecord(item.result);
  const fromResult = textField(result, "message");
  if (fromResult) return fromResult;
  const refunds = result?.refunds;
  if (Array.isArray(refunds)) {
    for (const refund of refunds) {
      const row = asRecord(refund);
      const outcome = asRecord(row?.externalOutcome ?? null);
      const message = textField(outcome, "message");
      if (message) return message;
    }
  }
  if (item.errorCode) {
    const hint = refundErrorHint(item.errorCode);
    return hint ? `${item.errorCode} · ${hint}` : item.errorCode;
  }
  return "";
}

export function refundBatchToast(result: {
  summary: { status?: string };
  items: AdminRefundItem[];
}) {
  if (refundBatchUnfinished(result.summary.status)) return null;
  const failed = result.items.filter((item) => {
    const key = statusKey(item.status);
    return key === "FAILED" || key === "BLOCKED" || key === "NEEDS_REVIEW";
  });
  if (failed.length > 0) {
    return {
      ok: false as const,
      message: refundItemBackendMessage(failed[0]) || refundItemMessage(failed[0]),
    };
  }
  const succeeded = result.items.find((item) => statusKey(item.status) === "SUCCEEDED");
  return {
    ok: true as const,
    message:
      (succeeded && refundItemBackendMessage(succeeded)) ||
      "환불 처리가 완료되었습니다.",
  };
}
