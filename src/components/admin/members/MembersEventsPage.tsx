"use client";

import { AdminEventsPicker } from "@/components/admin/AdminEventsPicker";
import { adminMembersHrefFromEvent } from "@/lib/admin/eventLinks";
import Link from "next/link";

export function MembersEventsPage() {
  return (
    <AdminEventsPicker
      title="회원 관리"
      lead="관리할 대회를 선택하세요."
      typeHeader="접수 유형"
      renderAction={(event) => (
        <Link className="admin-btn admin-btn--primary" href={adminMembersHrefFromEvent(event)}>
          회원 관리
        </Link>
      )}
    />
  );
}
