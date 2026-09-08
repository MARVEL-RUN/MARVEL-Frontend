import { NoticeWritePage } from "@/components/admin/boards/notice/NoticeWritePage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <NoticeWritePage mode="edit" />
    </Suspense>
  );
}
