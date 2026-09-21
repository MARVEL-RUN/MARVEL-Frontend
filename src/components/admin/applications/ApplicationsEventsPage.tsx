"use client";

import Link from "next/link";
import { hasAdminApi } from "@/lib/admin/config";
import { isAdminHttp } from "@/lib/admin/fetch";
import { fetchAdminEvents } from "@/services/admin/applications";
import { useQuery } from "@tanstack/react-query";

function errorHint(error: unknown) {
  if (isAdminHttp(error, 401) || isAdminHttp(error, 403)) {
    return "관리자 로그인이 필요하거나 권한이 없습니다.";
  }
  return "조회에 실패했습니다.";
}

function dash(value?: string) {
  return value?.trim() ? value : "-";
}

export function ApplicationsEventsPage() {
  const events = useQuery({
    queryKey: ["admin", "events"],
    queryFn: fetchAdminEvents,
    enabled: hasAdminApi,
  });

  const rows = events.data ?? [];
  const empty = !hasAdminApi
    ? "관리자 API 주소가 설정되지 않았습니다."
    : events.isError
      ? errorHint(events.error)
      : "등록된 대회가 없습니다.";

  return (
    <div className="admin-page">
      <section className="admin-table-shell">
        <div className="admin-table-shell__head">
          <h1>신청자관리</h1>
        </div>
        <p className="admin-apps-lead">관리할 대회를 선택하세요.</p>
        <div className="admin-table-wrap">
          {events.isLoading ? (
            <p className="admin-empty">불러오는 중…</p>
          ) : rows.length === 0 ? (
            <div className="admin-empty">
              <p>{empty}</p>
              {hasAdminApi && events.isError ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => void events.refetch()}
                >
                  다시 시도
                </button>
              ) : null}
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>대회</th>
                  <th>상태</th>
                  <th>접수 기간</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((event) => (
                  <tr key={event.eventId}>
                    <td>{event.eventName}</td>
                    <td>{dash(event.registrationType)}</td>
                    <td>{dash(event.registrationPeriod)}</td>
                    <td>
                      <Link
                        className="admin-btn admin-btn--primary"
                        href={`/admin/applications/list?eventId=${encodeURIComponent(event.eventId)}`}
                      >
                        신청자 관리
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
