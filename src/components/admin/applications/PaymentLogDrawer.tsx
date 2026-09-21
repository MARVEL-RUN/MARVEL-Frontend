"use client";

import { isAdminHttp } from "@/lib/admin/fetch";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { paymentLogProcessLabel, paymentLogSourceLabel } from "@/lib/payment-log";
import {
  paymentStatusBadge,
  paymentStatusDisplay,
  paymentStatusFromUnknown,
} from "@/lib/registration-status";
import { formatAmount } from "@/services/admin/applications";
import { fetchPaymentLogs, paymentMethodLabel, type AdminPayment } from "@/services/admin/payments";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  eventId: string;
  payment: AdminPayment;
  onClose: () => void;
};

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "처리 로그가 없습니다.";
  return "처리 로그 조회에 실패했습니다.";
}

function PaymentStatus({ value }: { value?: string }) {
  const key = paymentStatusFromUnknown(value);
  const label = paymentStatusDisplay(value);
  if (!key) return <>{label}</>;
  return (
    <span className={`admin-badge admin-badge--${paymentStatusBadge(value)}`}>
      {label}
    </span>
  );
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
              {paymentLogProcessLabel(log.processType)}
              {log.errorCode || log.errorMessage ? (
                <em className="admin-pay-log-table__error">
                  {log.errorCode ? `${log.errorCode} ` : ""}
                  {log.errorMessage ?? ""}
                </em>
              ) : null}
            </td>
            <td>{paymentLogSourceLabel(log.source)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PaymentLogDrawer({ eventId, payment, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const paymentId = payment.paymentId ?? "";
  const orderId = payment.orderId?.trim() || "-";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted || !paymentId) return null;

  return createPortal(
    <aside
      className="admin-drawer admin-drawer--log"
      role="dialog"
      aria-modal="true"
      aria-label="처리 로그"
    >
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
          <PaymentStatus value={payment.paymentStatus} />
        </div>
      </header>
      <div className="admin-drawer__body admin-pay-log-drawer__body">
        <PaymentLogList eventId={eventId} paymentId={paymentId} />
      </div>
    </aside>,
    document.body,
  );
}
