"use client";

import { OpsGuide } from "@/components/admin/dashboard/OpsGuide";
import { NAVER_ANALYTICS_URL } from "@/lib/admin/analytics";
import { getAdminDashboardStats } from "@/services/admin/stats";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";

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

function SoonBlock() {
  return (
    <div className="admin-dash__soon" role="status">
      <p>준비 중입니다.</p>
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
        <SoonBlock />
      </section>

      <section className="admin-dash__section">
        <h2>날짜별 신청</h2>
        <SoonBlock />
      </section>

      <OpsGuide gaRealtimeUrl={gaRealtimeUrl} />
    </div>
  );
}
