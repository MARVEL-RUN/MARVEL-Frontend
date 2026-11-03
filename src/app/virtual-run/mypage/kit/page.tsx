import type { Metadata } from "next";
import { VirtualRunKitMypage } from "@/components/virtual-run/mypage/VirtualRunKitMypage";

export const metadata: Metadata = { title: "키트 카드" };

export default function Page() {
  return <VirtualRunKitMypage />;
}
