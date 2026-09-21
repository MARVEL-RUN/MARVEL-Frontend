"use client";

import { AdminSelect } from "@/components/admin/Select";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { hasAdminApi } from "@/lib/admin/config";
import { isAdminHttp } from "@/lib/admin/fetch";
import {
  getAdminRaceEvent,
  type AdminRaceEventId,
} from "@/lib/admin/raceEvents";
import { formatPhone } from "@/lib/register";
import {
  REGISTRATION_STATUSES,
  registrationStatusFromParam,
  registrationStatusBadge,
  registrationStatusLabel,
  type RegistrationStatus,
} from "@/lib/registration-status";
import {
  applicationCourseLabel,
  applicationGenderLabel,
  applicationKindLabel,
  applyRegistrationDetail,
  fetchAdminEventCategories,
  fetchAdminEvents,
  fetchAdminRegistration,
  fetchAdminRegistrations,
  mapRegistrationPage,
  matchRaceEvent,
  type AdminApplicationRow,
  type ApplicationKind,
} from "@/services/admin/applications";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ApplicationDetailDrawer } from "./ApplicationDetailDrawer";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

const PAGE_SIZE = 15;

const KIND_OPTIONS: { value: ApplicationKind | ""; label: string }[] = [
  { value: "", label: "전체 유형" },
  { value: "individual", label: "개인" },
  { value: "group", label: "단체" },
];

const STATUS_OPTIONS: { value: RegistrationStatus | ""; label: string }[] = [
  { value: "", label: "전체 상태" },
  ...REGISTRATION_STATUSES.map((status) => ({
    value: status,
    label: registrationStatusLabel(status),
  })),
];

type Applied = {
  q: string;
  kind: ApplicationKind | "";
  status: RegistrationStatus | "";
  eventCategoryId: string;
};

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "대회 또는 신청 정보가 없습니다.";
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

