"use client";

import { TrendPanel } from "@/components/admin/dashboard/TrendPanel";
import { getAdminDashboardStats } from "@/services/admin/stats";
import { useQuery } from "@tanstack/react-query";
import { Bell, FileText, HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

const ACTIONS = [
  {
    href: "/admin/boards/notice",
    title: "공지사항",
    description: "공식 공지 등록·수정",
    icon: Bell,
  },
  {
    href: "/admin/boards/inquiry",
    title: "문의사항",
    description: "문의 확인·답변",
    icon: MessageSquare,
  },
  {
    href: "/admin/boards/faq/write",
    title: "FAQ 등록",
    description: "자주 묻는 질문 작성",
    icon: HelpCircle,
  },
  {
    href: "/admin/legal/terms",
    title: "이용약관",
    description: "약관 조항 수정",
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
      <header className="admin-dash__head">
        <h1>운영 홈</h1>
        <p>마블런 2026 운영 현황을 한눈에 확인합니다.</p>
      </header>

      <div className="admin-stat-row">
        <Link href="/admin/applications/individual" className="admin-stat">
          <span>개인 신청</span>
          <strong>{n(data?.individualCount)}</strong>
          <em>신청 내역 보기</em>
        </Link>
        <Link href="/admin/boards/inquiry" className="admin-stat">
          <span>미답변 문의</span>
          <strong>{n(data?.unansweredCount)}</strong>
          <em>문의 처리하기</em>
        </Link>
        <Link href="/admin/boards/faq" className="admin-stat">
          <span>FAQ</span>
          <strong>{n(data?.faqCount)}</strong>
          <em>FAQ 관리</em>
        </Link>
        <Link href="/admin/boards/notice" className="admin-stat">
          <span>공지</span>
          <strong>{n(data?.noticeCount)}</strong>
          <em>공지 관리</em>
        </Link>
      </div>

      <div className="admin-trend-grid">
        <TrendPanel kind="visitor" title="방문자 현황" unit="명" />
        <TrendPanel kind="applicant" title="신청자 현황" unit="건" />
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <h2>바로가기</h2>
          <div className="admin-quick">
            {ACTIONS.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="admin-quick__icon">
                  <item.icon size={16} />
                </span>
                <span className="admin-quick__text">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="admin-card">
          <h2>처리할 업무</h2>
          <div className="admin-quick">
            <Link href="/admin/boards/inquiry">
              <span className="admin-quick__text">
                <strong>문의사항</strong>
                <span>
                  {n(data?.inquiryCount)}건 · 미답변 {n(data?.unansweredCount)}
                </span>
              </span>
            </Link>
            <Link href="/admin/applications/individual">
              <span className="admin-quick__text">
                <strong>개인 접수</strong>
                <span>{n(data?.individualCount)}건</span>
              </span>
            </Link>
            <Link href="/admin/applications/individual">
              <span className="admin-quick__text">
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
