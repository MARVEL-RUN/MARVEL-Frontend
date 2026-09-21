import type { Metadata } from "next";
import { PaymentPage } from "@/components/main/payment/PaymentPage";

export const metadata: Metadata = {
  title: "결제",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PaymentPage />;
}
