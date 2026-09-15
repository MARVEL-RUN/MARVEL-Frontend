import { Suspense } from "react";
import { PaymentFailPage } from "@/components/main/payment/PaymentFailPage";

export default function Page() {
  return (
    <Suspense>
      <PaymentFailPage />
    </Suspense>
  );
}
