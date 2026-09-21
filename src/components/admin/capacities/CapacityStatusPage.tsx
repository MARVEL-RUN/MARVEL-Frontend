"use client";

import { AdminPagination } from "@/components/admin/Pagination";
import { AdminSelect } from "@/components/admin/Select";
import { adminToast } from "@/components/admin/Toast";
import { hasAdminApi } from "@/lib/admin/config";
import {
  getAdminRaceEvent,
  type AdminRaceEventId,
} from "@/lib/admin/raceEvents";
import {
  capacityApiEventId,
  capacityTypeLabel,
  capacityUnit,
  fetchCapacityRegistrations,
  fetchEventCapacities,
  isAdminHttp,
  type CapacityRow,
  type CapacityState,
} from "@/services/admin/capacities";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const PAGE_SIZE_OPTIONS = [
  { value: "20", label: "20명" },
  { value: "50", label: "50명" },
  { value: "100", label: "100명" },
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

function formatCount(value: number, unit: string) {
  return `${value.toLocaleString()}${unit}`;
}

function errorHint(error: unknown) {
  if (isAdminHttp(error, 400)) return "요청값을 확인하세요.";
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  if (isAdminHttp(error, 404)) return "대회 또는 정원 정보가 없습니다.";
  return "조회에 실패했습니다.";
}

export function CapacityStatusPage({ eventId }: Props) {
  const event = getAdminRaceEvent(eventId);
  const apiEventId = capacityApiEventId(eventId);
  const [pick, setPick] = useState<Pick | null>(null);
  const [page, setPage] = useState(0);
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
        page,
        size: Number(pageSize),
      }),
    enabled: hasAdminApi && Boolean(apiEventId) && Boolean(pick),
  });

  useEffect(() => {
    const data = list.data;
    if (!data || !pick) return;
    if (data.capacityId && data.capacityId !== pick.capacityId) return;
    if (data.state && data.state !== pick.state) return;
    if (data.content.length === 0 && data.totalElements > 0 && data.page >= data.totalPages) {
      setPage(Math.max(0, data.totalPages - 1));
    }
  }, [list.data, pick]);

  useEffect(() => {
    if (!isAdminHttp(list.error, 404) || !pick) return;
    setPick(null);
    void capacities.refetch();
    adminToast.error("대회 또는 정원 정보가 없습니다.");
  }, [list.error, pick, capacities]);

  function openList(row: CapacityRow, state: CapacityState) {
    setPage(0);
    setPick({ capacityId: row.capacityId, name: row.name, state });
  }

  function changeState(state: CapacityState) {
    if (!pick || pick.state === state) return;
    setPage(0);
    setPick({ ...pick, state });
  }

  function changePageSize(size: string) {
    setPage(0);
    setPageSize(size);
  }

  function refresh() {
    if (!apiEventId) return;
    void capacities.refetch();
    if (pick) void list.refetch();
  }

  const rows = capacities.data ?? [];
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

  return (
    <div className="admin-page">
      <section className="admin-table-shell">
        <div className="admin-table-shell__head">
          <h1>{event.name} 정원 현황</h1>
          <div className="admin-table-shell__actions">
            {apiEventId ? (
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-toolbar__iconbtn"
                aria-label="새로고침"
                title="새로고침"
                onClick={refresh}
              >
                <RotateCcw size={24} strokeWidth={2.5} />
              </button>
            ) : null}
            <Link href="/admin/capacities" className="admin-btn admin-btn--ghost">
              대회 목록
            </Link>
          </div>
        </div>
        {capacities.isError && rows.length > 0 ? (
          <p className="admin-apps-lead">{errorHint(capacities.error)} 이전 데이터를 유지합니다.</p>
        ) : null}
        <div className="admin-table-wrap">
          {capacities.isLoading ? (
            <p className="admin-empty">불러오는 중…</p>
          ) : rows.length === 0 ? (
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
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>정원명</th>
                  <th>사이즈</th>
                  <th>최대 수용량</th>
                  <th>홀딩</th>
                  <th>확정</th>
                  <th>상태</th>
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
                        .join(" ")}
                    >
                      <td>{capacityTypeLabel(row.type)}</td>
                      <td>{row.name}</td>
                      <td>{dash(row.size)}</td>
                      <td>{formatCount(row.limitCount, unit)}</td>
                      <td>
                        <button
                          type="button"
                          className={`admin-count-btn${picked && pick?.state === "HELD" ? " is-on" : ""}`}
                          onClick={() => openList(row, "HELD")}
                        >
                          {formatCount(row.heldCount, unit)}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`admin-count-btn${picked && pick?.state === "CONFIRMED" ? " is-on" : ""}`}
                          onClick={() => openList(row, "CONFIRMED")}
                        >
                          {formatCount(row.confirmedCount, unit)}
                        </button>
                      </td>
                      <td>
                        {row.active ? (
                          "활성"
                        ) : (
                          <span className="admin-badge admin-badge--plain">비활성</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {pick ? (
        <section className="admin-table-shell">
          <div className="admin-table-shell__head">
            <h1>
              {pick.name} · {pick.state === "HELD" ? "홀딩" : "확정"} 참가자
              {listMatches ? ` · 전체 ${listTotal.toLocaleString()}명` : ""}
            </h1>
          </div>
          <div className="admin-toolbar">
            <p className="admin-toolbar__count">
              검색 결과 총 <strong>{list.isLoading ? "…" : listTotal}</strong>개
            </p>
            <div className="admin-toolbar__fields">
              <AdminSelect
                value={pick.state}
                options={[
                  { value: "HELD" as const, label: "홀딩" },
                  { value: "CONFIRMED" as const, label: "확정" },
                ]}
                onChange={changeState}
                ariaLabel="참가자 상태"
                width={120}
              />
              <AdminSelect
                value={pageSize}
                options={[...PAGE_SIZE_OPTIONS]}
                onChange={changePageSize}
                ariaLabel="페이지 크기"
                width={120}
              />
            </div>
          </div>
          <div className="admin-table-wrap">
            {list.isLoading ? (
              <p className="admin-empty">불러오는 중…</p>
            ) : list.isError && !listMatches ? (
              <div className="admin-empty">
                <p>{errorHint(list.error)}</p>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => void list.refetch()}
                >
                  다시 시도
                </button>
              </div>
            ) : listRows.length === 0 ? (
              <p className="admin-empty">해당 상태의 참가자가 없습니다.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>생년월일</th>
                    <th>전화번호</th>
                    <th>단체명</th>
                  </tr>
                </thead>
                <tbody>
                  {listRows.map((row) => (
                    <tr key={row.registrationId}>
                      <td>{row.name}</td>
                      <td>{dash(row.birth)}</td>
                      <td>{row.phNum}</td>
                      <td>{dash(row.organizationName)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {!list.isLoading && listMatches && listTotal > 0 ? (
            <AdminPagination
              total={listTotal}
              page={page + 1}
              pageCount={listPages}
              onPage={(next) => setPage(next - 1)}
              unit="명"
            />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
