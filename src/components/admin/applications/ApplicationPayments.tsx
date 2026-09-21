"use client";

import { isAdminHttp } from "@/lib/admin/fetch";
import {
  isRegistrationStatus,
  registrationStatusBadge,
  registrationStatusLabel,
  statusKey,
} from "@/lib/registration-status";
import { formatAmount, type AdminApplicationRow } from "@/services/admin/applications";
import {
  fetchApplicationFinance,
  type AdminFinance,
  type AdminPayment,
} from "@/services/admin/payments";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PaymentListDrawer } from "./PaymentListDrawer";
import { PaymentLogDrawer } from "./PaymentLogDrawer";

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "결제 내역이 없습니다.";
  return "결제 조회에 실패했습니다.";
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

export function ApplicationPayments({ row }: { row: AdminApplicationRow }) {
  const [page, setPage] = useState(0);
  const [logPayment, setLogPayment] = useState<AdminPayment | null>(null);

  useEffect(() => {
    setLogPayment(null);
    setPage(0);
  }, [row.id]);

  useEffect(() => {
    setLogPayment(null);
  }, [page]);

  const finance = useQuery({
    queryKey: ["admin", "finance", row.eventId, row.id, row.kind, row.organizationId, page],
    queryFn: () => fetchApplicationFinance(row, page),
    enabled: Boolean(row.eventId && row.id),
  });

  const data: AdminFinance | undefined = finance.data;
  const payments = data?.payments?.content ?? [];
  const totalPages = Math.max(1, data?.payments?.totalPages ?? 1);
  const totalCount = data?.payments?.totalElements;
  const registrationStatus = data?.registrationStatus || row.status;
  const logPaymentId = logPayment?.paymentId ?? "";
  const showPaymentList = !finance.isLoading && !finance.isError && payments.length > 0;

  return (
    <>
      <section className="admin-pay" aria-label="결제·환불 요약">
        <h2 className="admin-drawer__section-title">결제·환불</h2>
        <div className="admin-pay__body">
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
                  <dt>신청상태</dt>
                  <dd>
                    <RegistrationStatus value={registrationStatus} />
                  </dd>
                </div>
              </dl>
              {payments.length === 0 ? (
                <p className="admin-pay__hint">결제 내역이 없습니다.</p>
              ) : (
                <p className="admin-pay__hint admin-pay__hint--panel">
                  결제 {totalCount ?? payments.length}건 · 왼쪽 패널에서 내역을 확인하세요.
                </p>
              )}
            </>
          )}
        </div>
      </section>
      {showPaymentList ? (
        <PaymentListDrawer
          payments={payments}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          activeLogPaymentId={logPaymentId || null}
          onOpenLog={setLogPayment}
          onPage={setPage}
        />
      ) : null}
      {logPayment ? (
        <PaymentLogDrawer
          eventId={row.eventId}
          payment={logPayment}
          onClose={() => setLogPayment(null)}
        />
      ) : null}
    </>
  );
}
