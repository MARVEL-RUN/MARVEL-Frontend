import type { Metadata } from "next";
import { Suspense } from "react";
import { CapacitiesListRoute } from "@/components/admin/capacities/CapacitiesListRoute";

export const metadata: Metadata = {
  title: "정원 현황 | 관리자",
};

export default function Page() {
  return (
    <Suspense>
      <CapacitiesListRoute />
    </Suspense>
  );
}
