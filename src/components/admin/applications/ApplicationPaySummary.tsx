"use client";

import { isAdminHttp } from "@/lib/admin/fetch";
import { paymentOrderStatusLabel } from "@/lib/payment-status";
import { registrationStatusLabel } from "@/lib/registration-status";
import { formatAmount } from "@/services/admin/applications";
import type { AdminFinance } from "@/services/admin/payments";

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "결제 내역이 없습니다.";
  return "결제 조회에 실패했습니다.";
}

type Props = {
  data?: AdminFinance;
  loading?: boolean;
  error?: unknown;
  paymentCount?: number;
};

export function ApplicationPaySummary({ data, loading, error, paymentCount = 0 }: Props) {
  return (
    <section className="admin-pay" aria-label="결제·환불 요약">
      <h2 className="admin-drawer__section-title">결제·환불</h2>
      <div className="admin-pay__body">
        {loading ? (
          <p className="admin-pay__hint">불러오는 중…</p>
        ) : error ? (
          <p className="admin-pay__hint">{errorHint(error)}</p>
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
              {data?.registrationStatus ? (
                <div>
                  <dt>신청상태</dt>
                  <dd>{registrationStatusLabel(data.registrationStatus)}</dd>
                </div>
              ) : null}
              {data?.paymentStatus ? (
                <div>
                  <dt>주문상태</dt>
                  <dd>{paymentOrderStatusLabel(data.paymentStatus)}</dd>
                </div>
              ) : null}
              {paymentCount > 0 ? (
                <div>
                  <dt>주문 건수</dt>
                  <dd>{paymentCount}건</dd>
                </div>
              ) : null}
            </dl>
            {paymentCount === 0 ? <p className="admin-pay__hint">결제 내역이 없습니다.</p> : null}
          </>
        )}
      </div>
    </section>
  );
}
