import type { Metadata } from "next";
import { VirtualRunGuideFaqPage } from "@/components/virtual-run/guide/VirtualRunGuideFaqPage";

export const metadata: Metadata = { title: "FAQ" };

export default function Page() {
  return <VirtualRunGuideFaqPage />;
}
