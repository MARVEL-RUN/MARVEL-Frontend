import type { Metadata } from "next";
import { VirtualRunMypageDashboard } from "@/components/virtual-run/mypage/VirtualRunMypageDashboard";

export const metadata: Metadata = { title: "마이페이지" };

export default function Page() {
  return <VirtualRunMypageDashboard />;
}
