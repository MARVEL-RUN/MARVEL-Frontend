import type { Metadata } from "next";
import { RegisterSubmittedPage } from "@/components/main/register/RegisterSubmittedPage";

export const metadata: Metadata = {
  title: "신청 완료",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RegisterSubmittedPage />;
}
