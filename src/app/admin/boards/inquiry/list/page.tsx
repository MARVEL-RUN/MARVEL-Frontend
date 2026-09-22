import type { Metadata } from "next";
import { Suspense } from "react";
import { InquiryListRoute } from "@/components/admin/boards/inquiry/InquiryListRoute";

export const metadata: Metadata = {
  title: "문의 목록 | 관리자",
};

export default function Page() {
  return (
    <Suspense>
      <InquiryListRoute />
    </Suspense>
  );
}
