import type { Metadata } from "next";
import { MembersEventsPage } from "@/components/admin/members/MembersEventsPage";

export const metadata: Metadata = {
  title: "단체회원 관리 | 관리자",
};

export default function Page() {
  return <MembersEventsPage />;
}
