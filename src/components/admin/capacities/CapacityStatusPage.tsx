"use client";

import { AdminPagination } from "@/components/admin/Pagination";
import { AdminSelect } from "@/components/admin/Select";
import { adminToast } from "@/components/admin/Toast";
import { hasAdminApi } from "@/lib/admin/config";
import {
  getAdminRaceEvent,
  type AdminRaceEventId,
} from "@/lib/admin/raceEvents";
import { formatPhone } from "@/lib/register";
import {
  capacityApiEventId,
  capacityUnit,
  fetchCapacityRegistrations,
  fetchEventCapacities,
  isAdminHttp,
  type CapacityRegistration,
  type CapacityRow,
  type CapacityState,
  type CapacityType,
} from "@/services/admin/capacities";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

const PAGE_SIZE_OPTIONS = [
  { value: "20", label: "20명" },
  { value: "50", label: "50명" },
  { value: "100", label: "100명" },
] as const;

const CAPACITY_GROUPS = [
  {
    key: "event",
    title: "대회 총원",
    lead: "대회 전체 참가 상한",
    nameHeader: "정원명",
    countUnit: "건",
    types: ["EVENT_TOTAL"] as CapacityType[],
    showSize: false,
  },
  {
    key: "category",
    title: "종목 정원",
    lead: "코스·종목별 정원 및 합산 한도",
    nameHeader: "정원명",
    countUnit: "건",
    types: ["CATEGORY", "CHILD_CATEGORY", "CATEGORY_GROUP"] as CapacityType[],
    showSize: false,
  },
  {
    key: "souvenir",
    title: "기념품 재고",
    lead: "사이즈별 기념품 수량",
    nameHeader: "기념품명",
    countUnit: "품목",
    types: ["SOUVENIR"] as CapacityType[],
    showSize: true,
  },
] as const;

type Pick = {
  capacityId: string;
  name: string;
  state: CapacityState;
};

type Props = {
  eventId: AdminRaceEventId;
};

function dash(value: string | null | undefined) {
  return value ? value : "—";
}

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "대회 또는 정원 정보가 없습니다.";
  return "조회에 실패했습니다.";
}

function capacityUsed(row: CapacityRow) {
  return row.heldCount + row.confirmedCount;
}

function groupRows(rows: CapacityRow[]) {
  return CAPACITY_GROUPS.map((group) => ({
    ...group,
    rows: rows.filter((row) => group.types.includes(row.type as CapacityType)),
  })).filter((group) => group.rows.length > 0);
}

function buildSummary(rows: CapacityRow[]) {
  const event = rows.find((row) => row.type === "EVENT_TOTAL");
  const categories = rows.filter((row) =>
    ["CATEGORY", "CHILD_CATEGORY", "CATEGORY_GROUP"].includes(row.type),
  );
  const souvenirs = rows.filter((row) => row.type === "SOUVENIR");

  return {
    event,
    categoryCount: categories.length,
    souvenirCount: souvenirs.length,
  };
}

function CountCell({
  value,
  unit,
  active,
  onClick,
}: {
  value: number;
  unit: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`admin-capacity__count-btn${active ? " is-on" : ""}`}
      onClick={onClick}
      disabled={value <= 0}
      aria-pressed={active}
    >
      <span className="admin-capacity__count-num">{value.toLocaleString()}</span>
      <span className="admin-capacity__count-unit">{unit}</span>
    </button>
  );
}

function LimitCell({ value, unit }: { value: number; unit: string }) {
  return (
    <span className="admin-capacity__limit">
      <span className="admin-capacity__count-num">{value.toLocaleString()}</span>
      <span className="admin-capacity__count-unit">{unit}</span>
    </span>
  );
}

function UsageCount({ row }: { row: CapacityRow }) {
  const used = capacityUsed(row);
  if (row.limitCount <= 0) return <>—</>;
  return (
    <span className="admin-capacity__usage-count">
      {used.toLocaleString()}/{row.limitCount.toLocaleString()}
    </span>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className="admin-capacity__status">
      <span
        className={`admin-capacity__status-dot${active ? " is-on" : ""}`}
        aria-hidden
      />
      {active ? "활성" : "비활성"}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <article className="admin-capacity__summary-card">
      <p className="admin-capacity__summary-label">{label}</p>
      <p className="admin-capacity__summary-value">{value}</p>
      {sub ? <p className="admin-capacity__summary-sub">{sub}</p> : null}
    </article>
  );
}

