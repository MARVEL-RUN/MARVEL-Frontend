import { Suspense } from "react";
import { VirtualRunPaymentFailPage } from "@/components/virtual-run/tickets/VirtualRunPaymentFailPage";

export default function Page() {
  return (
    <Suspense>
      <VirtualRunPaymentFailPage />
    </Suspense>
  );
}
