import { Suspense } from "react";
import { PaymentSuccessPage } from "@/components/main/payment/PaymentSuccessPage";

export default function Page() {
  return (
    <Suspense>
      <PaymentSuccessPage />
    </Suspense>
  );
}
