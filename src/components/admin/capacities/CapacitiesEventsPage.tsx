"use client";

import { AdminEventsPicker } from "@/components/admin/AdminEventsPicker";
import { adminCapacitiesHrefFromEvent } from "@/lib/admin/eventLinks";
import Link from "next/link";

export function CapacitiesEventsPage() {
  return (
    <AdminEventsPicker
      title="정원 현황"
      lead="정원을 확인할 대회를 선택하세요."
      typeHeader="신청 유형"
      renderAction={(event) => {
        const href = adminCapacitiesHrefFromEvent(event);
        if (!href) {
          return <span className="admin-muted">정원 없음</span>;
        }
        return (
          <Link className="admin-btn admin-btn--primary" href={href}>
            정원 현황
          </Link>
        );
      }}
    />
  );
}
