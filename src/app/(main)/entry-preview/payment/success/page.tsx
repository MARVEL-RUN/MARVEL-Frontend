import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentSuccessPage } from "@/components/main/payment/PaymentSuccessPage";

export const metadata: Metadata = {
  title: "결제 완료",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense>
      <PaymentSuccessPage />
    </Suspense>
  );
}
