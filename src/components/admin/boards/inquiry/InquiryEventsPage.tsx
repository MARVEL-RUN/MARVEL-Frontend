"use client";

import { AdminEventsPicker } from "@/components/admin/AdminEventsPicker";
import { adminInquiriesHrefFromEvent } from "@/lib/admin/eventLinks";
import Link from "next/link";

export function InquiryEventsPage() {
  return (
    <AdminEventsPicker
      title="문의사항"
      lead="문의를 확인할 대회를 선택하세요."
      typeHeader="접수 유형"
      renderAction={(event) => (
        <Link
          className="admin-btn admin-btn--primary"
          href={adminInquiriesHrefFromEvent(event)}
        >
          문의사항
        </Link>
      )}
    />
  );
}
