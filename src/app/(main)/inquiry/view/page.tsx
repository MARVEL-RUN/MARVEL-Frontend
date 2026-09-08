import { InquiryViewPage } from "@/components/main/inquiry/InquiryViewPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <InquiryViewPage />
    </Suspense>
  );
}
