"use client";

import { TrendPanel } from "@/components/admin/dashboard/TrendPanel";
import { NAVER_ANALYTICS_URL } from "@/lib/admin/analytics";
import { adminApplicationsHref } from "@/lib/admin/eventLinks";
import {
  getAdminDashboardStats,
  type EventIntakeStats,
} from "@/services/admin/stats";
import { useQuery } from "@tanstack/react-query";
import { Ban, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";

const APPS = "/admin/applications";

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

function IntakeCard({
  stats,
  loading,
}: {
  stats: EventIntakeStats;
  loading: boolean;
}) {
  const n = (value?: number) => (loading ? "…" : (value ?? 0).toLocaleString());
  const hero =
    stats.slug === "virtual"
      ? { label: "참가 확정", value: stats.confirmedCount }
      : { label: "총 인원", value: stats.participantCount };
  const side: [string, number | undefined][] =
    stats.slug === "virtual"
      ? [
          ["1차", stats.roundCounts[0]],
          ["2차", stats.roundCounts[1]],
          ["3차", stats.roundCounts[2]],
        ]
      : [
          ["개인", stats.individualCount],
          ["단체", stats.groupCount],
          ["참가 확정", stats.confirmedCount],
        ];

  return (
    <Link href={adminApplicationsHref(stats.eventId)} className="admin-intake__card">
      <span className="admin-intake__head">
        <strong>{stats.eventName}</strong>
        <ChevronRight className="admin-intake__go" size={16} strokeWidth={2} />
      </span>
      <span className="admin-intake__body">
        <span className="admin-intake__hero">
          <b>{n(hero.value)}</b>
          <em>{hero.label}</em>
        </span>
        <span className="admin-intake__side">
          {side.map(([label, value]) => (
            <span key={label}>
              <em>{label}</em>
              <b>{n(value)}</b>
            </span>
          ))}
        </span>
      </span>
    </Link>
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

  const cancelHref = data?.cancellationPendingEventId
    ? adminApplicationsHref(
        data.cancellationPendingEventId,
        "status=CANCELLATION_PENDING",
      )
    : APPS;

  const intakeEvents = data?.events ?? [];

  return (
    <div className="admin-page">
      <header className="admin-dash__head">
        <div>
          <h1>운영 홈</h1>
          <p>오늘 처리할 일과 접수 현황을 확인합니다.</p>
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
          <TaskLink
            href={cancelHref}
            tone="cancel"
            icon={Ban}
            label="환불 대기"
            count={data?.cancellationPendingCount}
            loading={isLoading}
          />
        </div>
      </section>

      <section className="admin-dash__section">
        <h2>접수 현황</h2>
        <div className="admin-intake">
          {isLoading && intakeEvents.length === 0 ? (
            <p className="admin-empty">불러오는 중…</p>
          ) : intakeEvents.length > 0 ? (
            intakeEvents.map((event) => (
              <IntakeCard key={event.eventId} stats={event} loading={isLoading} />
            ))
          ) : (
            <p className="admin-empty">등록된 대회가 없습니다.</p>
          )}
        </div>
      </section>

      <div className="admin-trend-grid">
        <TrendPanel kind="visitor" title="방문자 현황" unit="명" />
        <TrendPanel kind="applicant" title="신청자 현황" unit="건" />
      </div>
    </div>
  );
}
