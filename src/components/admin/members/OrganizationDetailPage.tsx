"use client";

import { ApplicationDetailDrawer } from "@/components/admin/applications/ApplicationDetailDrawer";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { hasAdminApi } from "@/lib/admin/config";
import { isAdminHttp } from "@/lib/admin/fetch";
import { adminMembersListBackHref } from "@/lib/admin/eventLinks";
import type { AdminRaceEventId } from "@/lib/admin/raceEvents";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import {
  applyRegistrationDetail,
  fetchAdminRegistration,
  formatAmount,
  type AdminApplicationRow,
} from "@/services/admin/applications";
import {
  fetchAdminOrganization,
  type AdminOrganizationMember,
} from "@/services/admin/organizations";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

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

function memberToRow(
  member: AdminOrganizationMember,
  eventId: string,
  organizationId: string,
  index: number,
): AdminApplicationRow {
  return {
    id: member.registrationId,
    no: index + 1,
    eventId,
    kind: "individual",
    orderNo: "",
    name: member.name,
    personName: member.name,
    groupName: "",
    birth: member.birth,
    courseName: member.courseName,
    souvenir: member.souvenirName,
    size: member.souvenirSize,
    phone: "",
    email: "",
    guardianPhone: "",
    guardianRelation: "",
    marketingConsent: false,
    amount: member.amount,
    cardPaymentInfo: "",
    address: "",
    addressDetail: "",
    status: "",
    appliedAt: "",
    organizationId,
  };
}

export function OrganizationDetailPage() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const apiEventId = searchParams.get("eventId")?.trim() ?? "";
  const slugParam = searchParams.get("slug")?.trim() ?? "";
  const slug = slugParam === "marvel" || slugParam === "virtual" ? slugParam : null;

  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ["admin", "organization", organizationId],
    queryFn: () => fetchAdminOrganization(organizationId),
    enabled: hasAdminApi && Boolean(organizationId),
  });

  const registrationQuery = useQuery({
    queryKey: ["admin", "registration", selectedRegistrationId],
    queryFn: () => fetchAdminRegistration(selectedRegistrationId as string),
    enabled: Boolean(selectedRegistrationId),
  });

  const detail = detailQuery.data;
  const members = detail?.members ?? [];
  const totalAmount = members.reduce((sum, member) => sum + (member.amount || 0), 0);
  const listHref = apiEventId
    ? adminMembersListBackHref(apiEventId, slug as AdminRaceEventId | null)
    : "/admin/members";

  const selectedMember = members.find(
    (member) => member.registrationId === selectedRegistrationId,
  );

  const selectedRow = useMemo(() => {
    if (!selectedMember || !apiEventId) return null;
    const index = members.findIndex(
      (member) => member.registrationId === selectedMember.registrationId,
    );
    const stub = memberToRow(selectedMember, apiEventId, organizationId, index);
    if (!registrationQuery.data) return stub;
    try {
      return applyRegistrationDetail(stub, registrationQuery.data);
    } catch {
      return stub;
    }
  }, [apiEventId, members, organizationId, registrationQuery.data, selectedMember]);

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

  const memberColumns = [
    {
      key: "no",
      header: "번호",
      className: "is-num",
      width: "48px",
      render: (row: AdminOrganizationMember) => {
        const index = members.findIndex(
          (member) => member.registrationId === row.registrationId,
        );
        return index >= 0 ? index + 1 : "-";
      },
    },
    {
      key: "name",
      header: "성명",
      className: "is-name",
      width: "96px",
      render: (row: AdminOrganizationMember) => (
        <span className="admin-apps-list__name" title={row.name || undefined}>
          {row.name || "-"}
        </span>
      ),
    },
    {
      key: "course",
      header: "코스",
      className: "is-course",
      width: "64px",
      render: (row: AdminOrganizationMember) => row.courseName || "-",
    },
    {
      key: "souvenir",
      header: "기념품",
      className: "is-clip",
      width: "12%",
      render: (row: AdminOrganizationMember) => row.souvenirName || "-",
    },
    {
      key: "size",
      header: "사이즈",
      className: "is-muted",
      width: "56px",
      render: (row: AdminOrganizationMember) => row.souvenirSize || "-",
    },
    {
      key: "birth",
      header: "생년월일",
      className: "is-muted",
      width: "96px",
      render: (row: AdminOrganizationMember) => row.birth || "-",
    },
    {
      key: "amount",
      header: "금액",
      className: "is-num",
      width: "88px",
      render: (row: AdminOrganizationMember) =>
        row.amount > 0 ? formatAmount(row.amount) : "-",
    },
  ];

  return (
    <div className="admin-page admin-org-detail">
      <header className="admin-org-detail__head">
        <div>
          <p className="admin-org-detail__crumb">회원관리 · 단체 회원관리</p>
          <h1>단체 상세</h1>
          <p className="admin-org-detail__lead">{detail?.groupName || "불러오는 중…"}</p>
        </div>
        <div className="admin-org-detail__actions">
          <Link href={listHref} className="admin-btn admin-btn--ghost">
            목록으로
          </Link>
        </div>
      </header>

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

          <section className="admin-org-detail__members admin-apps-list">
            <AdminTableShell<AdminOrganizationMember>
              title="단체 구성원 목록"
              rows={members}
              loading={false}
              empty="등록된 멤버가 없습니다."
              rowKey={(row) => row.registrationId}
              onRowClick={(row) => {
                if (!row.registrationId) return;
                setSelectedRegistrationId(row.registrationId);
              }}
              isRowSelected={(row) =>
                Boolean(selectedRegistrationId && row.registrationId === selectedRegistrationId)
              }
              actions={
                <p className="admin-apps-list__hint">행을 클릭하면 신청 상세를 볼 수 있습니다</p>
              }
              columns={memberColumns}
            />
          </section>
        </>
      ) : (
        <p className="admin-empty">단체 정보가 없습니다.</p>
      )}

      <ApplicationDetailDrawer
        row={selectedRow}
        loading={Boolean(selectedRegistrationId) && registrationQuery.isLoading}
        error={
          Boolean(selectedRegistrationId) && registrationQuery.isError
            ? errorHint(registrationQuery.error)
            : undefined
        }
        onClose={() => setSelectedRegistrationId(null)}
      />
    </div>
  );
}
