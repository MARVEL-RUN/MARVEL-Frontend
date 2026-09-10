import type { Metadata } from "next";
import { ApplicationsEventsPage } from "@/components/admin/applications/ApplicationsEventsPage";

export const metadata: Metadata = {
  title: "신청자관리 | 관리자",
};

export default function Page() {
  return <ApplicationsEventsPage />;
}
