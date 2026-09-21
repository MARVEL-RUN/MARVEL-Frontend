"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { useAdminPrompt } from "@/components/admin/InputModal";
import { adminToast } from "@/components/admin/Toast";
import { hasAdminApi } from "@/lib/admin/config";
import { isAdminHttp } from "@/lib/admin/fetch";
import { adminMembersListBackHref } from "@/lib/admin/eventLinks";
import type { AdminRaceEventId } from "@/lib/admin/raceEvents";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { APPLICATION_PASSWORD_MIN } from "@/lib/register";
import { formatAmount } from "@/services/admin/applications";
import {
  fetchAdminOrganization,
  resetOrganizationPassword,
} from "@/services/admin/organizations";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

export function OrganizationDetailPage() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const apiEventId = searchParams.get("eventId")?.trim() ?? "";
  const slugParam = searchParams.get("slug")?.trim() ?? "";
  const slug = slugParam === "marvel" || slugParam === "virtual" ? slugParam : null;
  const { confirm, modal: confirmModal } = useAdminConfirm();
  const { prompt, modal: inputModal } = useAdminPrompt();

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
    ? adminMembersListBackHref(apiEventId, slug as AdminRaceEventId | null)
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
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={
              resetPassword.isPending || detailQuery.isLoading || !detail
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

      {detailQuery.isLoading ? (
        <p className="admin-empty">불러오는 중…</p>
      ) : detail ? (
        <>
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
                  <dt>대표 아이디</dt>
                  <dd>{dash(detail.loginId)}</dd>
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
