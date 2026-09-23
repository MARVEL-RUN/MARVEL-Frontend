"use client";

import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import {
  paymentCancelErrorText,
  paymentCancelPurposeLabel,
  paymentCancelStatusBadge,
  paymentCancelStatusLabel,
  paymentOrderStatusBadge,
  paymentOrderStatusLabel,
  paymentPurposeLabel,
} from "@/lib/payment-status";
import { statusKey } from "@/lib/registration-status";
import { formatAmount } from "@/services/admin/applications";
import { paymentMethodLabel, type AdminPayment } from "@/services/admin/payments";
import type { KeyboardEvent } from "react";

type Props = {
  payments: AdminPayment[];
  page: number;
  totalPages: number;
  totalCount?: number;
  highlightRegistrationId?: string;
  activeLogPaymentId: string | null;
  activeEvidenceCancelId: string | null;
  onOpenLog: (payment: AdminPayment | null) => void;
  onOpenEvidence: (paymentCancelId: string | null) => void;
  onPage: (page: number) => void;
};

function dash(value?: string | number | null) {
  if (value == null || value === "") return "-";
  return String(value);
}

function OrderStatusBadge({ value }: { value?: string }) {
  if (!value?.trim()) return null;
  return (
    <span className={`admin-badge admin-badge--${paymentOrderStatusBadge(value)}`}>
      {paymentOrderStatusLabel(value)}
    </span>
  );
}

function allocationNote(item: {
  excludedFromCurrentRoster?: boolean;
  registrationMissing?: boolean;
}) {
  const notes: string[] = [];
  if (item.excludedFromCurrentRoster) notes.push("명단 제외");
  if (item.registrationMissing) notes.push("확인 필요");
  return notes;
}

