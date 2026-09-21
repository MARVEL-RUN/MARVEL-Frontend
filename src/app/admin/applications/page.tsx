import type { Metadata } from "next";
import { ApplicationsEventsPage } from "@/components/admin/applications/ApplicationsEventsPage";

export const metadata: Metadata = {
  title: "전체 신청자 관리 | 관리자",
};

export default function Page() {
  return <ApplicationsEventsPage />;
}
