"use client";

import { AdminEventsPicker } from "@/components/admin/AdminEventsPicker";
import { adminNoticesHrefFromEvent } from "@/lib/admin/eventLinks";
import Link from "next/link";

export function NoticeEventsPage() {
  return (
    <AdminEventsPicker
      title="공지사항"
      lead="공지를 확인할 대회를 선택하세요."
      typeHeader="접수 유형"
      renderAction={(event) => (
        <Link
          className="admin-btn admin-btn--primary"
          href={adminNoticesHrefFromEvent(event)}
        >
          공지사항
        </Link>
      )}
    />
  );
}
