import type { Metadata } from "next";
import { VirtualRunInquiryPage } from "@/components/virtual-run/community/inquiry/VirtualRunInquiryPage";

export const metadata: Metadata = { title: "문의사항" };

export default function Page() {
  return <VirtualRunInquiryPage />;
}
