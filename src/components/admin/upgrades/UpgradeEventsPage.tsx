"use client";

import { AdminEventsPicker } from "@/components/admin/AdminEventsPicker";
import { adminUpgradesHrefFromEvent } from "@/lib/admin/eventLinks";
import Link from "next/link";

export function UpgradeEventsPage() {
  return (
    <AdminEventsPicker
      title="패키지 상향"
      lead="상향 대기를 볼 대회를 선택하세요."
      typeHeader="신청 유형"
      renderAction={(event) => (
        <Link className="admin-btn admin-btn--primary" href={adminUpgradesHrefFromEvent(event)}>
          상향 대기
        </Link>
      )}
    />
  );
}
