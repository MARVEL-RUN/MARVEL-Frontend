"use client";

import { ApplicationDetailDrawer } from "@/components/admin/applications/ApplicationDetailDrawer";
import { AdminSelect } from "@/components/admin/Select";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { hasAdminApi } from "@/lib/admin/config";
import { isAdminHttp } from "@/lib/admin/fetch";
import { formatPhone } from "@/lib/register";
import {
  REGISTRATION_STATUSES,
  registrationStatusBadge,
  registrationStatusLabel,
  statusKey,
  type RegistrationStatus,
} from "@/lib/registration-status";
import {
  applicationCourseLabel,
  applicationGenderLabel,
  applyRegistrationDetail,
  fetchAdminEventCategories,
  fetchAdminRegistration,
  fetchAdminRegistrations,
  mapRegistrationPage,
  type AdminApplicationRow,
} from "@/services/admin/applications";
import type {
  AdminOrganizationMember,
} from "@/services/admin/organizations";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: RegistrationStatus | ""; label: string }[] = [
  { value: "", label: "신청상태" },
  ...REGISTRATION_STATUSES.map((status) => ({
    value: status,
    label: registrationStatusLabel(status),
  })),
];

type Applied = {
  q: string;
  status: RegistrationStatus | "";
  eventCategoryId: string;
};

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "신청 정보가 없습니다.";
  return "조회에 실패했습니다.";
}

function StatusBadge({ status }: { status: string }) {
  const tone = registrationStatusBadge(status);
  return (
    <span className="admin-apps-list__status">
      <span className={`admin-apps-list__status-dot admin-apps-list__status-dot--${tone}`} aria-hidden />
      {registrationStatusLabel(status)}
    </span>
  );
}

function CourseTag({ row }: { row: AdminApplicationRow }) {
  const label = applicationCourseLabel(row);
  if (!label || label === "-") return <>-</>;
  return <span className="admin-apps-list__course-text">{label}</span>;
}

function MarketingBadge({ consent }: { consent: boolean }) {
  return (
    <span
      className={`admin-apps-list__yn-text${consent ? " is-yes" : " is-no"}`}
      aria-label={consent ? "마케팅 동의" : "마케팅 미동의"}
    >
      {consent ? "Y" : "N"}
    </span>
  );
}

function displayPhone(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return "-";
  return formatPhone(raw);
}

