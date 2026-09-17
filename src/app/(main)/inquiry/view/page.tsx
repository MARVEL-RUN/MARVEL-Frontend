import { InquiryViewPage } from "@/components/main/inquiry/InquiryViewPage";
import { Suspense } from "react";

function InquiryViewFallback() {
  return (
    <main className="page page--post">
      <div className="page__body wrap wrap--narrow">
        <div className="post post--loading" aria-busy="true">
          <p className="board__empty">불러오는 중...</p>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<InquiryViewFallback />}>
      <InquiryViewPage />
    </Suspense>
  );
}
