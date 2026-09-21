"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { InquiryListPage } from "./InquiryListPage";

export function InquiryListRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId")?.trim() ?? "";

  useEffect(() => {
    if (!eventId) {
      router.replace("/admin/boards/inquiry");
    }
  }, [eventId, router]);

  if (!eventId) return null;

  return <InquiryListPage />;
}
