"use client";

import { hasAdminApi } from "@/lib/admin/config";
import { isAdminHttp } from "@/lib/admin/fetch";
import { fetchAdminEvents, type AdminEvent } from "@/services/admin/applications";
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

type Props = {
  title: string;
  lead: string;
  typeHeader?: string;
  renderAction: (event: AdminEvent) => React.ReactNode;
};

export function AdminEventsPicker({
  title,
  lead,
  typeHeader = "상태",
  renderAction,
}: Props) {
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
          <h1>{title}</h1>
        </div>
        <p className="admin-apps-lead">{lead}</p>
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
                  <th>{typeHeader}</th>
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
                    <td>{renderAction(event)}</td>
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
