import type { Metadata } from "next";
import { VirtualRunGuideRunningPage } from "@/components/virtual-run/guide/VirtualRunGuideRunningPage";

export const metadata: Metadata = { title: "러닝 인증 가이드" };

export default function Page() {
  return <VirtualRunGuideRunningPage />;
}
