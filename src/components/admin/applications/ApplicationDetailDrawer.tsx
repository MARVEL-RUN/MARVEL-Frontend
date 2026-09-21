"use client";

import {
  applicationCourseLabel,
  applicationGenderLabel,
  applicationPayBadge,
  applicationPayLabel,
  formatAmount,
  type AdminApplicationRow,
} from "@/services/admin/applications";
import type { ReactNode } from "react";

type Props = {
  row: AdminApplicationRow | null;
  loading?: boolean;
  onClose: () => void;
};

function dash(value?: string) {
  return value?.trim() ? value : "-";
}

export function ApplicationDetailDrawer({ row, loading, onClose }: Props) {
  if (!row) return null;

  const fields: { label: string; value: ReactNode }[] = [
    { label: "성명", value: dash(row.personName) },
    { label: "단체명", value: dash(row.groupName) },
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
      label: "결제여부",
      value: (
        <span className={`admin-badge admin-badge--${applicationPayBadge(row.status)}`}>
          {applicationPayLabel(row.status)}
        </span>
      ),
    },
    { label: "주소", value: dash(row.address) },
    { label: "상세주소", value: dash(row.addressDetail) },
  ];

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

        <dl className="admin-drawer__fields">
          {fields.map((field) => (
            <div key={field.label} className="admin-drawer__row">
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>

        <div className="admin-drawer__foot">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            닫기
          </button>
        </div>
      </aside>
    </>
  );
}
