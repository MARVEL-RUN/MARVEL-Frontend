import type { Metadata } from "next";
import { Suspense } from "react";
import { OrganizationDetailPage } from "@/components/admin/members/OrganizationDetailPage";

export const metadata: Metadata = {
  title: "단체 상세 | 관리자",
};

export default function Page() {
  return (
    <Suspense>
      <OrganizationDetailPage />
    </Suspense>
  );
}
