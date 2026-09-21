import type { Metadata } from "next";
import { Suspense } from "react";
import { MembersListRoute } from "@/components/admin/members/MembersListRoute";

export const metadata: Metadata = {
  title: "단체 회원 목록 | 관리자",
};

export default function Page() {
  return (
    <Suspense>
      <MembersListRoute />
    </Suspense>
  );
}
