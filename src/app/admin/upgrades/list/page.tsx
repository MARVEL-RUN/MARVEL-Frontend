import type { Metadata } from "next";
import { Suspense } from "react";
import { UpgradeListRoute } from "@/components/admin/upgrades/UpgradeListRoute";

export const metadata: Metadata = {
  title: "패키지 상향 | 관리자",
};

export default function Page() {
  return (
    <Suspense>
      <UpgradeListRoute />
    </Suspense>
  );
}
