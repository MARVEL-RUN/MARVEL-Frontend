import type { Metadata } from "next";
import { RegisterPage } from "@/components/main/register/RegisterPage";

export const metadata: Metadata = {
  title: "참가신청",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RegisterPage />;
}
