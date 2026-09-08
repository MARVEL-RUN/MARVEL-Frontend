import { InquiryDetailPage } from "@/components/admin/boards/inquiry/InquiryDetailPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <InquiryDetailPage />
    </Suspense>
  );
}
