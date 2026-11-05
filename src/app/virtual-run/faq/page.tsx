import type { Metadata } from "next";
import { VirtualRunFaqPage } from "@/components/virtual-run/community/faq/VirtualRunFaqPage";

export const metadata: Metadata = { title: "자주 묻는 질문" };

export default function Page() {
  return <VirtualRunFaqPage />;
}
