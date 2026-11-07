"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { NoticesAdminPage } from "./NoticeListPage";

export function NoticeListRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId")?.trim() ?? "";

  useEffect(() => {
    if (!eventId) {
      router.replace("/admin/boards/notice");
    }
  }, [eventId, router]);

  if (!eventId) return null;

  return <NoticesAdminPage />;
}
