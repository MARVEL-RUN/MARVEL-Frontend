import type { Metadata } from "next";
import { Suspense } from "react";
import { NoticeListRoute } from "@/components/admin/boards/notice/NoticeListRoute";

export const metadata: Metadata = {
  title: "공지 목록 | 관리자",
};

export default function Page() {
  return (
    <Suspense>
      <NoticeListRoute />
    </Suspense>
  );
}
