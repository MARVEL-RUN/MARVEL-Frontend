import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplicationsListPage } from "@/components/admin/applications/ApplicationsListPage";

export const metadata: Metadata = {
  title: "신청자 목록 | 관리자",
};

export default function Page() {
  return (
    <Suspense>
      <ApplicationsListPage />
    </Suspense>
  );
}
