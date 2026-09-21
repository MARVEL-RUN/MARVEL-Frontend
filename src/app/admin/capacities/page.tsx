import type { Metadata } from "next";
import { CapacitiesEventsPage } from "@/components/admin/capacities/CapacitiesEventsPage";

export const metadata: Metadata = {
  title: "정원 현황 | 관리자",
};

export default function Page() {
  return <CapacitiesEventsPage />;
}
