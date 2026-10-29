import type { Metadata } from "next";
import { VirtualRunGuidePage } from "@/components/virtual-run/VirtualRunGuidePage";

export const metadata: Metadata = { title: "인증 가이드" };

export default function Page() {
  return <VirtualRunGuidePage />;
}
