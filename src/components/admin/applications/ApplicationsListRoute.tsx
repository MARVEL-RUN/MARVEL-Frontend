"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ApplicationsListPage } from "./ApplicationsListPage";

/** API eventId 전용. slug(marvel/virtual)는 [eventId] 라우트 */
export function ApplicationsListRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId")?.trim() ?? "";

  useEffect(() => {
    if (!eventId) {
      router.replace("/admin/applications");
    }
  }, [eventId, router]);

  if (!eventId) return null;

  return <ApplicationsListPage />;
}
