import { NoticeDetailPage } from "@/components/main/notices/NoticeDetailPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <NoticeDetailPage />
    </Suspense>
  );
}
