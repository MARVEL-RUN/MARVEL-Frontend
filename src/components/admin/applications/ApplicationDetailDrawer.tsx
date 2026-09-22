"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { useAdminPrompt } from "@/components/admin/InputModal";
import { adminToast } from "@/components/admin/Toast";
import {
  registrationStatusBadge,
  registrationStatusLabel,
} from "@/lib/registration-status";
import { APPLICATION_PASSWORD_MIN, formatPhone } from "@/lib/register";
import {
  applicationCourseLabel,
  applicationGenderLabel,
  applicationKindLabel,
  resetRegistrationPassword,
  type AdminApplicationRow,
} from "@/services/admin/applications";
import { fetchApplicationFinance, type AdminPayment } from "@/services/admin/payments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ApplicationBasicInfoEdit } from "./ApplicationBasicInfoEdit";
import { ApplicationPaySummary } from "./ApplicationPaySummary";
import { PaymentListDrawer } from "./PaymentListDrawer";
import { PaymentLogDrawer } from "./PaymentLogDrawer";

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

function displayPhone(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return "-";
  return formatPhone(raw.replace(/\D/g, "")) || raw;
}

function agreeLabel(value?: boolean) {
  if (value === true) return "동의함";
  if (value === false) return "미동의";
  return "-";
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

function DetailSection({
  title,
  fields,
  keepEmpty,
}: {
  title: string;
  fields: DetailField[];
  keepEmpty?: boolean;
}) {
  const items = keepEmpty ? fields : visibleFields(fields);
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
    { label: "연락처", value: displayPhone(row.phone) },
    ...(isGroup ? [] : [{ label: "이메일", value: dash(row.email) }]),
  ];

  const guardianFields: DetailField[] = isGroup
    ? row.guardianConsent === true
      ? [{ label: "동의", value: "동의함" }]
      : []
    : [
        { label: "이름", value: dash(row.guardianName) },
        { label: "관계", value: dash(row.guardianRelation) },
        { label: "연락처", value: dash(row.guardianPhone) },
        {
          label: "동의",
          value:
            row.guardianConsent === true
              ? "동의함"
              : row.guardianConsent === false
                ? "미동의"
                : "-",
        },
      ];

  const groupFields: DetailField[] = [
    { label: "단체명", value: dash(row.groupName) },
  ];

  if (row.leader) {
    groupFields.push(
      { label: "대표자", value: dash(row.leader.name) },
      { label: "연락처", value: displayPhone(row.leader.phNum) },
      { label: "생년월일", value: dash(row.leader.birth) },
    );
  } else if (row.leaderName) {
    groupFields.push({ label: "대표자", value: dash(row.leaderName) });
  }

  if (isGroup) {
    groupFields.push({ label: "이메일", value: dash(row.email) });
  }

  const addressFields: DetailField[] = [
    { label: "주소", value: dash(address) },
    { label: "상세주소", value: dash(addressDetail) },
  ];

  const termsFields: DetailField[] = [
    { label: "필수 약관", value: agreeLabel(row.termsEssentialAgreed) },
    { label: "마케팅", value: agreeLabel(row.termsMarketingAgreed) },
    {
      label: "전송매체 마케팅",
      value: agreeLabel(row.termsMarketingChannelAgreed),
    },
  ];

  return {
    applyFields,
    personFields,
    guardianFields,
    groupFields: isGroup ? groupFields : [],
    addressFields,
    termsFields,
  };
}

