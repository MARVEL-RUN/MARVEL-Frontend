"use client";

import { DailyReportDownload } from "@/components/admin/dashboard/DailyReportDownload";
import { PaymentDailyGraph } from "@/components/admin/dashboard/PaymentDailyGraph";
import { OpsGuide } from "@/components/admin/dashboard/OpsGuide";
import { RegistrationStatsTables } from "@/components/admin/dashboard/RegistrationStatsTables";
import { NAVER_ANALYTICS_URL } from "@/lib/admin/analytics";
import { hasAdminApi } from "@/lib/admin/config";
import {
  fetchRegistrationStatistics,
  getAdminDashboardStats,
} from "@/services/admin/stats";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import "./dashboard-stats.css";

function EventStatsPanel({
  eventId,
  eventName,
  defaultExpanded,
  children,
}: {
  eventId: string;
  eventName: string;
  defaultExpanded: boolean;
  children: ReactNode;
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
          <PaymentDailyGraph eventId={eventId} />
          <DailyReportDownload eventId={eventId} />
          {children}
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
}: {
  events: { eventId: string; eventName: string }[];
  loadingEvents: boolean;
}) {
  const statsQueries = useQueries({
    queries: events.map((event) => ({
      queryKey: ["admin", "registration-statistics", event.eventId],
      queryFn: () => fetchRegistrationStatistics(event.eventId),
      enabled: hasAdminApi && Boolean(event.eventId),
    })),
  });

  if (!hasAdminApi) {
    return <p className="admin-empty">관리자 API 주소가 설정되지 않았습니다.</p>;
  }

  if (loadingEvents) {
    return <p className="admin-empty">불러오는 중…</p>;
  }

  if (events.length === 0) {
    return <p className="admin-empty">등록된 대회가 없습니다.</p>;
  }

  const loading = statsQueries.some((query) => query.isLoading);
  const allFailed = statsQueries.every((query) => query.isError);
  const anyData = statsQueries.some((query) => query.data);

  if (loading && !anyData) {
    return <p className="admin-empty">불러오는 중…</p>;
  }

  if (allFailed && !anyData) {
    return <p className="admin-empty">접수 현황을 불러오지 못했습니다.</p>;
  }

  return (
    <div className="admin-reg-stats-stack">
      {events.map((event, index) => {
        const query = statsQueries[index];
        if (!query?.data) {
          if (query?.isError) {
            return (
              <p key={event.eventId} className="admin-empty">
                {event.eventName} 통계를 불러오지 못했습니다.
              </p>
            );
          }
          return null;
        }
        return (
          <EventStatsPanel
            key={event.eventId}
            eventId={event.eventId}
            eventName={event.eventName}
            defaultExpanded={index === 0}
          >
            <RegistrationStatsTables data={query.data} />
          </EventStatsPanel>
        );
      })}
    </div>
  );
}

export function DashboardPage({
  gaRealtimeUrl,
}: {
  gaRealtimeUrl?: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getAdminDashboardStats,
  });

  const events = data?.events ?? [];

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
            count={data?.unansweredCount}
            loading={isLoading}
          />
        </div>
      </section>

      <section className="admin-dash__section">
        <h2>접수 현황</h2>
        <IntakeStatsSection events={events} loadingEvents={isLoading} />
      </section>

      <OpsGuide gaRealtimeUrl={gaRealtimeUrl} />
    </div>
  );
}
