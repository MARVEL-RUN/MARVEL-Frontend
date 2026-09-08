"use client";

import { getAdminDashboardStats } from "@/services/admin/stats";
import { useQuery } from "@tanstack/react-query";
import { Bell, FileText, Users, UsersRound } from "lucide-react";
import Link from "next/link";

const ACTIONS = [
  {
    href: "/admin/applications/individual",
    title: "개인 신청",
    description: "개인 접수 내역 확인",
    icon: Users,
  },
  {
    href: "/admin/applications/group",
    title: "단체 신청",
    description: "단체 접수·인원 관리",
    icon: UsersRound,
  },
  {
    href: "/admin/notices",
    title: "공지사항",
    description: "공식 공지 확인·작성",
    icon: Bell,
  },
  {
    href: "/admin/content/sponsors",
    title: "스폰서",
    description: "주최·주관 노출 관리",
    icon: FileText,
  },
];

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getAdminDashboardStats,
  });

  const n = (value?: number) => (isLoading ? "…" : (value ?? 0).toLocaleString());

  return (
    <div className="admin-page">
      <header className="admin-hero">
        <p className="admin-hero__kicker">ADMIN CONTROL CENTER</p>
        <h1>관리자 대시보드</h1>
        <div className="admin-hero__pills">
          <div className="admin-pill">
            <span>개인 신청</span>
            <strong>{n(data?.individualCount)}</strong>
          </div>
          <div className="admin-pill">
            <span>단체 신청</span>
            <strong>{n(data?.groupCount)}</strong>
          </div>
          <div className="admin-pill">
            <span>결제 대기</span>
            <strong>{n(data?.pendingCount)}</strong>
          </div>
          <div className="admin-pill">
            <span>공지</span>
            <strong>{n(data?.noticeCount)}</strong>
          </div>
        </div>
      </header>

      <div className="admin-grid">
        <section className="admin-card">
          <h2>빠른 실행</h2>
          <div className="admin-quick">
            {ACTIONS.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="admin-quick__icon">
                  <item.icon size={16} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="admin-card">
          <h2>처리 현황</h2>
          <div className="admin-quick">
            <Link href="/admin/applications/individual">
              <span>
                <strong>개인 접수</strong>
                <span>{n(data?.individualCount)}건</span>
              </span>
            </Link>
            <Link href="/admin/applications/group">
              <span>
                <strong>단체 인원</strong>
                <span>{n(data?.participantCount)}명</span>
              </span>
            </Link>
            <Link href="/admin/applications/individual">
              <span>
                <strong>결제 대기</strong>
                <span>{n(data?.pendingCount)}건</span>
              </span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
