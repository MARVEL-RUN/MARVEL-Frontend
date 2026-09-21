"use client";

import {
  registrationStatusBadge,
  registrationStatusLabel,
} from "@/lib/registration-status";
import {
  applicationCourseLabel,
  applicationGenderLabel,
  applicationKindLabel,
  type AdminApplicationRow,
} from "@/services/admin/applications";
import type { ReactNode } from "react";
import { ApplicationPayments } from "./ApplicationPayments";

type Props = {
  row: AdminApplicationRow | null;
  loading?: boolean;
  error?: string;
  onClose: () => void;
};

type DetailField = {
  label: string;
  value: ReactNode;
};

function dash(value?: string | number | null) {
  if (value == null || value === "") return "-";
  const text = String(value).trim();
  return text || "-";
}

function isEmptyValue(value: ReactNode) {
  if (value == null) return true;
  if (typeof value === "string") {
    const text = value.trim();
    return !text || text === "-";
  }
  return false;
}

function visibleFields(fields: DetailField[]) {
  return fields.filter((field) => !isEmptyValue(field.value));
}

function DetailSection({ title, fields }: { title: string; fields: DetailField[] }) {
  const items = visibleFields(fields);
  if (items.length === 0) return null;

  return (
    <section className="admin-drawer__section">
      <h2 className="admin-drawer__section-title">{title}</h2>
      <dl className="admin-drawer__fields">
        {items.map((field) => (
          <div key={field.label} className="admin-drawer__row">
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function StatusLabel({ status }: { status: string }) {
  const tone = registrationStatusBadge(status);
  return (
    <span className="admin-drawer__status">
      <span
        className={`admin-apps-list__status-dot admin-apps-list__status-dot--${tone}`}
        aria-hidden
      />
      {registrationStatusLabel(status)}
    </span>
  );
}

function buildSections(row: AdminApplicationRow) {
  const isGroup = row.kind === "group";
  const address = row.leader?.address || row.address;
  const addressDetail = row.leader?.addressDetail || row.addressDetail;

  const applyFields: DetailField[] = [
    { label: "코스", value: applicationCourseLabel(row) },
    { label: "기념품", value: dash(row.souvenir) },
    { label: "사이즈", value: dash(row.size) },
  ];

  if (isGroup && row.memberCount != null && row.memberCount > 0) {
    applyFields.push({ label: "인원", value: `${row.memberCount}명` });
  }

  const personFields: DetailField[] = [
    { label: "성명", value: dash(row.personName) },
    { label: "성별", value: applicationGenderLabel(row.gender) },
    { label: "생년월일", value: dash(row.birth) },
    { label: "연락처", value: dash(row.phone) },
    { label: "이메일", value: dash(row.email) },
  ];

  const guardianFields: DetailField[] = [
    { label: "연락처", value: dash(row.guardianPhone) },
    { label: "관계", value: dash(row.guardianRelation) },
  ];

  const groupFields: DetailField[] = [
    { label: "단체명", value: dash(row.groupName) },
  ];

  if (row.leader) {
    groupFields.push(
      { label: "대표자", value: dash(row.leader.name) },
      { label: "연락처", value: dash(row.leader.phNum) },
      { label: "생년월일", value: dash(row.leader.birth) },
    );
  } else if (row.leaderName) {
    groupFields.push({ label: "대표자", value: dash(row.leaderName) });
  }

  const addressFields: DetailField[] = [
    { label: "주소", value: dash(address) },
    { label: "상세주소", value: dash(addressDetail) },
  ];

  return {
    applyFields,
    personFields,
    guardianFields,
    groupFields: isGroup ? groupFields : [],
    addressFields,
  };
}

export function ApplicationDetailDrawer({ row, loading, error, onClose }: Props) {
  if (!row) return null;

  const isGroup = row.kind === "group";
  const title = row.name?.trim() || row.personName?.trim() || row.groupName?.trim() || "-";
  const sections = buildSections(row);

  return (
    <>
      <div
        className="admin-drawer__dim"
        role="presentation"
        aria-hidden="true"
        onClick={onClose}
      />
      <aside className="admin-drawer" role="dialog" aria-modal="true" aria-label="신청 상세">
        <header className="admin-drawer__hero">
          <div className="admin-drawer__hero-bar">
            <span className="admin-drawer__hero-kind">{applicationKindLabel(row.kind)}</span>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
              닫기
            </button>
          </div>
          <h1 className="admin-drawer__hero-title">{title}</h1>
          <div className="admin-drawer__hero-meta">
            {row.orderNo?.trim() ? (
              <span className="admin-drawer__hero-order">주문 {row.orderNo.trim()}</span>
            ) : null}
            {row.appliedAt?.trim() ? (
              <span className="admin-drawer__hero-date">{row.appliedAt.trim()}</span>
            ) : null}
          </div>
          <div className="admin-drawer__hero-status">
            <span className="admin-drawer__hero-kind">신청상태</span>
            <StatusLabel status={row.status} />
          </div>
        </header>

        <div className="admin-drawer__body">
          {loading ? <p className="admin-empty">불러오는 중…</p> : null}
          {error ? <p className="admin-empty">{error}</p> : null}

          {!loading && !error ? (
            <>
              <DetailSection title="신청 정보" fields={sections.applyFields} />
              {isGroup ? (
                <DetailSection title="단체" fields={sections.groupFields} />
              ) : null}
              <DetailSection
                title={isGroup ? "참가자" : "신청자"}
                fields={sections.personFields}
              />
              <DetailSection title="보호자" fields={sections.guardianFields} />
              <DetailSection title="주소" fields={sections.addressFields} />
              <ApplicationPayments row={row} />
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
}
