import type { Metadata } from "next";
import { VirtualRunGuideKitPage } from "@/components/virtual-run/guide/VirtualRunGuideKitPage";

export const metadata: Metadata = { title: "키트 인증 가이드" };

export default function Page() {
  return <VirtualRunGuideKitPage />;
}
