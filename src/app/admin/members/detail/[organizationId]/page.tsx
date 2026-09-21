import type { Metadata } from "next";
import { Suspense } from "react";
import { OrganizationDetailPage } from "@/components/admin/members/OrganizationDetailPage";

type Props = {
  params: Promise<{ organizationId: string }>;
};

export const metadata: Metadata = {
  title: "단체 상세 | 관리자",
};

export default async function Page({ params }: Props) {
  const { organizationId } = await params;
  return (
    <Suspense>
      <OrganizationDetailPage organizationId={organizationId} />
    </Suspense>
  );
}
