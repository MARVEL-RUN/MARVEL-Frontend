import type { Metadata } from "next";
import { InquiryPage } from "@/components/main/inquiry/InquiryPage";

export const metadata: Metadata = {
  title: "문의하기",
};

export default function Page() {
  return <InquiryPage />;
}