function memberStub(
  member: AdminOrganizationMember,
  eventId: string,
  organizationId: string,
  no: number,
): AdminApplicationRow {
  return {
    id: member.registrationId,
    no,
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

function filterRows(
  rows: AdminApplicationRow[],
  applied: Applied,
  categoryName: string,
) {
  const keyword = applied.q.trim().toLowerCase();
  return rows.filter((row) => {
    if (applied.status && statusKey(row.status) !== applied.status) return false;
    if (applied.eventCategoryId && categoryName) {
      const course = applicationCourseLabel(row);
      if (course !== categoryName && row.courseName !== categoryName) return false;
    }
    if (!keyword) return true;
    const hay = [row.name, row.personName, row.phone].join(" ").toLowerCase();
    return hay.includes(keyword);
  });
}

type Props = {
  apiEventId: string;
  organizationId: string;
  members: AdminOrganizationMember[];
};

export function OrganizationMembersList({ apiEventId, organizationId, members }: Props) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<RegistrationStatus | "">("");
  const [course, setCourse] = useState("");
  const [applied, setApplied] = useState<Applied>({
    q: "",
    status: "",
    eventCategoryId: "",
  });
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const memberIds = useMemo(
    () => members.map((member) => member.registrationId).filter(Boolean),
    [members],
  );

  const categoriesQuery = useQuery({
    queryKey: ["admin", "event-categories", apiEventId],
    queryFn: () => fetchAdminEventCategories(apiEventId),
    enabled: hasAdminApi && Boolean(apiEventId),
  });

  const courseOptions = useMemo(
    () => [
      { value: "", label: "전체 코스" },
      ...(categoriesQuery.data ?? []).map((category) => ({
        value: category.id,
        label: category.name,
      })),
    ],
    [categoriesQuery.data],
  );

  const listQuery = useQuery({
    queryKey: ["admin", "org-member-registrations", organizationId, memberIds],
    queryFn: async () => {
      const memberIdSet = new Set(memberIds);
      const [listRaw, ...details] = await Promise.all([
        fetchAdminRegistrations({
          eventId: apiEventId,
          page: 0,
          size: 200,
        }),
        ...members.map((member) => fetchAdminRegistration(member.registrationId)),
      ]);

      const listById = new Map(
        mapRegistrationPage(listRaw, apiEventId).content
          .filter((row) => memberIdSet.has(row.id))
          .map((row) => [row.id, row]),
      );

      return members.map((member, index) => {
        const base =
          listById.get(member.registrationId) ??
          memberStub(member, apiEventId, organizationId, index + 1);
        const withOrg = { ...base, organizationId: base.organizationId || organizationId, no: index + 1 };
        try {
          const row = applyRegistrationDetail(withOrg, details[index]);
          return {
            ...row,
            organizationId: row.organizationId || organizationId,
            no: index + 1,
            status: row.status || withOrg.status,
          };
        } catch {
          return withOrg;
        }
      });
    },
    enabled: hasAdminApi && Boolean(apiEventId) && memberIds.length > 0,
  });

  const detailQuery = useQuery({
    queryKey: ["admin", "registration", selectedId],
    queryFn: () => fetchAdminRegistration(selectedId as string),
    enabled: Boolean(selectedId),
  });

  useEffect(() => {
    setPage(1);
    setSelectedId(null);
  }, [apiEventId, organizationId, memberIds.join(",")]);

  useEffect(() => {
    setSelectedId(null);
  }, [applied, page]);

  const categoryName =
    categoriesQuery.data?.find((category) => category.id === applied.eventCategoryId)?.name ??
    "";

  const filteredRows = useMemo(
    () => filterRows(listQuery.data ?? [], applied, categoryName),
    [applied, categoryName, listQuery.data],
  );

  const totalCount = filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selected = useMemo(() => {
    const row = filteredRows.find((item) => item.id === selectedId) ?? null;
    if (!row) return null;
    const base = { ...row, organizationId: row.organizationId || organizationId };
    if (!detailQuery.data) return base;
    try {
      const detail = applyRegistrationDetail(base, detailQuery.data);
      return { ...detail, organizationId: detail.organizationId || organizationId };
    } catch {
      return base;
    }
  }, [detailQuery.data, filteredRows, organizationId, selectedId]);

  const runSearch = () => {
    setApplied({ q, status, eventCategoryId: course });
    setPage(1);
  };

  const resetSearch = () => {
    setQ("");
    setStatus("");
    setCourse("");
    setApplied({ q: "", status: "", eventCategoryId: "" });
    setPage(1);
  };

  const empty = !hasAdminApi
    ? "관리자 API 주소가 설정되지 않았습니다."
    : listQuery.isError
      ? errorHint(listQuery.error)
      : memberIds.length === 0
        ? "등록된 멤버가 없습니다."
        : "조건에 맞는 멤버가 없습니다.";

  const columns = [
    {
      key: "no",
      header: "번호",
      className: "is-num",
      width: "48px",
      render: (row: AdminApplicationRow) => row.no || "-",
    },
    {
      key: "name",
      header: "성명",
      className: "is-name",
      width: "11%",
      render: (row: AdminApplicationRow) => (
        <span className="admin-apps-list__name" title={row.name || undefined}>
          {row.name || "-"}
        </span>
      ),
    },
    {
      key: "birth",
      header: "생년월일",
      className: "is-muted",
      width: "96px",
      render: (row: AdminApplicationRow) => row.birth || "-",
    },
    {
      key: "gender",
      header: "성별",
      className: "is-muted",
      width: "56px",
      render: (row: AdminApplicationRow) => applicationGenderLabel(row.gender),
    },
    {
      key: "course",
      header: "코스",
      className: "is-course",
      width: "56px",
      render: (row: AdminApplicationRow) => <CourseTag row={row} />,
    },
    {
      key: "souvenir",
      header: "기념품",
      className: "is-clip",
      width: "11%",
      render: (row: AdminApplicationRow) => (
        <span className="admin-apps-list__souvenir" title={row.souvenir || undefined}>
          {row.souvenir || "-"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "연락처",
      className: "is-phone",
      width: "118px",
      render: (row: AdminApplicationRow) => displayPhone(row.phone),
    },
    {
      key: "marketing",
      header: "마케팅",
      className: "is-marketing",
      width: "52px",
      render: (row: AdminApplicationRow) => (
        <MarketingBadge consent={Boolean(row.marketingConsent)} />
      ),
    },
    {
      key: "status",
      header: "신청상태",
      className: "is-status",
      width: "108px",
      render: (row: AdminApplicationRow) => <StatusBadge status={row.status} />,
    },
    {
      key: "appliedAt",
      header: "신청일시",
      className: "is-date",
      width: "132px",
      render: (row: AdminApplicationRow) => row.appliedAt || "-",
    },
  ];

  const tableRowCount = rows.length;
  const fixedTableHeight =
    hasAdminApi &&
    Boolean(apiEventId) &&
    listQuery.data !== undefined &&
    tableRowCount > 0;
  const listPageStyle = fixedTableHeight
    ? ({ "--admin-apps-list-rows": tableRowCount } as CSSProperties)
    : undefined;

  return (
    <div
      className={`admin-apps-list admin-org-detail__members${fixedTableHeight ? " is-fixed-table" : ""}${listQuery.isFetching ? " is-fetching" : ""}`}
      style={listPageStyle}
    >
      <AdminTableShell<AdminApplicationRow>
        title="단체 구성원 목록"
        rows={rows}
        loading={listQuery.isLoading && !listQuery.data}
        empty={empty}
        rowKey={(row) => row.id || String(row.no)}
        page={page}
        pageCount={pageCount}
        totalCount={totalCount}
        onPage={(n) => setPage(n)}
        pageUnit="신청"
        onRowClick={(row) => {
          if (!row.id) return;
          setSelectedId(row.id);
        }}
        isRowSelected={(row) => Boolean(selectedId && row.id === selectedId)}
        actions={
          <p className="admin-apps-list__hint">행을 클릭하면 상세를 볼 수 있습니다</p>
        }
        tools={
          <>
            <div className="admin-apps-list__filter-group">
              <AdminSelect
                value={status}
                options={STATUS_OPTIONS}
                onChange={(value) => {
                  setStatus(value);
                  setApplied((prev) => ({ ...prev, status: value }));
                  setPage(1);
                }}
                ariaLabel="신청상태"
                width={112}
              />
              <AdminSelect
                value={course}
                options={courseOptions}
                onChange={(value) => {
                  setCourse(value);
                  setApplied((prev) => ({ ...prev, eventCategoryId: value }));
                  setPage(1);
                }}
                ariaLabel="코스"
                width={128}
              />
            </div>
            <input
              className="admin-toolbar__search admin-apps-list__search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              placeholder="이름 · 연락처"
            />
            <div className="admin-apps-list__search-actions">
              <button
                type="button"
                className="admin-btn admin-btn--primary admin-toolbar__btn"
                onClick={runSearch}
              >
                검색
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-toolbar__iconbtn"
                aria-label="검색 초기화"
                title="초기화"
                onClick={resetSearch}
              >
                <RotateCcw size={18} strokeWidth={2.25} />
              </button>
            </div>
          </>
        }
        columns={columns}
      />
      <ApplicationDetailDrawer
        row={selected}
        loading={Boolean(selectedId) && detailQuery.isLoading}
        error={
          Boolean(selectedId) && detailQuery.isError
            ? errorHint(detailQuery.error)
            : undefined
        }
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
