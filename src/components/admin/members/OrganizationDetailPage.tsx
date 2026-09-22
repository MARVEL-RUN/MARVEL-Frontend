"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { useAdminPrompt } from "@/components/admin/InputModal";
import { adminToast } from "@/components/admin/Toast";
import { hasAdminApi } from "@/lib/admin/config";
import { isAdminHttp } from "@/lib/admin/fetch";
import { adminMembersListBackHref } from "@/lib/admin/eventLinks";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { APPLICATION_PASSWORD_MIN, formatPhone } from "@/lib/register";
import { formatAmount } from "@/services/admin/applications";
import {
  fetchAdminOrganization,
  resetOrganizationPassword,
  updateOrganizationLoginId,
} from "@/services/admin/organizations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ORG_BASIC_EDIT_FORM_ID,
  OrganizationBasicInfoEdit,
} from "./OrganizationBasicInfoEdit";
import { OrganizationLoginIdModal } from "./OrganizationLoginIdModal";
import { OrganizationMembersList } from "./OrganizationMembersList";

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "단체 정보가 없습니다.";
  return "조회에 실패했습니다.";
}

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

export function OrganizationDetailPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const apiEventId = searchParams.get("eventId")?.trim() ?? "";
  const { confirm, modal: confirmModal } = useAdminConfirm();
  const { prompt, modal: inputModal } = useAdminPrompt();
  const [loginIdOpen, setLoginIdOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const detailQuery = useQuery({
    queryKey: ["admin", "organization", organizationId],
    queryFn: () => fetchAdminOrganization(organizationId),
    enabled: hasAdminApi && Boolean(organizationId),
  });

  const resetPassword = useMutation({
    mutationFn: (password: string) =>
      resetOrganizationPassword(organizationId, password),
    onSuccess: () => adminToast.success("비밀번호가 초기화되었습니다."),
    onError: (err) =>
      adminToast.error(
        err instanceof Error ? err.message : "비밀번호 초기화에 실패했습니다.",
      ),
  });

  const changeLoginId = useMutation({
    mutationFn: (newLoginId: string) =>
      updateOrganizationLoginId(organizationId, newLoginId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "organization", organizationId],
      });
      adminToast.success("로그인 아이디가 변경되었습니다.");
    },
    onError: (err) =>
      adminToast.error(
        err instanceof Error ? err.message : "아이디 변경에 실패했습니다.",
      ),
  });

  const handleChangeLoginId = async (next: string) => {
    setLoginIdOpen(false);
    const ok = await confirm({
      title: "아이디 변경",
      message: `로그인 아이디를 "${next}"(으)로 변경하시겠습니까?`,
    });
    if (!ok) return;
    changeLoginId.mutate(next);
  };

  const handleResetPassword = async () => {
    const label =
      detailQuery.data?.loginId?.trim() ||
      detailQuery.data?.groupName?.trim() ||
      "해당 단체";
    const ok = await confirm({
      title: "비밀번호 초기화",
      message: `${label} 계정의 비밀번호를 초기화하시겠습니까?`,
    });
    if (!ok) return;
    const password = await prompt({
      title: "비밀번호 초기화",
      description: `단체 조회용 새 비밀번호를 입력해 주세요. (${APPLICATION_PASSWORD_MIN}자 이상)`,
      label: "새 비밀번호",
      placeholder: `${APPLICATION_PASSWORD_MIN}자 이상 입력`,
      type: "password",
      minLength: APPLICATION_PASSWORD_MIN,
    });
    if (!password) return;
    resetPassword.mutate(password);
  };

  const detail = detailQuery.data;
  const members = detail?.members ?? [];
  const totalAmount = members.reduce((sum, member) => sum + (member.amount || 0), 0);
  const listHref = apiEventId
    ? adminMembersListBackHref(apiEventId)
    : "/admin/members";

  if (!organizationId || !apiEventId) {
    return (
      <div className="admin-page">
        <p className="admin-empty">
          {!organizationId ? "단체 정보가 없습니다." : "대회 정보가 없습니다."}
        </p>
        <Link href="/admin/members" className="admin-btn admin-btn--ghost">
          대회 목록
        </Link>
      </div>
    );
  }

  if (detailQuery.isError) {
    return (
      <div className="admin-page">
        <p className="admin-empty">{errorHint(detailQuery.error)}</p>
        <Link href={listHref} className="admin-btn admin-btn--ghost">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-page admin-org-detail">
      <header className="admin-org-detail__head">
        <div>
          <p className="admin-org-detail__crumb">단체회원 관리 · 단체 상세</p>
          <h1>단체 상세</h1>
          <p className="admin-org-detail__lead">{detail?.groupName || "불러오는 중…"}</p>
        </div>
        <div className="admin-org-detail__actions">
          {!editing ? (
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              disabled={detailQuery.isLoading || !detail}
              onClick={() => {
                setEditError("");
                setEditing(true);
              }}
            >
              기본정보 수정
            </button>
          ) : (
            <>
              <button
                type="submit"
                form={ORG_BASIC_EDIT_FORM_ID}
                className="admin-btn admin-btn--primary"
                disabled={editSaving}
              >
                {editSaving ? "저장 중…" : "저장"}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                disabled={editSaving}
                onClick={() => {
                  setEditing(false);
                  setEditError("");
                }}
              >
                수정 취소
              </button>
            </>
          )}
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={
              changeLoginId.isPending ||
              detailQuery.isLoading ||
              !detail ||
              !apiEventId ||
              editing
            }
            onClick={() => setLoginIdOpen(true)}
          >
            {changeLoginId.isPending ? "변경 중…" : "아이디 변경"}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={
              resetPassword.isPending || detailQuery.isLoading || !detail || editing
            }
            onClick={handleResetPassword}
          >
            비밀번호 초기화
          </button>
          <Link href={listHref} className="admin-btn admin-btn--ghost">
            목록으로
          </Link>
        </div>
      </header>
      {confirmModal}
      {inputModal}
      <OrganizationLoginIdModal
        open={loginIdOpen}
        eventId={apiEventId}
        currentLoginId={detail?.loginId}
        onCancel={() => setLoginIdOpen(false)}
        onConfirm={(loginId) => void handleChangeLoginId(loginId)}
      />

      {detailQuery.isLoading ? (
        <p className="admin-empty">불러오는 중…</p>
      ) : detail ? (
        <>
          {editError ? <p className="admin-drawer__edit-alert">{editError}</p> : null}
          {editing ? (
            <OrganizationBasicInfoEdit
              detail={detail}
              onPendingChange={setEditSaving}
              onSaved={async () => {
                await queryClient.invalidateQueries({
                  queryKey: ["admin", "organization", organizationId],
                });
                adminToast.success("기본정보가 수정되었습니다.");
                setEditing(false);
                setEditError("");
              }}
              onError={setEditError}
            />
          ) : (
            <div className="admin-org-detail__summary">
              <section className="admin-org-detail__card">
                <h2>기본 정보</h2>
                <dl>
                  <div className="admin-org-detail__row">
                    <dt>단체명</dt>
                    <dd>{dash(detail.groupName)}</dd>
                  </div>
                  <div className="admin-org-detail__row">
                    <dt>대표자명</dt>
                    <dd>{dash(detail.leaderName)}</dd>
                  </div>
                  <div className="admin-org-detail__row">
                    <dt>대표자 생년월일</dt>
                    <dd>{dash(detail.leaderBirth)}</dd>
                  </div>
                  <div className="admin-org-detail__row">
                    <dt>대표자 연락처</dt>
                    <dd>{displayPhone(detail.leaderPhNum)}</dd>
                  </div>
                  <div className="admin-org-detail__row">
                    <dt>대표 아이디</dt>
                    <dd>{dash(detail.loginId)}</dd>
                  </div>
                  <div className="admin-org-detail__row">
                    <dt>대표 이메일</dt>
                    <dd>{dash(detail.email)}</dd>
                  </div>
                  <div className="admin-org-detail__row">
                    <dt>법정대리인 동의</dt>
                    <dd>{agreeLabel(detail.guardianConsent)}</dd>
                  </div>
                </dl>
              </section>
              <section className="admin-org-detail__card">
                <h2>주소</h2>
                <dl>
                  <div className="admin-org-detail__row">
                    <dt>주소</dt>
                    <dd>{dash(detail.address)}</dd>
                  </div>
                  <div className="admin-org-detail__row">
                    <dt>상세주소</dt>
                    <dd>{dash(detail.addressDetail)}</dd>
                  </div>
                </dl>
              </section>
              <section className="admin-org-detail__card">
                <h2>신청 정보</h2>
                <dl>
                  <div className="admin-org-detail__row">
                    <dt>신청일시</dt>
                    <dd>{formatAdminBoardDate(detail.createdAt)}</dd>
                  </div>
                  <div className="admin-org-detail__row">
                    <dt>대회명</dt>
                    <dd>{dash(detail.eventName)}</dd>
                  </div>
                  <div className="admin-org-detail__row">
                    <dt>총 구성원</dt>
                    <dd>{members.length > 0 ? `${members.length}명` : "-"}</dd>
                  </div>
                </dl>
              </section>
              <section className="admin-org-detail__card">
                <h2>결제 정보</h2>
                <dl>
                  <div className="admin-org-detail__row">
                    <dt>총 금액</dt>
                    <dd>{totalAmount > 0 ? formatAmount(totalAmount) : "-"}</dd>
                  </div>
                </dl>
              </section>
            </div>
          )}

          <OrganizationMembersList
            apiEventId={apiEventId}
            organizationId={organizationId}
            members={members}
            loading={detailQuery.isLoading}
          />
        </>
      ) : (
        <p className="admin-empty">단체 정보가 없습니다.</p>
      )}
    </div>
  );
}
