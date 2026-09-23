"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { useAdminPrompt } from "@/components/admin/InputModal";
import { adminToast } from "@/components/admin/Toast";
import { hasAdminRefundBatch } from "@/lib/admin/config";
import { isAdminHttp } from "@/lib/admin/fetch";
import {
  canDeleteUnpaidRegistration,
  closedRegistration,
  registrationStatusBadge,
  registrationStatusLabel,
  statusKey,
} from "@/lib/registration-status";
import {
  adminMembersHref,
  adminOrganizationDetailHref,
} from "@/lib/admin/eventLinks";
import { APPLICATION_PASSWORD_MIN, formatPhone } from "@/lib/register";
import {
  applicationCourseLabel,
  applicationGenderLabel,
  applicationKindLabel,
  deleteAdminRegistration,
  resetRegistrationPassword,
  type AdminApplicationRow,
} from "@/services/admin/applications";
import { refundBatchToast, refundBatchUnfinished } from "@/lib/refund-result";
import { fetchApplicationFinance, type AdminPayment } from "@/services/admin/payments";
import {
  fetchRefundResult,
  newRefundRequestId,
  postFullRefund,
  REFUND_REASON_MAX,
  type AdminFullRefundBody,
  type AdminRefundBatchResponse,
} from "@/services/admin/refunds";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ApplicationBasicInfoEdit } from "./ApplicationBasicInfoEdit";
import { ApplicationPaySummary } from "./ApplicationPaySummary";
import { PaymentListDrawer } from "./PaymentListDrawer";
import { PaymentLogDrawer } from "./PaymentLogDrawer";
import { RefundEvidencePanel } from "./RefundEvidencePanel";
import { RefundResultPanel } from "./RefundResultPanel";

export type ApplicationDetailSource = "applications" | "organization-members";

