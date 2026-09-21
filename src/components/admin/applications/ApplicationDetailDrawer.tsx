"use client";

import { paymentStatusFromUnknown } from "@/lib/registration-status";
import {
  applicationCourseLabel,
  applicationGenderLabel,
  applicationPaymentBadge,
  applicationPaymentLabel,
  applicationStatusBadge,
  applicationStatusLabel,
  formatAmount,
  type AdminApplicationRow,
} from "@/services/admin/applications";
import { fetchApplicationFinance } from "@/services/admin/payments";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ApplicationPayments } from "./ApplicationPayments";

type Props = {
  row: AdminApplicationRow | null;
  loading?: boolean;
  error?: string;
  onClose: () => void;
};

function dash(value?: string) {
  if (typeof value !== "string") return "-";
  return value.trim() ? value : "-";
}

export function ApplicationDetailDrawer({ row, loading, error, onClose }: Props) {
  const finance = useQuery({
    queryKey: ["admin", "finance", row?.eventId, row?.id, row?.kind, row?.organizationId, 0],
    queryFn: () => fetchApplicationFinance(row as AdminApplicationRow, 0),
    enabled: Boolean(row?.eventId && row?.id),
  });

  if (!row) return null;

  const paymentStatus =
    paymentStatusFromUnknown(finance.data?.paymentStatus) || row.paymentStatus;
  const paymentLabel = applicationPaymentLabel(paymentStatus);

  const fields: { label: string; value: ReactNode }[] = [
    { label: "성명", value: dash(row.personName) },
    { label: "단체명", value: dash(row.groupName) },
  ];

  if (row.leader) {
    fields.push(
      { label: "대표자", value: dash(row.leader.name) },
      { label: "대표자 연락처", value: dash(row.leader.phNum) },
      { label: "대표자 생년월일", value: dash(row.leader.birth) },
    );
  }

  const groupAddress = row.kind === "group" || Boolean(row.leader) || Boolean(row.organizationId);
  const address = row.leader?.address || row.address;
  const addressDetail = row.leader?.addressDetail || row.addressDetail;

  fields.push(
    { label: "코스", value: applicationCourseLabel(row) },
    { label: "기념품", value: dash(row.souvenir) },
    { label: "사이즈", value: dash(row.size) },
    { label: "성별", value: applicationGenderLabel(row.gender) },
    { label: "생년월일", value: dash(row.birth) },
    { label: "연락처", value: dash(row.phone) },
    { label: "이메일", value: dash(row.email) },
    { label: "보호자 연락처", value: dash(row.guardianPhone) },
    { label: "보호자 관계", value: dash(row.guardianRelation) },
    { label: "신청일시", value: dash(row.appliedAt) },
    { label: "금액", value: formatAmount(row.amount) },
    { label: "주문번호", value: dash(row.orderNo) },
    { label: "결제방식", value: dash(row.cardPaymentInfo) },
    {
      label: "신청 상태",
      value: (
        <span className={`admin-badge admin-badge--${applicationStatusBadge(row.status)}`}>
          {applicationStatusLabel(row.status)}
        </span>
      ),
    },
    {
      label: "결제 상태",
      value:
        paymentLabel === "—" ? (
          dash()
        ) : (
          <span className={`admin-badge admin-badge--${applicationPaymentBadge(paymentStatus)}`}>
            {paymentLabel}
          </span>
        ),
    },
    {
      label: groupAddress ? "단체장 주소 확인" : "주소",
      value: dash(address),
    },
    {
      label: groupAddress ? "단체장 상세주소 확인" : "상세주소",
      value: dash(addressDetail),
    },
  );

  return (
    <>
      <div
        className="admin-drawer__dim"
        role="presentation"
        aria-hidden="true"
        onClick={onClose}
      />
      <aside className="admin-drawer" role="dialog" aria-modal="true" aria-label="신청 상세">
        <div className="admin-drawer__head">
          <div className="admin-drawer__actions">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>

        {loading ? <p className="admin-empty">불러오는 중…</p> : null}
        {error ? <p className="admin-empty">{error}</p> : null}

        <div className="admin-drawer__body">
          <dl className="admin-drawer__fields">
            {fields.map((field) => (
              <div key={field.label} className="admin-drawer__row">
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
          <ApplicationPayments row={row} />
        </div>

        <div className="admin-drawer__foot">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            닫기
          </button>
        </div>
      </aside>
    </>
  );
}
