import type { Metadata } from "next";
import { VirtualRunMypageHub } from "@/components/virtual-run/VirtualRunMypageHub";

export const metadata: Metadata = { title: "마이페이지" };

export default function Page() {
  return <VirtualRunMypageHub />;
}
