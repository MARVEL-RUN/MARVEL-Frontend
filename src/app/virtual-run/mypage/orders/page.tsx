import type { Metadata } from "next";
import { VirtualRunOrdersPage } from "@/components/virtual-run/mypage/VirtualRunOrdersPage";

export const metadata: Metadata = { title: "내 주문" };

export default function Page() {
  return <VirtualRunOrdersPage />;
}
