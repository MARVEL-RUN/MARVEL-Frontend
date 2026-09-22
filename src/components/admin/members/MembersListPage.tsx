"use client";

import { AdminSelect } from "@/components/admin/Select";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { hasAdminApi } from "@/lib/admin/config";
import { isAdminHttp } from "@/lib/admin/fetch";
import {
  adminOrganizationDetailHref,
} from "@/lib/admin/eventLinks";
import { formatAdminListDate } from "@/lib/admin/formatDate";
import {
  getAdminRaceEvent,
  type AdminRaceEventId,
} from "@/lib/admin/raceEvents";
import {
  fetchAdminEvents,
  matchRaceEvent,
} from "@/services/admin/applications";
import {
  fetchAdminOrganizations,
  type AdminOrganizationListItem,
} from "@/services/admin/organizations";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

const PAGE_SIZE = 15;

const SEARCH_OPTIONS = [
  { value: "group", label: "단체명" },
  { value: "leader", label: "대표자" },
  { value: "login", label: "로그인 ID" },
] as const;

const SEARCH_PLACEHOLDER: Record<(typeof SEARCH_OPTIONS)[number]["value"], string> = {
  group: "단체명을 입력해주세요",
  leader: "대표자명을 입력해주세요",
  login: "로그인 ID를 입력해주세요",
};

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "대회 또는 단체 정보가 없습니다.";
  return "조회에 실패했습니다.";
}

type Props = {
  slug?: AdminRaceEventId;
};

export function MembersListPage({ slug }: Props) {
  const searchParams = useSearchParams();
  const queryEventId = searchParams.get("eventId")?.trim() ?? "";

  const [searchField, setSearchField] =
    useState<(typeof SEARCH_OPTIONS)[number]["value"]>("group");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [page, setPage] = useState(1);

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
  const eventSubtitle =
    apiEvent?.eventName || (slug ? getAdminRaceEvent(slug)?.name : "") || "";

  const listQuery = useQuery({
    queryKey: ["admin", "organizations", apiEventId, appliedQ, page],
    queryFn: () =>
      fetchAdminOrganizations({
        eventId: apiEventId,
        keyword: appliedQ,
        page: page - 1,
        size: PAGE_SIZE,
      }),
    enabled: hasAdminApi && Boolean(apiEventId),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setPage(1);
  }, [apiEventId]);

  const rows = listQuery.data?.content ?? [];
  const totalCount = listQuery.data?.totalElements ?? 0;
  const pageCount = Math.max(1, listQuery.data?.totalPages ?? 1);

  const runSearch = () => {
    setAppliedQ(q.trim());
    setPage(1);
  };

  const resetSearch = () => {
    setQ("");
    setAppliedQ("");
    setSearchField("group");
    setPage(1);
  };

  if (slug && !getAdminRaceEvent(slug)) {
    return (
      <div className="admin-page">
        <p className="admin-empty">존재하지 않는 대회입니다.</p>
        <Link href="/admin/members" className="admin-btn admin-btn--ghost">
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
          : "등록된 단체가 없습니다.";

  const columns = [
    {
      key: "no",
      header: "번호",
      className: "is-num",
      width: "48px",
      render: (row: AdminOrganizationListItem) => row.listNumber || "-",
    },
    {
      key: "groupName",
      header: "단체명",
      className: "is-name",
      width: "14%",
      render: (row: AdminOrganizationListItem) => (
        <span className="admin-apps-list__name" title={row.groupName || undefined}>
          {row.groupName || "-"}
        </span>
      ),
    },
    {
      key: "eventName",
      header: "대회명",
      className: "is-clip",
      width: "18%",
      render: (row: AdminOrganizationListItem) => (
        <span title={row.eventName || undefined}>{row.eventName || "-"}</span>
      ),
    },
    {
      key: "leaderName",
      header: "대표자명",
      className: "is-muted",
      width: "88px",
      render: (row: AdminOrganizationListItem) => row.leaderName || "-",
    },
    {
      key: "loginId",
      header: "대표자 아이디",
      className: "is-clip",
      width: "12%",
      render: (row: AdminOrganizationListItem) => row.loginId || "-",
    },
    {
      key: "createdAt",
      header: "등록일",
      className: "is-date",
      width: "96px",
      render: (row: AdminOrganizationListItem) => formatAdminListDate(row.createdAt),
    },
    {
      key: "memberCount",
      header: "회원수",
      className: "is-num",
      width: "64px",
      render: (row: AdminOrganizationListItem) =>
        row.memberCount > 0 ? String(row.memberCount) : "-",
    },
    {
      key: "members",
      header: "회원리스트",
      className: "is-link",
      width: "96px",
      render: (row: AdminOrganizationListItem) =>
        row.organizationId ? (
          <Link
            href={adminOrganizationDetailHref(row.organizationId, {
              apiEventId,
            })}
            className="admin-members-list__go"
            onClick={(event) => event.stopPropagation()}
          >
            회원리스트
            <ChevronRight size={14} strokeWidth={2.2} aria-hidden />
          </Link>
        ) : (
          "-"
        ),
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
      className={`admin-page admin-apps-list admin-members-list${fixedTableHeight ? " is-fixed-table" : ""}${listQuery.isFetching ? " is-fetching" : ""}`}
      style={listPageStyle}
    >
      <AdminTableShell<AdminOrganizationListItem>
        title="단체회원 관리"
        rows={rows}
        loading={eventsQuery.isLoading || (listQuery.isLoading && !listQuery.data)}
        empty={empty}
        rowKey={(row) => row.organizationId}
        page={page}
        pageCount={pageCount}
        totalCount={totalCount}
        onPage={(n) => setPage(n)}
        pageUnit="단체"
        actions={
          <div className="admin-table-shell__actions admin-apps-list__head-actions">
            {eventSubtitle ? (
              <p className="admin-members-list__event">{eventSubtitle}</p>
            ) : null}
            <Link href="/admin/members" className="admin-btn admin-btn--ghost">
              대회 목록
            </Link>
          </div>
        }
        tools={
          <>
            <AdminSelect
              value={searchField}
              options={[...SEARCH_OPTIONS]}
              onChange={(value) =>
                setSearchField(value as (typeof SEARCH_OPTIONS)[number]["value"])
              }
              ariaLabel="검색 필드"
              width={112}
            />
            <input
              className="admin-toolbar__search admin-apps-list__search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              placeholder={SEARCH_PLACEHOLDER[searchField]}
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
    </div>
  );
}
