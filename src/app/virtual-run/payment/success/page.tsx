import { Suspense } from "react";
import { VirtualRunPaymentSuccessPage } from "@/components/virtual-run/tickets/VirtualRunPaymentSuccessPage";

export default function Page() {
  return (
    <Suspense>
      <VirtualRunPaymentSuccessPage />
    </Suspense>
  );
}
