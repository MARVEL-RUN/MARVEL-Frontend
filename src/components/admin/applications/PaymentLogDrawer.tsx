"use client";

import { isAdminHttp } from "@/lib/admin/fetch";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { formatAmount } from "@/services/admin/applications";
import { fetchPaymentLogs, paymentMethodLabel, type AdminPayment } from "@/services/admin/payments";
import { useQuery } from "@tanstack/react-query";

type Props = {
  eventId: string;
  payment: AdminPayment;
  onClose: () => void;
};

function dash(value?: string | number | null) {
  if (value == null || value === "") return "-";
  return String(value);
}

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "처리 로그가 없습니다.";
  return "처리 로그 조회에 실패했습니다.";
}

function PaymentLogList({ eventId, paymentId }: { eventId: string; paymentId: string }) {
  const logs = useQuery({
    queryKey: ["admin", "payment-logs", eventId, paymentId],
    queryFn: () => fetchPaymentLogs(eventId, paymentId),
    enabled: Boolean(eventId && paymentId),
  });

  if (logs.isLoading) return <p className="admin-pay__hint">불러오는 중…</p>;
  if (logs.isError) return <p className="admin-pay__hint">{errorHint(logs.error)}</p>;

  const rows = logs.data?.content ?? [];
  if (rows.length === 0) return <p className="admin-pay__hint">처리 로그가 없습니다.</p>;

  return (
    <table className="admin-pay-log-table">
      <thead>
        <tr>
          <th>일시</th>
          <th>처리</th>
          <th>출처</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((log, index) => (
          <tr key={`${log.createdAt ?? "log"}-${index}`}>
            <td>{formatAdminBoardDate(log.createdAt)}</td>
            <td>
              {dash(log.processType)}
              {log.errorCode || log.errorMessage ? (
                <em className="admin-pay-log-table__error">
                  {log.errorCode ? `${log.errorCode} ` : ""}
                  {log.errorMessage ?? ""}
                </em>
              ) : null}
            </td>
            <td>{dash(log.source)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PaymentLogDrawer({ eventId, payment, onClose }: Props) {
  const paymentId = payment.paymentId ?? "";
  const orderId = payment.orderId?.trim() || "-";

  if (!paymentId) return null;

  return (
    <aside className="admin-drawer admin-drawer--log" role="dialog" aria-label="처리 로그">
      <header className="admin-drawer__hero">
        <div className="admin-drawer__hero-bar">
          <span className="admin-drawer__hero-kind">처리 로그</span>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            닫기
          </button>
        </div>
        <h1 className="admin-drawer__hero-title admin-pay-log-drawer__order">{orderId}</h1>
        <div className="admin-drawer__hero-meta admin-pay-log-drawer__meta">
          {payment.amount != null ? <span>{formatAmount(payment.amount)}</span> : null}
          <span>{paymentMethodLabel(payment)}</span>
        </div>
      </header>
      <div className="admin-drawer__body admin-pay-log-drawer__body">
        <PaymentLogList eventId={eventId} paymentId={paymentId} />
      </div>
    </aside>
  );
}
