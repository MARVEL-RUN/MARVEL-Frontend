"use client";

import { adminToast } from "@/components/admin/Toast";
import { isAdminHttp } from "@/lib/admin/fetch";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { refundEvidenceVerdictLabel } from "@/lib/refund-result";
import {
  fetchRefundEvidence,
  postRefundEvidence,
  type AdminRefundEvidence,
} from "@/services/admin/refunds";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type Props = {
  eventId: string;
  paymentCancelId: string;
  onClose: () => void;
};

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "확인 이력이 없습니다.";
  return error instanceof Error ? error.message : "확인 이력 조회에 실패했습니다.";
}

function EvidenceRow({ item }: { item: AdminRefundEvidence }) {
  return (
    <li className="admin-refund-evidence__item">
      <div className="admin-refund-evidence__top">
        <span className="admin-badge admin-badge--must">
          {refundEvidenceVerdictLabel(item.verdict)}
        </span>
        <span>{formatAdminBoardDate(item.checkedAt || item.startedAt)}</span>
      </div>
      {item.reason ? <p>{item.reason}</p> : null}
      <p className="admin-refund-evidence__meta">
        {[
          item.checkedBy ? `확인 ${item.checkedBy}` : "",
          item.httpStatus != null ? `HTTP ${item.httpStatus}` : "",
          item.errorCode || "",
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </li>
  );
}

export function RefundEvidencePanel({ eventId, paymentCancelId, onClose }: Props) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const queryKey = ["admin", "refund-evidence", eventId, paymentCancelId, page];

  const history = useQuery({
    queryKey,
    queryFn: () => fetchRefundEvidence(eventId, paymentCancelId, page),
    enabled: Boolean(eventId && paymentCancelId),
  });

  const check = useMutation({
    mutationFn: () => postRefundEvidence(eventId, paymentCancelId),
    onSuccess: async (data) => {
      adminToast.success(
        data.reason?.trim() || refundEvidenceVerdictLabel(data.verdict),
      );
      await queryClient.invalidateQueries({
        queryKey: ["admin", "refund-evidence", eventId, paymentCancelId],
      });
    },
    onError: (err) =>
      adminToast.error(
        err instanceof Error ? err.message : "외부 환불 결과 확인에 실패했습니다.",
      ),
  });

  const rows = history.data?.items ?? [];
  const missing = history.isError && isAdminHttp(history.error, 404);
  const loadError = history.isError && !missing;
  const size = history.data?.size ?? 20;
  const hasNext = rows.length >= size;
  const hasPrev = page > 0;

  return (
    <aside className="admin-drawer admin-drawer--log" role="dialog" aria-label="외부 환불 결과 확인">
      <header className="admin-drawer__hero">
        <div className="admin-drawer__hero-bar">
          <span className="admin-drawer__hero-kind">외부 환불 결과 확인</span>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            닫기
          </button>
        </div>
        <p className="admin-pay__hint admin-refund-evidence__hint">
          토스 조회만 하고 확인 기록을 저장합니다. 환불을 다시 보내지 않습니다.
        </p>
        <button
          type="button"
          className="admin-btn admin-btn--primary admin-refund-evidence__run"
          disabled={check.isPending}
          onClick={() => check.mutate()}
        >
          외부 환불 결과 확인
        </button>
      </header>
      <div className="admin-drawer__body admin-pay-log-drawer__body">
        {history.isLoading ? <p className="admin-pay__hint">불러오는 중…</p> : null}
        {loadError ? <p className="admin-pay__hint">{errorHint(history.error)}</p> : null}
        {!history.isLoading && !loadError && rows.length === 0 ? (
          <p className="admin-pay__hint">저장된 확인 이력이 없습니다.</p>
        ) : null}
        {rows.length > 0 ? (
          <ul className="admin-refund-evidence">
            {rows.map((item, index) => (
              <EvidenceRow key={item.evidenceId ?? `${item.checkedAt}-${index}`} item={item} />
            ))}
          </ul>
        ) : null}
        {hasPrev || hasNext ? (
          <div className="admin-pay-list-drawer__pager">
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              disabled={!hasPrev}
              onClick={() => setPage((n) => Math.max(0, n - 1))}
            >
              이전
            </button>
            <span>{page + 1}</span>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              disabled={!hasNext}
              onClick={() => setPage((n) => n + 1)}
            >
              다음
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
