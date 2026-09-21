"use client";

import { AdminSelect } from "@/components/admin/Select";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { hasAdminApi } from "@/lib/admin/config";
import { isAdminHttp } from "@/lib/admin/fetch";
import {
  getAdminRaceEvent,
  type AdminRaceEventId,
} from "@/lib/admin/raceEvents";
import {
  applicationCourseLabel,
  applicationGenderLabel,
  applicationKindLabel,
  applicationPayBadge,
  applicationPayLabel,
  applyRegistrationDetail,
  fetchAdminEvents,
  fetchAdminRegistration,
  fetchAdminRegistrations,
  mapRegistrationPage,
  matchRaceEvent,
  type AdminApplicationRow,
  type ApplicationKind,
} from "@/services/admin/applications";
import type { AdminPayStatus } from "@/types/admin/admin";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ApplicationDetailDrawer } from "./ApplicationDetailDrawer";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

const PAY_STATUSES: AdminPayStatus[] = [
  "paid",
  "pending",
  "refund_requested",
  "refunded",
];

function payStatusFromParam(value: string | null): AdminPayStatus | "" {
  if (!value) return "";
  return PAY_STATUSES.includes(value as AdminPayStatus)
    ? (value as AdminPayStatus)
    : "";
}

const KIND_OPTIONS: { value: ApplicationKind | ""; label: string }[] = [
  { value: "", label: "전체 유형" },
  { value: "individual", label: "개인" },
  { value: "group", label: "단체" },
];

const STATUS_OPTIONS: { value: AdminPayStatus | ""; label: string }[] = [
  { value: "", label: "전체 상태" },
  { value: "paid", label: "결제완료" },
  { value: "pending", label: "대기" },
  { value: "refund_requested", label: "환불 대기" },
  { value: "refunded", label: "환불완료" },
];

type Applied = {
  q: string;
  kind: ApplicationKind | "";
  status: AdminPayStatus | "";
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
  return (
    <span className={`admin-badge admin-badge--${applicationPayBadge(status)}`}>
      {applicationPayLabel(status)}
    </span>
  );
}

type Props = {
  slug?: AdminRaceEventId;
};

export function ApplicationsListPage({ slug }: Props) {
  const searchParams = useSearchParams();
  const queryEventId = searchParams.get("eventId")?.trim() ?? "";
  const statusFromUrl = payStatusFromParam(searchParams.get("status"));

  const [q, setQ] = useState("");
  const [kind, setKind] = useState<ApplicationKind | "">("");
  const [status, setStatus] = useState<AdminPayStatus | "">(statusFromUrl);
  const [applied, setApplied] = useState<Applied>({
    q: "",
    kind: "",
    status: statusFromUrl,
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

  const listQuery = useQuery({
    queryKey: ["admin", "registrations", apiEventId, applied, page],
    queryFn: async () => {
      const raw = await fetchAdminRegistrations({
        eventId: apiEventId,
        type: applied.kind,
        status: applied.status,
        keyword: applied.q,
        page: page - 1,
        size: PAGE_SIZE,
      });
      return mapRegistrationPage(raw, apiEventId);
    },
    enabled: hasAdminApi && Boolean(apiEventId),
  });

  const detailQuery = useQuery({
    queryKey: ["admin", "registration", selectedId],
    queryFn: () => fetchAdminRegistration(selectedId as string),
    enabled: Boolean(selectedId),
  });

  useEffect(() => {
    const next = payStatusFromParam(searchParams.get("status"));
    setStatus(next);
    setApplied((prev) => (prev.status === next ? prev : { ...prev, status: next }));
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    setSelectedId(null);
  }, [apiEventId, applied, page]);

  const rows = listQuery.data?.content ?? [];
  const totalCount = listQuery.data?.totalElements ?? 0;
  const pageCount = Math.max(1, listQuery.data?.totalPages ?? 1);

  const selected = useMemo(() => {
    const row = rows.find((item) => item.id === selectedId) ?? null;
    if (!row) return null;
    if (detailQuery.data) return applyRegistrationDetail(row, detailQuery.data);
    return row;
  }, [detailQuery.data, rows, selectedId]);

  const runSearch = () => {
    setApplied({ q, kind, status });
    setPage(1);
  };

  const resetSearch = () => {
    setQ("");
    setKind("");
    setStatus("");
    setApplied({ q: "", kind: "", status: "" });
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
    { key: "no", header: "번호", render: (row: AdminApplicationRow) => row.no || "-" },
    {
      key: "kind",
      header: "유형",
      render: (row: AdminApplicationRow) => applicationKindLabel(row.kind),
    },
    { key: "name", header: "이름/단체명", render: (row: AdminApplicationRow) => row.name || "-" },
    {
      key: "birth",
      header: "생년월일",
      render: (row: AdminApplicationRow) => row.birth || "-",
    },
    {
      key: "gender",
      header: "성별",
      render: (row: AdminApplicationRow) => applicationGenderLabel(row.gender),
    },
    {
      key: "course",
      header: "코스",
      render: (row: AdminApplicationRow) => applicationCourseLabel(row),
    },
    {
      key: "souvenir",
      header: "기념품",
      render: (row: AdminApplicationRow) => row.souvenir || "-",
    },
    {
      key: "phone",
      header: "연락처",
      render: (row: AdminApplicationRow) => row.phone || "-",
    },
    {
      key: "marketing",
      header: "마케팅동의",
      render: (row: AdminApplicationRow) => (row.marketingConsent ? "Y" : "N"),
    },
    {
      key: "status",
      header: "상태",
      render: (row: AdminApplicationRow) => <StatusBadge status={row.status} />,
    },
    {
      key: "appliedAt",
      header: "신청일시",
      render: (row: AdminApplicationRow) => row.appliedAt || "-",
    },
  ];

  return (
    <div className="admin-page admin-apps-list">
      <AdminTableShell<AdminApplicationRow>
        title={eventTitle}
        rows={rows}
        loading={eventsQuery.isLoading || listQuery.isLoading}
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
        actions={
          <div className="admin-table-shell__actions">
            <Link href="/admin/applications" className="admin-btn admin-btn--ghost">
              대회 목록
            </Link>
          </div>
        }
        tools={
          <>
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
            <input
              className="admin-toolbar__search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              placeholder="이름 · 단체명 · 연락처"
            />
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
              <RotateCcw size={24} strokeWidth={2.5} />
            </button>
          </>
        }
        columns={columns}
      />
      <ApplicationDetailDrawer
        row={selected}
        loading={Boolean(selectedId) && detailQuery.isLoading}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
