"use client";

import { AdminEventsPicker } from "@/components/admin/AdminEventsPicker";
import { adminApplicationsHrefFromEvent } from "@/lib/admin/eventLinks";
import Link from "next/link";

export function ApplicationsEventsPage() {
  return (
    <AdminEventsPicker
      title="전체 신청자 관리"
      lead="관리할 대회를 선택하세요."
      renderAction={(event) => (
        <Link
          className="admin-btn admin-btn--primary"
          href={adminApplicationsHrefFromEvent(event)}
        >
          전체 신청자 관리
        </Link>
      )}
    />
  );
}
