"use client";

import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import {
  isRegistrationStatus,
  registrationStatusBadge,
  registrationStatusLabel,
  statusKey,
} from "@/lib/registration-status";
import { formatAmount } from "@/services/admin/applications";
import { paymentMethodLabel, type AdminPayment } from "@/services/admin/payments";

type Props = {
  payments: AdminPayment[];
  page: number;
  totalPages: number;
  totalCount?: number;
  activeLogPaymentId: string | null;
  onOpenLog: (payment: AdminPayment | null) => void;
  onPage: (page: number) => void;
};

function dash(value?: string | number | null) {
  if (value == null || value === "") return "-";
  return String(value);
}

function RegistrationStatus({ value }: { value?: string }) {
  const key = statusKey(value);
  const label = registrationStatusLabel(value);
  if (!isRegistrationStatus(key) && key !== "UNKNOWN") return <>{label}</>;
  return (
    <span className={`admin-badge admin-badge--${registrationStatusBadge(value)}`}>
      {label}
    </span>
  );
}

function PaymentListItem({
  payment,
  index,
  logOpen,
  onOpenLog,
}: {
  payment: AdminPayment;
  index: number;
  logOpen: boolean;
  onOpenLog: () => void;
}) {
  const paymentId = payment.paymentId ?? "";
  const cancels = payment.cancels ?? [];
  const allocations = payment.allocations ?? [];
  const orderId = payment.orderId?.trim() || `결제 ${index + 1}`;

  return (
    <article className={`admin-pay-list__item${logOpen ? " is-active" : ""}`}>
      <div className="admin-pay-list__card">
        <header className="admin-pay-list__head">
          <div className="admin-pay-list__id">
            <span className="admin-pay-list__no">{String(index + 1).padStart(2, "0")}</span>
            <div className="admin-pay-list__id-text">
              <p className="admin-pay-list__order" title={orderId}>
                {orderId}
              </p>
              {payment.orderName?.trim() ? (
                <p className="admin-pay-list__meta">{payment.orderName.trim()}</p>
              ) : null}
            </div>
          </div>
          <RegistrationStatus value={payment.paymentStatus} />
        </header>
        <dl className="admin-pay-list__facts">
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
          <ul className="admin-pay-list__sub">
            {allocations.map((item, i) => (
              <li key={item.paymentAllocationId ?? `${item.registrationId}-${i}`}>
                {dash(item.name)} ·{" "}
                {item.allocatedAmount != null ? formatAmount(item.allocatedAmount) : "-"}
                {item.excludedFromCurrentRoster ? " · 명단 제외" : ""}
              </li>
            ))}
          </ul>
        ) : null}
        {cancels.length > 0 ? (
          <ul className="admin-pay-list__sub admin-pay-list__sub--cancel">
            {cancels.map((item, i) => (
              <li key={item.paymentCancelId ?? `${item.createdAt}-${i}`}>
                취소 {item.cancelAmount != null ? formatAmount(item.cancelAmount) : "-"}
                {item.cancelReason ? ` · ${item.cancelReason}` : ""}
                {item.status ? ` · ${registrationStatusLabel(item.status)}` : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {paymentId ? (
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-pay-list__log-btn"
          onClick={onOpenLog}
          aria-pressed={logOpen}
        >
          {logOpen ? "처리 로그 닫기" : "처리 로그 보기"}
        </button>
      ) : null}
    </article>
  );
}

export function PaymentListDrawer({
  payments,
  page,
  totalPages,
  totalCount,
  activeLogPaymentId,
  onOpenLog,
  onPage,
}: Props) {
  const count = totalCount ?? payments.length;

  return (
    <aside className="admin-drawer admin-drawer--payments" aria-label="결제·환불 내역">
      <header className="admin-drawer__hero">
        <div className="admin-drawer__hero-bar">
          <span className="admin-drawer__hero-kind">결제·환불 내역</span>
          <span className="admin-pay-list-drawer__count">총 {count}건</span>
        </div>
      </header>
      <div className="admin-drawer__body admin-pay-list-drawer__body">
        <div className="admin-pay-list">
          {payments.map((payment, index) => {
            const id = payment.paymentId ?? `pay-${index}`;
            return (
              <PaymentListItem
                key={id}
                payment={payment}
                index={index}
                logOpen={Boolean(activeLogPaymentId && activeLogPaymentId === id)}
                onOpenLog={() =>
                  onOpenLog(activeLogPaymentId === id ? null : payment)
                }
              />
            );
          })}
        </div>
        {totalPages > 1 ? (
          <div className="admin-pay-list-drawer__pager">
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              disabled={page <= 0}
              onClick={() => onPage(Math.max(0, page - 1))}
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
              onClick={() => onPage(page + 1)}
            >
              다음
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
