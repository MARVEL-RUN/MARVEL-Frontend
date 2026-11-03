import type { Metadata } from "next";
import { VirtualRunRewardsPage } from "@/components/virtual-run/mypage/VirtualRunRewardsPage";

export const metadata: Metadata = { title: "리워드 내역" };

export default function Page() {
  return <VirtualRunRewardsPage />;
}
