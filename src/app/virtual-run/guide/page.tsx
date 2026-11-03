import type { Metadata } from "next";
import { VirtualRunGuideHubPage } from "@/components/virtual-run/guide/VirtualRunGuideHubPage";

export const metadata: Metadata = { title: "인증 가이드" };

export default function Page() {
  return <VirtualRunGuideHubPage />;
}
