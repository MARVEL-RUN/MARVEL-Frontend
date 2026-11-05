import type { Metadata } from "next";
import { Suspense } from "react";
import { VirtualRunNoticeDetailPage } from "@/components/virtual-run/community/notices/VirtualRunNoticeDetailPage";

export const metadata: Metadata = { title: "공지사항" };

export default function Page() {
  return (
    <Suspense>
      <VirtualRunNoticeDetailPage />
    </Suspense>
  );
}
