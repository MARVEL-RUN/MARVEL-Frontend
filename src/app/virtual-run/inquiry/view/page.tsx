import { VirtualRunInquiryViewPage } from "@/components/virtual-run/community/inquiry/VirtualRunInquiryViewPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <VirtualRunInquiryViewPage />
    </Suspense>
  );
}
