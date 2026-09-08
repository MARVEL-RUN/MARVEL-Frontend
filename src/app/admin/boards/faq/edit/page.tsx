import { FaqWritePage } from "@/components/admin/boards/faq/FaqWritePage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <FaqWritePage mode="edit" />
    </Suspense>
  );
}
