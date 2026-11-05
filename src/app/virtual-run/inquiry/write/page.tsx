import { VirtualRunInquiryWritePage } from "@/components/virtual-run/community/inquiry/VirtualRunInquiryWritePage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <VirtualRunInquiryWritePage />
    </Suspense>
  );
}
