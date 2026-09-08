"use client";

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
      <header className="admin-hero">
        <p className="admin-hero__kicker">ADMIN CONTROL CENTER</p>
        <h1>관리자 대시보드</h1>
        <div className="admin-hero__pills">
          <div className="admin-pill">
            <span>개인 신청</span>
            <strong>{n(data?.individualCount)}</strong>
          </div>
          <div className="admin-pill">
            <span>미답변 문의</span>
            <strong>{n(data?.unansweredCount)}</strong>
          </div>
          <div className="admin-pill">
            <span>FAQ</span>
            <strong>{n(data?.faqCount)}</strong>
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
            <Link href="/admin/boards/inquiry">
              <span>
                <strong>문의사항</strong>
                <span>
                  {n(data?.inquiryCount)}건 · 미답변 {n(data?.unansweredCount)}
                </span>
              </span>
            </Link>
            <Link href="/admin/applications/individual">
              <span>
                <strong>개인 접수</strong>
                <span>{n(data?.individualCount)}건</span>
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