type Props = {
  row: AdminApplicationRow | null;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  source?: ApplicationDetailSource;
  onOpenGroupBasicInfo?: () => void;
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

function DrawerGuide({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="admin-drawer__guide" role="note">
      <p>{children}</p>
      {action ? <div className="admin-drawer__guide-action">{action}</div> : null}
    </div>
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

export function ApplicationDetailDrawer({
  row,
  loading,
  error,
  onClose,
  source = "applications",
  onOpenGroupBasicInfo,
}: Props) {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [logPayment, setLogPayment] = useState<AdminPayment | null>(null);
  const [evidenceCancelId, setEvidenceCancelId] = useState<string | null>(null);
  const [refundResult, setRefundResult] = useState<AdminRefundBatchResponse | null>(null);
  const refundRequest = useRef<AdminFullRefundBody | null>(null);
  const refundToastKey = useRef<string | null>(null);
  const { confirm, modal: confirmModal } = useAdminConfirm();
  const { prompt, modal: inputModal } = useAdminPrompt();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLogPayment(null);
    setEvidenceCancelId(null);
    setPage(0);
    setEditing(false);
    setEditError("");
    setRefundResult(null);
    refundRequest.current = null;
    refundToastKey.current = null;
  }, [row?.id]);

  useEffect(() => {
    setLogPayment(null);
    setEvidenceCancelId(null);
  }, [page]);

  useEffect(() => {
    if (!row) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (evidenceCancelId) {
        setEvidenceCancelId(null);
        return;
      }
      if (logPayment) {
        setLogPayment(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [evidenceCancelId, logPayment, onClose, row]);

  const finance = useQuery({
    queryKey: ["admin", "finance", row?.eventId, row?.id, row?.kind, row?.organizationId, page],
    queryFn: () => fetchApplicationFinance(row!, page),
    enabled: Boolean(row?.eventId && row?.id),
  });

  const invalidateAfterFinanceChange = useCallback(async () => {
    if (!row) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "registrations"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "registration"] }),
      queryClient.invalidateQueries({
        queryKey: ["admin", "registration-statistics"],
      }),
      queryClient.invalidateQueries({ queryKey: ["admin", "finance"] }),
      row.organizationId
        ? queryClient.invalidateQueries({
            queryKey: ["admin", "organization", row.organizationId],
          })
        : Promise.resolve(),
    ]);
  }, [queryClient, row]);

  const showRefundToast = useCallback((data: AdminRefundBatchResponse) => {
    const key = data.summary.requestId || data.summary.batchId;
    if (!key || refundToastKey.current === key) return;
    const toast = refundBatchToast(data);
    if (!toast) return;
    refundToastKey.current = key;
    if (toast.ok) adminToast.success(toast.message);
    else adminToast.error(toast.message);
  }, []);

  const resetPassword = useMutation({
    mutationFn: (password: string) =>
      resetRegistrationPassword(row!.id, password),
    onSuccess: () => adminToast.success("비밀번호가 초기화되었습니다."),
    onError: (err) =>
      adminToast.error(
        err instanceof Error ? err.message : "비밀번호 초기화에 실패했습니다.",
      ),
  });

  const removeUnpaid = useMutation({
    mutationFn: () => deleteAdminRegistration(row!.id),
    onSuccess: async (data) => {
      await invalidateAfterFinanceChange();
      const message = data?.message?.trim();
      adminToast.success(message || "미결제 신청이 취소되었습니다.");
      onClose();
    },
    onError: (err) =>
      adminToast.error(
        err instanceof Error ? err.message : "미결제 신청 취소에 실패했습니다.",
      ),
  });

  const runFullRefund = useMutation({
    mutationFn: async () => {
      const body = refundRequest.current;
      if (!row || !body) throw new Error("환불 요청이 없습니다.");
      try {
        return await postFullRefund(row.eventId, body);
      } catch (err) {
        if (
          isAdminHttp(err, 0) ||
          isAdminHttp(err, 502) ||
          isAdminHttp(err, 504)
        ) {
          try {
            return await fetchRefundResult(row.eventId, body.requestId);
          } catch (lookupErr) {
            if (isAdminHttp(lookupErr, 404)) {
              throw new Error(
                "요청 접수 여부를 아직 확인할 수 없습니다. 잠시 후 같은 요청으로 다시 조회하세요.",
              );
            }
            throw lookupErr;
          }
        }
        throw err;
      }
    },
    onSuccess: async (data) => {
      setRefundResult(data);
      showRefundToast(data);
      if (!refundBatchUnfinished(data.summary.status)) {
        refundRequest.current = null;
      }
      await invalidateAfterFinanceChange();
    },
    onError: (err) =>
      adminToast.error(
        err instanceof Error
          ? err.message
          : "환불 요청 결과를 확인할 수 없습니다. 같은 요청으로 다시 조회하세요.",
      ),
  });

  const lookupRefundResult = async () => {
    const requestId =
      refundRequest.current?.requestId || refundResult?.summary.requestId;
    if (!row?.eventId || !requestId) return;
    try {
      const data = await fetchRefundResult(row.eventId, requestId);
      setRefundResult(data);
      showRefundToast(data);
      if (!refundBatchUnfinished(data.summary.status)) {
        refundRequest.current = null;
      }
      await invalidateAfterFinanceChange();
    } catch (err) {
      if (isAdminHttp(err, 404)) {
        adminToast.error(
          "요청 접수 여부를 아직 확인할 수 없습니다. 잠시 후 같은 요청으로 다시 조회하세요.",
        );
        return;
      }
      adminToast.error(
        err instanceof Error ? err.message : "저장 결과 조회에 실패했습니다.",
      );
    }
  };

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

  const handleDeleteUnpaid = async () => {
    if (!row || !canDeleteUnpaidRegistration(row.status)) return;
    const label =
      row.name?.trim() || row.personName?.trim() || row.groupName?.trim() || "해당 신청";
    const ok = await confirm({
      title: "미결제 신청 취소",
      message: `${label} 미결제 신청을 취소할까요? 정원은 반환되고 결제 이력은 남습니다.`,
      confirmLabel: "취소 처리",
    });
    if (!ok) return;
    removeUnpaid.mutate();
  };

  const handleFullRefund = async () => {
    if (!row || !hasAdminRefundBatch) return;
    if (!refundRequest.current) {
      const label =
        row.name?.trim() || row.personName?.trim() || row.groupName?.trim() || "해당 신청";
      const ok = await confirm({
        title: "참가 취소 및 전액 환불",
        message: `${label} 참가 취소와 정원 반환을 동반합니다. 신청 취소가 먼저 반영된 뒤 PG 환불이 진행되며, PG가 실패해도 신청·정원이 자동으로 원복되지 않습니다.`,
        confirmLabel: "환불 요청",
      });
      if (!ok) return;
      const reason = await prompt({
        title: "환불 사유",
        description: `관리자 환불 사유를 입력해 주세요. (${REFUND_REASON_MAX}자 이내)`,
        label: "사유",
        placeholder: "참가자 요청에 따른 참가 취소",
        confirmLabel: "요청",
      });
      if (!reason) return;
      refundRequest.current = {
        requestId: newRefundRequestId(),
        reason: reason.slice(0, REFUND_REASON_MAX),
        registrationIds: row.kind === "group" ? [] : [row.id],
        organizationIds:
          row.kind === "group" ? [row.organizationId || row.id] : [],
      };
    }
    runFullRefund.mutate();
  };

  useEffect(() => {
    if (!row?.eventId) return;
    const requestId =
      refundRequest.current?.requestId || refundResult?.summary.requestId;
    if (!requestId || !refundBatchUnfinished(refundResult?.summary.status)) return;
    let n = 0;
    const timer = window.setInterval(() => {
      n += 1;
      if (n > 15) {
        window.clearInterval(timer);
        return;
      }
      void fetchRefundResult(row.eventId, requestId)
        .then((data) => {
          setRefundResult(data);
          showRefundToast(data);
          if (!refundBatchUnfinished(data.summary.status)) {
            refundRequest.current = null;
            window.clearInterval(timer);
            void invalidateAfterFinanceChange();
          }
        })
        .catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [row?.eventId, refundResult?.summary.requestId, refundResult?.summary.status, invalidateAfterFinanceChange, showRefundToast]);

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
  const isOrgMemberContext = source === "organization-members";
  const blockGroupEdit = source === "applications" && isGroup;
  const canEditBasicInfo = !blockGroupEdit;
  const canDeleteUnpaid = !editing && canDeleteUnpaidRegistration(row.status);
  const canFullRefund =
    hasAdminRefundBatch &&
    !editing &&
    !canDeleteUnpaid &&
    (row.kind === "group"
      ? !closedRegistration(row.status)
      : statusKey(row.status) === "CONFIRMED");
  const title = row.name?.trim() || row.personName?.trim() || row.groupName?.trim() || "-";
  const sections = buildSections(row);
  const membersHref = row.organizationId
    ? adminOrganizationDetailHref(row.organizationId, { apiEventId: row.eventId })
    : adminMembersHref(row.eventId);
  const payments = finance.data?.payments?.content ?? [];
  const totalPages = Math.max(1, finance.data?.payments?.totalPages ?? 1);
  const totalCount = finance.data?.payments?.totalElements;
  const showPayments = !finance.isLoading && !finance.isError && payments.length > 0;
  const showLog = Boolean(logPayment);
  const showEvidence = Boolean(evidenceCancelId);

  const openLog = (payment: AdminPayment | null) => {
    setEvidenceCancelId(null);
    setLogPayment(payment);
  };

  const openEvidence = (paymentCancelId: string | null) => {
    setLogPayment(null);
    setEvidenceCancelId(paymentCancelId);
  };

  return createPortal(
    <div
      className="admin-drawer-stack"
      data-pay-open={showPayments ? "" : undefined}
      data-log-open={showLog || showEvidence ? "" : undefined}
    >
      <div
        className="admin-drawer__dim"
        role="presentation"
        aria-hidden="true"
        onClick={onClose}
      />
      {showEvidence && evidenceCancelId ? (
        <RefundEvidencePanel
          eventId={row.eventId}
          paymentCancelId={evidenceCancelId}
          onClose={() => setEvidenceCancelId(null)}
        />
      ) : null}
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
          highlightRegistrationId={isGroup ? undefined : row.id}
          activeLogPaymentId={logPayment?.paymentId ?? null}
          activeEvidenceCancelId={evidenceCancelId}
          onOpenLog={openLog}
          onOpenEvidence={openEvidence}
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
              {!editing && canEditBasicInfo ? (
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
              ) : !editing ? null : (
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
              {canFullRefund ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--danger-text"
                  disabled={runFullRefund.isPending || loading || Boolean(error)}
                  onClick={() => void handleFullRefund()}
                >
                  참가 취소·환불
                </button>
              ) : null}
              {canDeleteUnpaid ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--danger-text"
                  disabled={removeUnpaid.isPending || loading || Boolean(error)}
                  onClick={() => void handleDeleteUnpaid()}
                >
                  미결제 취소
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
              mode={isOrgMemberContext ? "organization-member" : "full"}
              onCancel={() => {
                setEditing(false);
                setEditError("");
              }}
              onSaved={() => void handleBasicInfoSaved()}
              onError={setEditError}
              onOpenGroupBasicInfo={
                isOrgMemberContext && onOpenGroupBasicInfo
                  ? () => {
                      setEditing(false);
                      setEditError("");
                      onOpenGroupBasicInfo();
                    }
                  : undefined
              }
            />
          ) : null}

          {!loading && !error && !editing ? (
            <>
              {blockGroupEdit ? (
                <DrawerGuide
                  action={
                    <Link href={membersHref} className="admin-drawer__guide-link">
                      {row.organizationId ? "단체 상세 바로가기" : "단체회원 관리 바로가기"}
                    </Link>
                  }
                >
                  단체 소속 참가자는 이 화면에서 수정할 수 없습니다. 단체회원 관리에서
                  수정해 주세요.
                </DrawerGuide>
              ) : null}
              {isOrgMemberContext ? (
                <DrawerGuide
                  action={
                    onOpenGroupBasicInfo ? (
                      <button
                        type="button"
                        className="admin-drawer__guide-link"
                        onClick={onOpenGroupBasicInfo}
                      >
                        기본정보 수정 바로가기
                      </button>
                    ) : null
                  }
                >
                  이메일·주소는 단체 공통 정보입니다. 변경이 필요하면 단체 상세 상단
                  「기본정보 수정」을 이용해 주세요.
                </DrawerGuide>
              ) : null}
              <DetailSection title="신청 정보" fields={sections.applyFields} />
              {isGroup ? (
                <DetailSection title="단체" fields={sections.groupFields} />
              ) : null}
              <DetailSection
                title={isGroup || isOrgMemberContext ? "참가자" : "신청자"}
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
            <>
              {refundResult ? (
                <RefundResultPanel
                  eventId={row.eventId}
                  result={refundResult}
                  lookingUp={runFullRefund.isPending}
                  onLookup={() => void lookupRefundResult()}
                  onClose={() => setRefundResult(null)}
                />
              ) : null}
              <ApplicationPaySummary
                data={finance.data}
                loading={finance.isLoading}
                error={finance.isError ? finance.error : undefined}
                paymentCount={totalCount ?? payments.length}
              />
            </>
          ) : null}
        </div>
      </aside>
      {confirmModal}
      {inputModal}
    </div>,
    document.body,
  );
}
