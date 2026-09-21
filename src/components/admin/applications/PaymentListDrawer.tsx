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

function PaymentStatusBadge({ value }: { value?: string }) {
  const key = statusKey(value);
  if (!key || (!isRegistrationStatus(key) && key !== "UNKNOWN")) return null;
  return (
    <span className={`admin-badge admin-badge--${registrationStatusBadge(value)}`}>
      {registrationStatusLabel(value)}
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
  const method = paymentMethodLabel(payment);
  const itemClass = `admin-pay-list__item${logOpen ? " is-active" : ""}`;
  const content = (
    <>
      <header className="admin-pay-list__head">
        <span className="admin-pay-list__no">{String(index + 1).padStart(2, "0")}</span>
        <div className="admin-pay-list__lead">
          <div className="admin-pay-list__lead-top">
            <span className="admin-pay-list__amount">
              {payment.amount != null ? formatAmount(payment.amount) : "-"}
            </span>
            <PaymentStatusBadge value={payment.paymentStatus} />
          </div>
          <p className="admin-pay-list__order" title={orderId}>
            {orderId}
          </p>
          {payment.orderName?.trim() ? (
            <p className="admin-pay-list__meta">{payment.orderName.trim()}</p>
          ) : null}
        </div>
        {paymentId ? (
          <span className="admin-pay-list__log-hint" aria-hidden>
            {logOpen ? "닫기" : "로그"}
          </span>
        ) : null}
      </header>
      <dl className="admin-pay-list__fields">
        {method !== "-" ? (
          <div className="admin-pay-list__row">
            <dt>결제방식</dt>
            <dd>{method}</dd>
          </div>
        ) : null}
        <div className="admin-pay-list__row">
          <dt>승인일시</dt>
          <dd>{formatAdminBoardDate(payment.approvedAt || payment.createdAt)}</dd>
        </div>
        {allocations.map((item, i) => (
          <div
            className="admin-pay-list__row"
            key={item.paymentAllocationId ?? `${item.registrationId}-${i}`}
          >
            <dt>{i === 0 ? "배분" : ""}</dt>
            <dd>
              {dash(item.name)}
              {" · "}
              {item.allocatedAmount != null ? formatAmount(item.allocatedAmount) : "-"}
              {item.excludedFromCurrentRoster ? (
                <span className="admin-pay-list__note">명단 제외</span>
              ) : null}
            </dd>
          </div>
        ))}
        {cancels.map((item, i) => (
          <div
            className="admin-pay-list__row admin-pay-list__row--cancel"
            key={item.paymentCancelId ?? `${item.createdAt}-${i}`}
          >
            <dt>{i === 0 ? "취소·환불" : ""}</dt>
            <dd>
              {item.cancelAmount != null ? formatAmount(item.cancelAmount) : "-"}
              {item.cancelReason ? (
                <>
                  {" · "}
                  {item.cancelReason}
                </>
              ) : null}
              {item.status ? (
                <span
                  className={`admin-badge admin-badge--${registrationStatusBadge(item.status)} admin-pay-list__inline-badge`}
                >
                  {registrationStatusLabel(item.status)}
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );

  if (paymentId) {
    return (
      <button
        type="button"
        className={itemClass}
        onClick={onOpenLog}
        aria-pressed={logOpen}
        aria-label={`${orderId} 처리 로그 ${logOpen ? "닫기" : "보기"}`}
      >
        {content}
      </button>
    );
  }

  return <article className={itemClass}>{content}</article>;
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
