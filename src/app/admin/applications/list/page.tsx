import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplicationsListRoute } from "@/components/admin/applications/ApplicationsListRoute";

export const metadata: Metadata = {
  title: "신청자 목록 | 관리자",
};

export default function Page() {
  return (
    <Suspense>
      <ApplicationsListRoute />
    </Suspense>
  );
}
