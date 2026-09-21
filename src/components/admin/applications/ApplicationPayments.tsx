"use client";

import { isAdminHttp } from "@/lib/admin/fetch";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { paymentStatusBadge, paymentStatusLabel } from "@/lib/registration-status";
import { formatAmount, type AdminApplicationRow } from "@/services/admin/applications";
import {
  fetchPaymentLogs,
  fetchApplicationFinance,
  paymentMethodLabel,
  type AdminFinance,
  type AdminPayment,
} from "@/services/admin/payments";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function dash(value?: string | number) {
  if (value == null || value === "") return "-";
  return String(value);
}

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "결제 내역이 없습니다.";
  return "결제 조회에 실패했습니다.";
}

function PaymentStatus({ value }: { value?: string }) {
  const status = value?.trim() ?? "";
  if (!status) return <>-</>;
  return (
    <span className={`admin-badge admin-badge--${paymentStatusBadge(status)}`}>
      {paymentStatusLabel(status)}
    </span>
  );
}

function PaymentLogs({
  eventId,
  paymentId,
}: {
  eventId: string;
  paymentId: string;
}) {
  const logs = useQuery({
    queryKey: ["admin", "payment-logs", eventId, paymentId],
    queryFn: () => fetchPaymentLogs(eventId, paymentId),
    enabled: Boolean(eventId && paymentId),
  });

  if (logs.isLoading) return <p className="admin-pay__hint">로그 불러오는 중…</p>;
  if (logs.isError) return <p className="admin-pay__hint">{errorHint(logs.error)}</p>;

  const rows = logs.data?.content ?? [];
  if (rows.length === 0) return <p className="admin-pay__hint">처리 로그가 없습니다.</p>;

  return (
    <ul className="admin-pay__logs">
      {rows.map((log, index) => (
        <li key={`${log.createdAt ?? "log"}-${index}`}>
          <strong>{formatAdminBoardDate(log.createdAt)}</strong>
          <span>{dash(log.processType)}</span>
          <span>{dash(log.source)}</span>
          {log.errorCode || log.errorMessage ? (
            <em>
              {log.errorCode ? `${log.errorCode} ` : ""}
              {log.errorMessage ?? ""}
            </em>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function PaymentCard({
  eventId,
  payment,
  open,
  onToggle,
}: {
  eventId: string;
  payment: AdminPayment;
  open: boolean;
  onToggle: () => void;
}) {
  const paymentId = payment.paymentId ?? "";
  const cancels = payment.cancels ?? [];
  const allocations = payment.allocations ?? [];

  return (
    <article className="admin-pay__card">
      <header className="admin-pay__card-head">
        <div>
          <p className="admin-pay__order">{dash(payment.orderId)}</p>
          <p className="admin-pay__meta">{dash(payment.orderName)}</p>
        </div>
        <PaymentStatus value={payment.paymentStatus} />
      </header>
      <dl className="admin-pay__facts">
        <div>
          <dt>금액</dt>
          <dd>{payment.amount != null ? formatAmount(payment.amount) : "-"}</dd>
        </div>
        <div>
          <dt>결제방식</dt>
          <dd>{paymentMethodLabel(payment)}</dd>
        </div>
        <div>
          <dt>승인일시</dt>
          <dd>{formatAdminBoardDate(payment.approvedAt || payment.createdAt)}</dd>
        </div>
      </dl>
      {allocations.length > 0 ? (
        <ul className="admin-pay__alloc">
          {allocations.map((item, index) => (
            <li key={item.paymentAllocationId ?? `${item.registrationId}-${index}`}>
              {dash(item.name)} ·{" "}
              {item.allocatedAmount != null ? formatAmount(item.allocatedAmount) : "-"}
              {item.excludedFromCurrentRoster ? " · 명단 제외" : ""}
            </li>
          ))}
        </ul>
      ) : null}
      {cancels.length > 0 ? (
        <ul className="admin-pay__cancels">
          {cancels.map((item, index) => (
            <li key={item.paymentCancelId ?? `${item.createdAt}-${index}`}>
              취소 {item.cancelAmount != null ? formatAmount(item.cancelAmount) : "-"}
              {item.cancelReason ? ` · ${item.cancelReason}` : ""}
              {item.status ? ` · ${item.status}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      {paymentId ? (
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onToggle}>
          {open ? "처리 로그 닫기" : "처리 로그"}
        </button>
      ) : null}
      {open && paymentId ? <PaymentLogs eventId={eventId} paymentId={paymentId} /> : null}
    </article>
  );
}

export function ApplicationPayments({ row }: { row: AdminApplicationRow }) {
  const [page, setPage] = useState(0);
  const [openPaymentId, setOpenPaymentId] = useState<string | null>(null);

  useEffect(() => {
    setOpenPaymentId(null);
  }, [page, row.id]);

  const finance = useQuery({
    queryKey: ["admin", "finance", row.eventId, row.id, row.kind, row.organizationId, page],
    queryFn: () => fetchApplicationFinance(row, page),
    enabled: Boolean(row.eventId && row.id),
  });

  const data: AdminFinance | undefined = finance.data;
  const payments = data?.payments?.content ?? [];
  const totalPages = Math.max(1, data?.payments?.totalPages ?? 1);

  return (
    <section className="admin-pay" aria-label="결제·환불 내역">
      <h2>결제·환불</h2>
      {finance.isLoading ? (
        <p className="admin-pay__hint">불러오는 중…</p>
      ) : finance.isError ? (
        <p className="admin-pay__hint">{errorHint(finance.error)}</p>
      ) : (
        <>
          <dl className="admin-pay__summary">
            {data?.leader?.name ? (
              <div>
                <dt>대표자</dt>
                <dd>{data.leader.name}</dd>
              </div>
            ) : null}
            <div>
              <dt>계약금액</dt>
              <dd>
                {data?.contractAmount != null ? formatAmount(data.contractAmount) : "-"}
              </dd>
            </div>
            <div>
              <dt>결제 상태</dt>
              <dd>
                <PaymentStatus value={data?.paymentStatus} />
              </dd>
            </div>
          </dl>
          {payments.length === 0 ? (
            <p className="admin-pay__hint">결제 내역이 없습니다.</p>
          ) : (
            payments.map((payment, index) => {
              const id = payment.paymentId ?? `pay-${index}`;
              return (
                <PaymentCard
                  key={id}
                  eventId={row.eventId}
                  payment={payment}
                  open={openPaymentId === id}
                  onToggle={() =>
                    setOpenPaymentId((prev) => (prev === id ? null : id))
                  }
                />
              );
            })
          )}
          {totalPages > 1 ? (
            <div className="admin-pay__pager">
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                이전
              </button>
              <span>
                {page + 1}/{totalPages}
              </span>
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