function KindBadge({ kind }: { kind: AdminApplicationRow["kind"] }) {
  return <span className="admin-apps-list__kind-text">{applicationKindLabel(kind)}</span>;
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

function CourseTag({ row }: { row: AdminApplicationRow }) {
  const label = applicationCourseLabel(row);
  if (!label || label === "-") return <>-</>;
  return <span className="admin-apps-list__course-text">{label}</span>;
}

function displayPhone(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return "-";
  return formatPhone(raw);
}

type Props = {
  slug?: AdminRaceEventId;
};

export function ApplicationsListPage({ slug }: Props) {
  const searchParams = useSearchParams();
  const queryEventId = searchParams.get("eventId")?.trim() ?? "";
  const statusFromUrl = registrationStatusFromParam(searchParams.get("status"));

  const [q, setQ] = useState("");
  const [kind, setKind] = useState<ApplicationKind | "">("");
  const [status, setStatus] = useState<RegistrationStatus | "">(statusFromUrl);
  const [course, setCourse] = useState("");
  const [applied, setApplied] = useState<Applied>({
    q: "",
    kind: "",
    status: statusFromUrl,
    eventCategoryId: "",
  });
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const eventsQuery = useQuery({
    queryKey: ["admin", "events"],
    queryFn: fetchAdminEvents,
    enabled: hasAdminApi,
  });

  const apiEvent = useMemo(() => {
    const events = eventsQuery.data ?? [];
    if (slug) return matchRaceEvent(events, slug);
    if (queryEventId) {
      return (
        events.find((event) => event.eventId === queryEventId) ?? {
          eventId: queryEventId,
          eventName: "",
          registrationType: "",
          registrationPeriod: "",
        }
      );
    }
    return undefined;
  }, [eventsQuery.data, queryEventId, slug]);

  const apiEventId = apiEvent?.eventId ?? "";
  const eventTitle =
    apiEvent?.eventName || (slug ? getAdminRaceEvent(slug)?.name : "") || "신청자 목록";

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
    queryKey: ["admin", "registrations", apiEventId, applied, page],
    queryFn: async () => {
      const raw = await fetchAdminRegistrations({
        eventId: apiEventId,
        type: applied.kind,
        status: applied.status,
        keyword: applied.q,
        eventCategoryId: applied.eventCategoryId,
        page: page - 1,
        size: PAGE_SIZE,
      });
      return mapRegistrationPage(raw, apiEventId);
    },
    enabled: hasAdminApi && Boolean(apiEventId),
    placeholderData: keepPreviousData,
  });

  const detailQuery = useQuery({
    queryKey: ["admin", "registration", selectedId],
    queryFn: () => fetchAdminRegistration(selectedId as string),
    enabled: Boolean(selectedId),
  });

  useEffect(() => {
    const next = registrationStatusFromParam(searchParams.get("status"));
    setStatus(next);
    setApplied((prev) => (prev.status === next ? prev : { ...prev, status: next }));
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    setCourse("");
    setApplied((prev) => ({ ...prev, eventCategoryId: "" }));
    setPage(1);
  }, [apiEventId]);

  useEffect(() => {
    setSelectedId(null);
  }, [apiEventId, applied, page]);

  const rows = listQuery.data?.content ?? [];
  const totalCount = listQuery.data?.totalElements ?? 0;
  const pageCount = Math.max(1, listQuery.data?.totalPages ?? 1);

  const selected = useMemo(() => {
    const row = rows.find((item) => item.id === selectedId) ?? null;
    if (!row) return null;
    if (!detailQuery.data) return row;
    try {
      return applyRegistrationDetail(row, detailQuery.data);
    } catch {
      return row;
    }
  }, [detailQuery.data, rows, selectedId]);

  const runSearch = () => {
    setApplied({ q, kind, status, eventCategoryId: course });
    setPage(1);
  };

  const resetSearch = () => {
    setQ("");
    setKind("");
    setStatus("");
    setCourse("");
    setApplied({ q: "", kind: "", status: "", eventCategoryId: "" });
    setPage(1);
  };

  if (slug && !getAdminRaceEvent(slug)) {
    return (
      <div className="admin-page">
        <p className="admin-empty">존재하지 않는 대회입니다.</p>
        <Link href="/admin/applications" className="admin-btn admin-btn--ghost">
          대회 목록
        </Link>
      </div>
    );
  }

  const empty = !hasAdminApi
    ? "관리자 API 주소가 설정되지 않았습니다."
    : eventsQuery.isError && Boolean(slug)
      ? errorHint(eventsQuery.error)
      : listQuery.isError
        ? errorHint(listQuery.error)
        : eventsQuery.isFetched && slug && !apiEvent
          ? "대회 정보가 없습니다."
          : "신청 내역이 없습니다.";

  const columns = [
    {
      key: "no",
      header: "번호",
      className: "is-num",
      width: "48px",
      render: (row: AdminApplicationRow) => row.no || "-",
    },
    {
      key: "kind",
      header: "유형",
      className: "is-kind",
      width: "48px",
      render: (row: AdminApplicationRow) => <KindBadge kind={row.kind} />,
    },
    {
      key: "name",
      header: "이름/단체명",
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
      header: "상태",
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

  const fixedTableHeight = hasAdminApi && Boolean(apiEventId) && listQuery.data !== undefined;
  const listPageStyle = {
    "--admin-apps-list-rows": PAGE_SIZE,
  } as CSSProperties;

  return (
    <div
      className={`admin-page admin-apps-list${fixedTableHeight ? " is-fixed-table" : ""}${listQuery.isFetching ? " is-fetching" : ""}`}
      style={listPageStyle}
    >
      <AdminTableShell<AdminApplicationRow>
        title={eventTitle}
        rows={rows}
        loading={eventsQuery.isLoading || (listQuery.isLoading && !listQuery.data)}
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
        minRows={fixedTableHeight ? PAGE_SIZE : undefined}
        actions={
          <div className="admin-table-shell__actions admin-apps-list__head-actions">
            <p className="admin-apps-list__hint">행을 클릭하면 상세를 볼 수 있습니다</p>
            <Link href="/admin/applications" className="admin-btn admin-btn--ghost">
              대회 목록
            </Link>
          </div>
        }
        tools={
          <>
            <div className="admin-apps-list__filter-group">
              <AdminSelect
                value={kind}
                options={KIND_OPTIONS}
                onChange={(value) => {
                  setKind(value);
                  setApplied((prev) => ({ ...prev, kind: value }));
                  setPage(1);
                }}
                ariaLabel="신청 유형"
                width={112}
              />
              <AdminSelect
                value={status}
                options={STATUS_OPTIONS}
                onChange={(value) => {
                  setStatus(value);
                  setApplied((prev) => ({ ...prev, status: value }));
                  setPage(1);
                }}
                ariaLabel="상태"
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
              placeholder="이름 · 단체명 · 연락처"
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
