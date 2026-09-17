import { InquiryWritePage } from "@/components/main/inquiry/InquiryWritePage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <InquiryWritePage />
    </Suspense>
  );
}