function CapacityGroupTable({
  groupKey,
  title,
  lead,
  nameHeader,
  countUnit,
  rows,
  showSize,
  pick,
  onOpenList,
}: {
  groupKey: string;
  title: string;
  lead: string;
  nameHeader: string;
  countUnit: string;
  rows: CapacityRow[];
  showSize: boolean;
  pick: Pick | null;
  onOpenList: (row: CapacityRow, state: CapacityState) => void;
}) {
  return (
    <section className={`admin-capacity__group admin-capacity__group--${groupKey}`}>
      <div className="admin-capacity__group-head">
        <div>
          <h2 className="admin-capacity__group-title">
            <span className="admin-capacity__group-mark" aria-hidden />
            {title}
          </h2>
          <p className="admin-capacity__group-lead">
            {lead}
            <span className="admin-capacity__group-meta">
              총 <strong>{rows.length.toLocaleString()}</strong>
              {countUnit}
            </span>
          </p>
        </div>
      </div>
      <div className="admin-capacity__group-table-wrap">
        <table className="admin-table admin-capacity__group-table">
          <colgroup>
            <col />
            {showSize ? <col style={{ width: "64px" }} /> : null}
            <col style={{ width: "88px" }} />
            <col style={{ width: "88px" }} />
            <col style={{ width: "88px" }} />
            <col style={{ width: "96px" }} />
            <col style={{ width: "72px" }} />
          </colgroup>
          <thead>
            <tr>
              <th className="is-name">{nameHeader}</th>
              {showSize ? <th className="is-muted">사이즈</th> : null}
              <th className="is-num is-section-start">최대</th>
              <th className="is-num">홀딩</th>
              <th className="is-num">확정</th>
              <th className="is-num">사용</th>
              <th className="is-status is-section-start">상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const unit = capacityUnit(row.type);
              const picked = pick?.capacityId === row.capacityId;
              return (
                <tr
                  key={row.capacityId}
                  className={[!row.active && "is-off", picked && "is-picked"]
                    .filter(Boolean)
                    .join(" ") || undefined}
                >
                  <td className="is-name">
                    <span className="admin-capacity__name" title={row.name}>
                      {row.name}
                    </span>
                  </td>
                  {showSize ? <td className="is-muted">{dash(row.size)}</td> : null}
                  <td className="is-num is-section-start">
                    <LimitCell value={row.limitCount} unit={unit} />
                  </td>
                  <td className="is-num is-action">
                    <CountCell
                      value={row.heldCount}
                      unit={unit}
                      active={picked && pick?.state === "HELD"}
                      onClick={() => onOpenList(row, "HELD")}
                    />
                  </td>
                  <td className="is-num is-action">
                    <CountCell
                      value={row.confirmedCount}
                      unit={unit}
                      active={picked && pick?.state === "CONFIRMED"}
                      onClick={() => onOpenList(row, "CONFIRMED")}
                    />
                  </td>
                  <td className="is-num is-usage">
                    <UsageCount row={row} />
                  </td>
                  <td className="is-status is-section-start">
                    <ActiveBadge active={row.active} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ParticipantPanel({
  pick,
  rows,
  total,
  page,
  pageCount,
  loading,
  empty,
  pageSize,
  onClose,
  onStateChange,
  onPageSizeChange,
  onPage,
}: {
  pick: Pick;
  rows: CapacityRegistration[];
  total: number;
  page: number;
  pageCount: number;
  loading: boolean;
  empty: string;
  pageSize: string;
  onClose: () => void;
  onStateChange: (state: CapacityState) => void;
  onPageSizeChange: (size: string) => void;
  onPage: (page: number) => void;
}) {
  return (
    <aside className="admin-capacity__panel">
      <div className="admin-capacity__panel-head">
        <div className="admin-capacity__panel-title-wrap">
          <p className="admin-capacity__panel-kicker">참가자 목록</p>
          <h2 className="admin-capacity__panel-title">{pick.name}</h2>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-toolbar__iconbtn"
          aria-label="참가자 목록 닫기"
          title="닫기"
          onClick={onClose}
        >
          <X size={18} strokeWidth={2.25} />
        </button>
      </div>

      <div className="admin-capacity__panel-toolbar">
        <div
          className="admin-capacity__state-toggle"
          role="tablist"
          aria-label="참가자 상태"
        >
          <button
            type="button"
            role="tab"
            aria-selected={pick.state === "HELD"}
            className={`admin-capacity__state-btn${pick.state === "HELD" ? " is-on is-held" : ""}`}
            onClick={() => onStateChange("HELD")}
          >
            홀딩
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pick.state === "CONFIRMED"}
            className={`admin-capacity__state-btn${pick.state === "CONFIRMED" ? " is-on is-confirmed" : ""}`}
            onClick={() => onStateChange("CONFIRMED")}
          >
            확정
          </button>
        </div>
        <p className="admin-toolbar__count">
          총 <strong>{loading ? "…" : total.toLocaleString()}</strong>명
        </p>
        <div className="admin-toolbar__fields">
          <AdminSelect
            value={pageSize}
            options={[...PAGE_SIZE_OPTIONS]}
            onChange={onPageSizeChange}
            ariaLabel="페이지 크기"
            width={112}
          />
        </div>
      </div>

      <div className="admin-capacity__panel-body">
        {loading && rows.length === 0 ? (
          <p className="admin-empty">불러오는 중…</p>
        ) : rows.length === 0 ? (
          <p className="admin-empty">{empty}</p>
        ) : (
          <table className="admin-table admin-capacity__panel-table">
            <thead>
              <tr>
                <th className="is-name">이름</th>
                <th className="is-muted is-section-start">생년월일</th>
                <th className="is-phone">전화번호</th>
                <th className="is-name is-section-start">단체명</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.registrationId}>
                  <td className="is-name">{row.name || "—"}</td>
                  <td className="is-muted is-section-start">{dash(row.birth)}</td>
                  <td className="is-phone">{formatPhone(row.phNum) || row.phNum}</td>
                  <td className="is-name is-section-start">
                    <span
                      className="admin-capacity__name"
                      title={row.organizationName ?? undefined}
                    >
                      {dash(row.organizationName)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && total > 0 ? (
        <AdminPagination
          total={total}
          page={page}
          pageCount={Math.max(1, pageCount)}
          onPage={onPage}
          unit="명"
        />
      ) : null}
    </aside>
  );
}

export function CapacityStatusPage({ eventId }: Props) {
  const event = getAdminRaceEvent(eventId);
  const apiEventId = capacityApiEventId(eventId);
  const [pick, setPick] = useState<Pick | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("50");

  const capacities = useQuery({
    queryKey: ["admin", "capacities", apiEventId],
    queryFn: () => fetchEventCapacities(apiEventId as string),
    enabled: hasAdminApi && Boolean(apiEventId),
  });

  const list = useQuery({
    queryKey: [
      "admin",
      "capacity-regs",
      apiEventId,
      pick?.capacityId,
      pick?.state,
      page,
      pageSize,
    ],
    queryFn: () =>
      fetchCapacityRegistrations(apiEventId as string, pick!.capacityId, {
        state: pick!.state,
        page: page - 1,
        size: Number(pageSize),
      }),
    enabled: hasAdminApi && Boolean(apiEventId) && Boolean(pick),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const data = list.data;
    if (!data || !pick) return;
    if (data.capacityId && data.capacityId !== pick.capacityId) return;
    if (data.state && data.state !== pick.state) return;
    if (data.content.length === 0 && data.totalElements > 0 && data.page >= data.totalPages) {
      setPage(Math.max(1, data.totalPages));
    }
  }, [list.data, pick]);

  useEffect(() => {
    if (!isAdminHttp(list.error, 404) || !pick) return;
    setPick(null);
    void capacities.refetch();
    adminToast.error("대회 또는 정원 정보가 없습니다.");
  }, [list.error, pick, capacities]);

  function openList(row: CapacityRow, state: CapacityState) {
    const count = state === "HELD" ? row.heldCount : row.confirmedCount;
    if (count <= 0) return;
    setPage(1);
    setPick({ capacityId: row.capacityId, name: row.name, state });
  }

  function changeState(state: CapacityState) {
    if (!pick || pick.state === state) return;
    setPage(1);
    setPick({ ...pick, state });
  }

  function changePageSize(size: string) {
    setPage(1);
    setPageSize(size);
  }

  function refresh() {
    if (!apiEventId) return;
    void capacities.refetch();
    if (pick) void list.refetch();
  }

  const rows = capacities.data ?? [];
  const groups = useMemo(() => groupRows(rows), [rows]);
  const summary = useMemo(() => buildSummary(rows), [rows]);

  const listData = list.data;
  const listMatches =
    Boolean(listData) &&
    (!listData?.capacityId || listData.capacityId === pick?.capacityId) &&
    (!listData?.state || listData.state === pick?.state);
  const listRows = listMatches ? (listData?.content ?? []) : [];
  const listTotal = listMatches ? (listData?.totalElements ?? 0) : 0;
  const listPages = listMatches ? Math.max(1, listData?.totalPages ?? 1) : 1;

  if (!event) {
    return (
      <div className="admin-page">
        <p className="admin-empty">존재하지 않는 대회입니다.</p>
        <Link href="/admin/capacities" className="admin-btn admin-btn--ghost">
          대회 목록
        </Link>
      </div>
    );
  }

  const emptyCapacities =
    !hasAdminApi
      ? "관리자 API 주소가 설정되지 않았습니다."
      : !apiEventId
        ? "등록된 정원 정보가 없습니다."
        : capacities.isError
          ? errorHint(capacities.error)
          : "등록된 정원 정보가 없습니다.";

  const listEmpty =
    list.isError && !listMatches
      ? errorHint(list.error)
      : "해당 상태의 참가자가 없습니다.";

  return (
    <div
      className={`admin-page admin-capacity${pick ? " is-detail-open" : ""}${capacities.isFetching ? " is-fetching" : ""}`}
    >
      <header className="admin-capacity__hero">
        <div>
          <h1>{event.name} 정원 현황</h1>
          <p className="admin-capacity__hero-lead">
            대회·종목·기념품 정원을 구분해 확인하고, 홀딩·확정 숫자로 참가자를 조회할 수 있습니다.
          </p>
        </div>
        <div className="admin-capacity__hero-actions">
          {apiEventId ? (
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-toolbar__iconbtn"
              aria-label="새로고침"
              title="새로고침"
              onClick={refresh}
            >
              <RotateCcw size={18} strokeWidth={2.25} />
            </button>
          ) : null}
          <Link href="/admin/capacities" className="admin-btn admin-btn--ghost">
            대회 목록
          </Link>
        </div>
      </header>

      {capacities.isError && rows.length > 0 ? (
        <p className="admin-capacity__lead">{errorHint(capacities.error)} 이전 데이터를 유지합니다.</p>
      ) : null}

      <div className="admin-capacity__layout">
        <div className="admin-capacity__main">
          {!capacities.isLoading && rows.length > 0 ? (
            <div className="admin-capacity__summary">
              <SummaryCard
                label="대회 총원"
                value={
                  summary.event
                    ? `${capacityUsed(summary.event).toLocaleString()}/${summary.event.limitCount.toLocaleString()}`
                    : "—"
                }
                sub={summary.event ? "홀딩+확정 / 최대" : "등록된 총원 없음"}
              />
              <SummaryCard
                label="종목 정원"
                value={`${summary.categoryCount}항목`}
                sub="코스·종목·합산 한도"
              />
              <SummaryCard
                label="기념품 재고"
                value={`${summary.souvenirCount}품목`}
                sub="사이즈별 재고"
              />
            </div>
          ) : null}

          <div className="admin-capacity__groups">
            {capacities.isLoading ? (
              <div className="admin-capacity__group admin-capacity__group--empty">
                <p className="admin-empty">불러오는 중…</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="admin-capacity__group admin-capacity__group--empty">
                <div className="admin-empty">
                  <p>{emptyCapacities}</p>
                  {apiEventId && capacities.isError ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      onClick={() => void capacities.refetch()}
                    >
                      다시 시도
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              groups.map((group) => (
                <CapacityGroupTable
                  key={group.key}
                  groupKey={group.key}
                  title={group.title}
                  lead={group.lead}
                  nameHeader={group.nameHeader}
                  countUnit={group.countUnit}
                  rows={group.rows}
                  showSize={group.showSize}
                  pick={pick}
                  onOpenList={openList}
                />
              ))
            )}
          </div>
        </div>

        <div className="admin-capacity__aside">
          {pick ? (
            <ParticipantPanel
              pick={pick}
              rows={listRows}
              total={listTotal}
              page={page}
              pageCount={listPages}
              loading={list.isLoading && !listRows.length}
              empty={listEmpty}
              pageSize={pageSize}
              onClose={() => setPick(null)}
              onStateChange={changeState}
              onPageSizeChange={changePageSize}
              onPage={setPage}
            />
          ) : (
            <aside className="admin-capacity__panel admin-capacity__panel--empty">
              <p className="admin-capacity__panel-placeholder-title">참가자 조회</p>
              <p className="admin-capacity__panel-placeholder">
                왼쪽 표에서 <strong>홀딩</strong> 또는 <strong>확정</strong> 숫자를 클릭하면
                해당 참가자 목록이 여기에 표시됩니다.
              </p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
