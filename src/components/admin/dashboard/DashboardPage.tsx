"use client";

import { DailyReportDownload } from "@/components/admin/dashboard/DailyReportDownload";
import { PaymentDailyGraph } from "@/components/admin/dashboard/PaymentDailyGraph";
import { OpsGuide } from "@/components/admin/dashboard/OpsGuide";
import { RegistrationStatsTables } from "@/components/admin/dashboard/RegistrationStatsTables";
import { StatsLoading } from "@/components/admin/dashboard/StatsLoading";
import { NAVER_ANALYTICS_URL } from "@/lib/admin/analytics";
import { hasAdminApi } from "@/lib/admin/config";
import { fetchAdminEvents } from "@/services/admin/applications";
import {
  fetchRegistrationStatistics,
  fetchUnansweredCount,
} from "@/services/admin/stats";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import "./dashboard-stats.css";

/** API 안정화 전까지 운영 홈 일별 그래프·엑셀 비표시 */
const INTAKE_DAILY_TOOLS_ENABLED = true;

function EventStatsTables({ eventId, eventName }: { eventId: string; eventName: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "registration-statistics", eventId],
    queryFn: () => fetchRegistrationStatistics(eventId),
    enabled: hasAdminApi && Boolean(eventId),
  });

  if (isLoading) return <StatsLoading label="접수 통계를 불러오는 중입니다" />;
  if (isError || !data) {
    return <p className="admin-empty">{eventName} 통계를 불러오지 못했습니다.</p>;
  }
  return <RegistrationStatsTables data={data} />;
}

function EventStatsPanel({
  eventId,
  eventName,
  defaultExpanded,
}: {
  eventId: string;
  eventName: string;
  defaultExpanded: boolean;
}) {
  const [open, setOpen] = useState(defaultExpanded);

  return (
    <div className={`admin-reg-stats-event${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="admin-reg-stats-event__head"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="admin-reg-stats-event__title">{eventName}</span>
        <ChevronDown size={18} className="admin-reg-stats-event__chev" aria-hidden />
      </button>
      {open ? (
        <div className="admin-reg-stats-event__body">
          {INTAKE_DAILY_TOOLS_ENABLED ? (
            <>
              <PaymentDailyGraph eventId={eventId} />
              <DailyReportDownload eventId={eventId} />
            </>
          ) : null}
          <EventStatsTables eventId={eventId} eventName={eventName} />
        </div>
      ) : null}
    </div>
  );
}

function TaskLink({
  href,
  tone,
  icon: Icon,
  label,
  count,
  loading,
}: {
  href: string;
  tone: string;
  icon: typeof MessageSquare;
  label: string;
  count?: number;
  loading: boolean;
}) {
  const on = !loading && (count ?? 0) > 0;
  return (
    <Link
      href={href}
      className={`admin-task admin-task--${tone}${on ? " is-on" : ""}`}
    >
      <span className="admin-task__mark">
        <Icon size={16} strokeWidth={2.2} />
      </span>
      <span className="admin-task__label">{label}</span>
      <strong>{loading ? "…" : (count ?? 0).toLocaleString()}</strong>
      <ChevronRight className="admin-task__go" size={16} strokeWidth={2} />
    </Link>
  );
}

function IntakeStatsSection({
  events,
  loadingEvents,
  eventsFailed,
}: {
  events: { eventId: string; eventName: string }[];
  loadingEvents: boolean;
  eventsFailed: boolean;
}) {
  if (!hasAdminApi) {
    return <p className="admin-empty">관리자 API 주소가 설정되지 않았습니다.</p>;
  }

  if (loadingEvents) {
    return <StatsLoading label="대회 목록을 불러오는 중입니다" />;
  }

  if (eventsFailed) {
    return <p className="admin-empty">접수 현황을 불러오지 못했습니다.</p>;
  }

  if (events.length === 0) {
    return <p className="admin-empty">등록된 대회가 없습니다.</p>;
  }

  return (
    <div className="admin-reg-stats-stack">
      {events.map((event, index) => (
        <EventStatsPanel
          key={event.eventId}
          eventId={event.eventId}
          eventName={event.eventName}
          defaultExpanded={index === 0}
        />
      ))}
    </div>
  );
}

export function DashboardPage({
  gaRealtimeUrl,
}: {
  gaRealtimeUrl?: string;
}) {
  const eventsQuery = useQuery({
    queryKey: ["admin", "events"],
    queryFn: fetchAdminEvents,
    enabled: hasAdminApi,
  });

  const events = eventsQuery.data ?? [];
  const eventIds = events.map((event) => event.eventId);

  const unansweredQuery = useQuery({
    queryKey: ["admin", "dashboard", "unanswered", eventIds],
    queryFn: () => fetchUnansweredCount(eventIds),
    enabled: hasAdminApi && eventsQuery.isSuccess,
  });

  return (
    <div className="admin-page">
      <header className="admin-dash__head">
        <div>
          <h1>운영 홈</h1>
          <p>오늘 처리할 일을 확인합니다.</p>
        </div>
        <div className="admin-dash__links">
          {gaRealtimeUrl ? (
            <a href={gaRealtimeUrl} target="_blank" rel="noopener noreferrer">
              GA 실시간
            </a>
          ) : null}
          <a href={NAVER_ANALYTICS_URL} target="_blank" rel="noopener noreferrer">
            네이버 애널리틱스
          </a>
        </div>
      </header>

      <section className="admin-dash__section">
        <h2>오늘 할 일</h2>
        <div className="admin-task-board">
          <TaskLink
            href="/admin/boards/inquiry"
            tone="inquiry"
            icon={MessageSquare}
            label="미답변 문의"
            count={unansweredQuery.data}
            loading={eventsQuery.isLoading || unansweredQuery.isLoading}
          />
        </div>
      </section>

      <section className="admin-dash__section">
        <h2>접수 현황</h2>
        <IntakeStatsSection
          events={events}
          loadingEvents={eventsQuery.isLoading}
          eventsFailed={eventsQuery.isError}
        />
      </section>

      <OpsGuide gaRealtimeUrl={gaRealtimeUrl} />
    </div>
  );
}
