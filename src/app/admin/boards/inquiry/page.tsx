import type { Metadata } from "next";
import { InquiryEventsPage } from "@/components/admin/boards/inquiry/InquiryEventsPage";

export const metadata: Metadata = {
  title: "문의사항 | 관리자",
};

export default function Page() {
  return <InquiryEventsPage />;
}
