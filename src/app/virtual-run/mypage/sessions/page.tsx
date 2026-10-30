import type { Metadata } from "next";
import { VirtualRunSessionsPage } from "@/components/virtual-run/mypage/sessions/VirtualRunSessionsPage";

export const metadata: Metadata = { title: "회차 카드" };

export default function Page() {
  return <VirtualRunSessionsPage />;
}