export function ApplicationDetailDrawer({ row, loading, error, onClose }: Props) {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [logPayment, setLogPayment] = useState<AdminPayment | null>(null);
  const { confirm, modal: confirmModal } = useAdminConfirm();
  const { prompt, modal: inputModal } = useAdminPrompt();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLogPayment(null);
    setPage(0);
    setEditing(false);
    setEditError("");
  }, [row?.id]);

  useEffect(() => {
    setLogPayment(null);
  }, [page]);

  useEffect(() => {
    if (!row) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (logPayment) {
        setLogPayment(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [logPayment, onClose, row]);

  const finance = useQuery({
    queryKey: ["admin", "finance", row?.eventId, row?.id, row?.kind, row?.organizationId, page],
    queryFn: () => fetchApplicationFinance(row!, page),
    enabled: Boolean(row?.eventId && row?.id),
  });

  const resetPassword = useMutation({
    mutationFn: (password: string) =>
      resetRegistrationPassword(row!.id, password),
    onSuccess: () => adminToast.success("비밀번호가 초기화되었습니다."),
    onError: (err) =>
      adminToast.error(
        err instanceof Error ? err.message : "비밀번호 초기화에 실패했습니다.",
      ),
  });

  const handleResetPassword = async () => {
    if (!row || row.kind === "group") return;
    const label =
      row.personName?.trim() || row.name?.trim() || "해당 신청자";
    const ok = await confirm({
      title: "비밀번호 초기화",
      message: `${label} 계정의 비밀번호를 초기화하시겠습니까?`,
    });
    if (!ok) return;
    const password = await prompt({
      title: "비밀번호 초기화",
      description: `신청조회용 새 비밀번호를 입력해 주세요. (${APPLICATION_PASSWORD_MIN}자 이상)`,
      label: "새 비밀번호",
      placeholder: `${APPLICATION_PASSWORD_MIN}자 이상 입력`,
      type: "password",
      minLength: APPLICATION_PASSWORD_MIN,
    });
    if (!password) return;
    resetPassword.mutate(password);
  };

  const handleBasicInfoSaved = async () => {
    if (!row) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "registration", row.id] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "registrations"] }),
    ]);
    adminToast.success("기본정보가 수정되었습니다.");
    setEditing(false);
    setEditError("");
  };

  if (!row || !mounted) return null;

  const isGroup = row.kind === "group";
  const title = row.name?.trim() || row.personName?.trim() || row.groupName?.trim() || "-";
  const sections = buildSections(row);
  const payments = finance.data?.payments?.content ?? [];
  const totalPages = Math.max(1, finance.data?.payments?.totalPages ?? 1);
  const totalCount = finance.data?.payments?.totalElements;
  const showPayments = !finance.isLoading && !finance.isError && payments.length > 0;
  const showLog = Boolean(logPayment);

  return createPortal(
    <div
      className="admin-drawer-stack"
      data-pay-open={showPayments ? "" : undefined}
      data-log-open={showLog ? "" : undefined}
    >
      <div
        className="admin-drawer__dim"
        role="presentation"
        aria-hidden="true"
        onClick={onClose}
      />
      {showLog && logPayment ? (
        <PaymentLogDrawer
          eventId={row.eventId}
          payment={logPayment}
          onClose={() => setLogPayment(null)}
        />
      ) : null}
      {showPayments ? (
        <PaymentListDrawer
          payments={payments}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          activeLogPaymentId={logPayment?.paymentId ?? null}
          onOpenLog={setLogPayment}
          onPage={setPage}
        />
      ) : null}
      <aside
        className={`admin-drawer admin-drawer--detail${editing ? " is-editing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="신청 상세"
      >
        <header className="admin-drawer__hero">
          <div className="admin-drawer__hero-bar">
            <div className="admin-drawer__hero-bar-start">
              <span className="admin-drawer__hero-kind">{applicationKindLabel(row.kind)}</span>
              {editing ? (
                <span className="admin-drawer__edit-badge">기본정보 수정</span>
              ) : null}
            </div>
            <div className="admin-drawer__actions">
              {!editing ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  disabled={loading || Boolean(error)}
                  onClick={() => {
                    setEditError("");
                    setEditing(true);
                  }}
                >
                  기본정보 수정
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => {
                    setEditing(false);
                    setEditError("");
                  }}
                >
                  수정 취소
                </button>
              )}
              {!isGroup && !editing ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  disabled={resetPassword.isPending || loading || Boolean(error)}
                  onClick={handleResetPassword}
                >
                  비밀번호 초기화
                </button>
              ) : null}
              <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
                닫기
              </button>
            </div>
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
          {editError ? <p className="admin-drawer__edit-alert">{editError}</p> : null}

          {!loading && !error && editing ? (
            <ApplicationBasicInfoEdit
              row={row}
              onCancel={() => {
                setEditing(false);
                setEditError("");
              }}
              onSaved={() => void handleBasicInfoSaved()}
              onError={setEditError}
            />
          ) : null}

          {!loading && !error && !editing ? (
            <>
              <DetailSection title="신청 정보" fields={sections.applyFields} />
              {isGroup ? (
                <DetailSection title="단체" fields={sections.groupFields} />
              ) : null}
              <DetailSection
                title={isGroup ? "참가자" : "신청자"}
                fields={sections.personFields}
              />
              <DetailSection
                title="보호자"
                fields={sections.guardianFields}
                keepEmpty={!isGroup}
              />
              <DetailSection title="주소" fields={sections.addressFields} />
              <DetailSection
                title="약관 동의"
                fields={sections.termsFields}
                keepEmpty
              />
            </>
          ) : null}
          {!editing ? (
            <ApplicationPaySummary
              data={finance.data}
              loading={finance.isLoading}
              error={finance.isError ? finance.error : undefined}
              paymentCount={totalCount ?? payments.length}
            />
          ) : null}
        </div>
      </aside>
      {confirmModal}
      {inputModal}
    </div>,
    document.body,
  );
}
