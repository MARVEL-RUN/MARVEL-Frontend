import type { Metadata } from "next";
import { UpgradeEventsPage } from "@/components/admin/upgrades/UpgradeEventsPage";

export const metadata: Metadata = {
  title: "패키지 상향 | 관리자",
};

export default function Page() {
  return <UpgradeEventsPage />;
}
