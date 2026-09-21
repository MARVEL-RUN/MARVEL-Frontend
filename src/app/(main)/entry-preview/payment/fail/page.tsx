import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentFailPage } from "@/components/main/payment/PaymentFailPage";

export const metadata: Metadata = {
  title: "결제 실패",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense>
      <PaymentFailPage />
    </Suspense>
  );
}
