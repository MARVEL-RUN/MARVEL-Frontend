"use client";

import { formatAmount } from "@/services/admin/applications";
import {
  refundBatchStatusLabel,
  refundBatchUnfinished,
  refundCount,
  refundItemMessage,
  refundItemStatusBadge,
  refundItemStatusLabel,
} from "@/lib/refund-result";
import {
  fetchRefundBatch,
  fetchRefundBatchItems,
  type AdminRefundBatchResponse,
  type AdminRefundItem,
  type AdminRefundSummary,
} from "@/services/admin/refunds";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type Props = {
  eventId: string;
  result: AdminRefundBatchResponse;
  lookingUp?: boolean;
  onLookup?: () => void;
  onClose: () => void;
};

function ItemList({ items }: { items: AdminRefundItem[] }) {
  if (items.length === 0) {
    return <p className="admin-pay__hint">표시할 항목이 없습니다.</p>;
  }
  return (
    <ul className="admin-refund-result__items">
      {items.map((item, index) => (
        <li key={`${item.itemNo ?? "item"}-${item.registrationId ?? index}`}>
          <div className="admin-refund-result__item-top">
            <span className={`admin-badge admin-badge--${refundItemStatusBadge(item.status)}`}>
              {refundItemStatusLabel(item.status)}
            </span>
            <span className="admin-refund-result__id">
              {item.registrationId || item.organizationId || `항목 ${item.itemNo ?? index}`}
            </span>
          </div>
          <p>{refundItemMessage(item)}</p>
          {(item.preparation?.refunds ?? []).map((refund) => (
            <p key={refund.paymentCancelId ?? refund.paymentId} className="admin-refund-result__prep">
              준비 시점 {refund.amount != null ? formatAmount(refund.amount) : "-"}
              {refund.type ? ` · ${refund.type}` : ""}
            </p>
          ))}
        </li>
      ))}
    </ul>
  );
}

export function RefundResultPanel({ eventId, result, lookingUp, onLookup, onClose }: Props) {
  const batchId = result.summary.batchId ?? "";
  const [page, setPage] = useState(0);
  const [exceptionsOnly, setExceptionsOnly] = useState(false);

  const summaryQuery = useQuery({
    queryKey: ["admin", "refund-batch", eventId, batchId],
    queryFn: () => fetchRefundBatch(eventId, batchId),
    enabled: Boolean(eventId && batchId),
    refetchInterval: (query) => {
      const status = query.state.data?.status ?? result.summary.status;
      return refundBatchUnfinished(status) ? 4000 : false;
    },
  });

  const itemsQuery = useQuery({
    queryKey: ["admin", "refund-batch-items", eventId, batchId, page, exceptionsOnly],
    queryFn: () => fetchRefundBatchItems(eventId, batchId, page, 20, exceptionsOnly),
    enabled: Boolean(eventId && batchId),
  });

  const summary: AdminRefundSummary = summaryQuery.data ?? result.summary;
  const items = itemsQuery.data?.items ?? result.items;
  const total = summary.total ?? itemsQuery.data?.total ?? items.length;
  const succeeded = refundCount(summary.counts, "SUCCEEDED");
  const blocked = refundCount(summary.counts, "BLOCKED");
  const failed = refundCount(summary.counts, "FAILED");
  const review = refundCount(summary.counts, "NEEDS_REVIEW");
  const pending = refundCount(summary.counts, "PENDING") + refundCount(summary.counts, "RUNNING");
  const completed = (summary.status ?? "").toUpperCase() === "COMPLETED";
  const itemTotal = itemsQuery.data?.total ?? items.length;
  const itemPages = Math.max(1, Math.ceil(itemTotal / (itemsQuery.data?.size ?? 20)));

  return (
    <section className="admin-pay admin-refund-result" aria-label="환불 처리 결과">
      <div className="admin-refund-result__head">
        <h2 className="admin-drawer__section-title">환불 처리 결과</h2>
        <div className="admin-refund-result__actions">
          {onLookup ? (
            <button
              type="button"
              className="admin-btn admin-btn--text"
              disabled={lookingUp}
              onClick={onLookup}
            >
              {lookingUp ? (
                <>
                  <span className="admin-refund-result__spin" aria-hidden />
                  다시 조회 중…
                </>
              ) : (
                "다시 조회"
              )}
            </button>
          ) : null}
          <button type="button" className="admin-btn admin-btn--text" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
      <div className="admin-pay__body">
      <dl className="admin-pay__summary">
        <div>
          <dt>성공</dt>
          <dd>
            {succeeded}/{total}
          </dd>
        </div>
        <div>
          <dt>차단</dt>
          <dd>{blocked}</dd>
        </div>
        <div>
          <dt>실패</dt>
          <dd>{failed}</dd>
        </div>
        <div>
          <dt>확인 필요</dt>
          <dd>{review + pending}</dd>
        </div>
      </dl>
      <p className="admin-refund-result__batch">
        {refundBatchStatusLabel(summary.status)}
        {completed ? " · 배치가 끝났어도 실패·차단 항목이 있을 수 있습니다." : ""}
      </p>
      <label className="admin-refund-result__filter">
        <input
          type="checkbox"
          checked={exceptionsOnly}
          onChange={(event) => {
            setExceptionsOnly(event.target.checked);
            setPage(0);
          }}
        />
        차단·실패·확인 필요만
      </label>
      {result.resultsTruncated && !itemsQuery.data ? (
        <p className="admin-pay__hint">이 응답에 전체 항목이 들어 있지 않습니다.</p>
      ) : null}
      {itemsQuery.isError ? (
        <p className="admin-pay__hint">항목 조회에 실패해 요청 응답 항목을 표시합니다.</p>
      ) : null}
      <ItemList items={items} />
      {itemPages > 1 ? (
        <div className="admin-pay-list-drawer__pager">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={page <= 0}
            onClick={() => setPage((n) => Math.max(0, n - 1))}
          >
            이전
          </button>
          <span>
            {page + 1}/{itemPages}
          </span>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={page + 1 >= itemPages}
            onClick={() => setPage((n) => n + 1)}
          >
            다음
          </button>
        </div>
      ) : null}
      </div>
    </section>
  );
}
