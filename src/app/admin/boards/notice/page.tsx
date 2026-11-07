import type { Metadata } from "next";
import { NoticeEventsPage } from "@/components/admin/boards/notice/NoticeEventsPage";

export const metadata: Metadata = {
  title: "공지사항 | 관리자",
};

export default function Page() {
  return <NoticeEventsPage />;
}
