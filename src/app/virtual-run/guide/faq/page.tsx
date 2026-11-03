import type { Metadata } from "next";
import { VirtualRunGuideFaqPage } from "@/components/virtual-run/guide/VirtualRunGuideFaqPage";

export const metadata: Metadata = { title: "자주 묻는 질문" };

export default function Page() {
  return <VirtualRunGuideFaqPage />;
}