function PaymentListItem({
  payment,
  index,
  highlightRegistrationId,
  logOpen,
  activeEvidenceCancelId,
  onOpenLog,
  onOpenEvidence,
}: {
  payment: AdminPayment;
  index: number;
  highlightRegistrationId?: string;
  logOpen: boolean;
  activeEvidenceCancelId: string | null;
  onOpenLog: () => void;
  onOpenEvidence: (paymentCancelId: string | null) => void;
}) {
  const paymentId = payment.paymentId ?? "";
  const cancels = payment.cancels ?? [];
  const allocations = payment.allocations ?? [];
  const orderId = payment.orderId?.trim() || `주문 ${index + 1}`;
  const method = paymentMethodLabel(payment);
  const purpose = paymentPurposeLabel(payment.purpose);
  const evidenceOnThis = cancels.some(
    (item) => item.paymentCancelId && item.paymentCancelId === activeEvidenceCancelId,
  );
  const itemClass = `admin-pay-list__item${logOpen || evidenceOnThis ? " is-active" : ""}${paymentId ? " is-loggable" : ""}`;

  return (
    <article
      className={itemClass}
      {...(paymentId
        ? {
            role: "button" as const,
            tabIndex: 0,
            "aria-pressed": logOpen,
            "aria-label": `${orderId} 처리 로그 ${logOpen ? "닫기" : "보기"}`,
            onClick: onOpenLog,
            onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenLog();
              }
            },
          }
        : {})}
    >
      <header className="admin-pay-list__head">
        <span className="admin-pay-list__no">{String(index + 1).padStart(2, "0")}</span>
        <div className="admin-pay-list__lead">
          <div className="admin-pay-list__lead-top">
            <span className="admin-pay-list__amount">
              {payment.amount != null ? formatAmount(payment.amount) : "-"}
            </span>
            <span className="admin-pay-list__amount-hint">주문</span>
            <OrderStatusBadge value={payment.paymentStatus} />
          </div>
          <p className="admin-pay-list__order" title={orderId}>
            {orderId}
          </p>
          {purpose || payment.orderName?.trim() ? (
            <p className="admin-pay-list__meta">
              {[purpose, payment.orderName?.trim()].filter(Boolean).join(" · ")}
            </p>
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
        {payment.allocationMissing ? (
          <div className="admin-pay-list__row">
            <dt>귀속</dt>
            <dd>
              <span className="admin-pay-list__note">확인 필요</span>
            </dd>
          </div>
        ) : null}
        {allocations.map((item, i) => {
          const current = Boolean(
            highlightRegistrationId && item.registrationId === highlightRegistrationId,
          );
          const notes = allocationNote(item);
          return (
            <div
              className={`admin-pay-list__row${current ? " is-current" : ""}`}
              key={item.paymentAllocationId ?? `${item.registrationId}-${i}`}
            >
              <dt>{i === 0 ? "귀속" : ""}</dt>
              <dd>
                {dash(item.name)}
                {" · "}
                {item.allocatedAmount != null ? formatAmount(item.allocatedAmount) : "-"}
                {notes.map((note) => (
                  <span className="admin-pay-list__note" key={note}>
                    {note}
                  </span>
                ))}
              </dd>
            </div>
          );
        })}
        {cancels.map((item, i) => {
          const purposeLabel = paymentCancelPurposeLabel(item.purpose);
          const cancelId = item.paymentCancelId ?? "";
          const evidenceOpen = Boolean(cancelId && activeEvidenceCancelId === cancelId);
          const needsCheck = statusKey(item.status) === "UNKNOWN";
          return (
            <div
              className="admin-pay-list__row admin-pay-list__row--cancel"
              key={cancelId || `${item.createdAt}-${i}`}
            >
              <dt>{i === 0 ? "환불" : ""}</dt>
              <dd>
                <p className="admin-pay-list__cancel-text">
                  {item.cancelAmount != null ? formatAmount(item.cancelAmount) : "-"}
                  {purposeLabel ? ` · ${purposeLabel}` : null}
                  {item.cancelReason ? ` · ${item.cancelReason}` : null}
                </p>
                {item.errorCode || item.errorMessage ? (
                  <p className="admin-pay-list__note admin-pay-list__cancel-note">
                    {paymentCancelErrorText(item.errorCode, item.errorMessage)}
                  </p>
                ) : null}
                {item.status || cancelId ? (
                  <div className="admin-pay-list__cancel-actions">
                    {item.status ? (
                      <span
                        className={`admin-badge admin-badge--${paymentCancelStatusBadge(item.status)}`}
                      >
                        {paymentCancelStatusLabel(item.status)}
                      </span>
                    ) : null}
                    {cancelId ? (
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-pay-list__evidence-btn"
                        aria-pressed={evidenceOpen}
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenEvidence(evidenceOpen ? null : cancelId);
                        }}
                      >
                        {evidenceOpen ? "확인 닫기" : needsCheck ? "외부 확인" : "확인 이력"}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}

export function PaymentListDrawer({
  payments,
  page,
  totalPages,
  totalCount,
  highlightRegistrationId,
  activeLogPaymentId,
  activeEvidenceCancelId,
  onOpenLog,
  onOpenEvidence,
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
        {payments.length > 0 ? (
          <p className="admin-pay-list-drawer__hint">
            위 금액은 주문 전체액입니다. 항목을 누르면 처리 로그를 확인할 수 있습니다.
          </p>
        ) : null}
        <div className="admin-pay-list">
          {payments.map((payment, index) => {
            const id = payment.paymentId ?? `pay-${index}`;
            const displayIndex = payments.length - 1 - index;
            return (
              <PaymentListItem
                key={id}
                payment={payment}
                index={displayIndex}
                highlightRegistrationId={highlightRegistrationId}
                logOpen={Boolean(activeLogPaymentId && activeLogPaymentId === id)}
                activeEvidenceCancelId={activeEvidenceCancelId}
                onOpenLog={() => onOpenLog(activeLogPaymentId === id ? null : payment)}
                onOpenEvidence={onOpenEvidence}
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
