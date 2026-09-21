"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { CapacityStatusPage } from "./CapacityStatusPage";

/** API eventId 전용. slug(marvel/virtual)는 [eventId] 라우트 */
export function CapacitiesListRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId")?.trim() ?? "";

  useEffect(() => {
    if (!eventId) {
      router.replace("/admin/capacities");
    }
  }, [eventId, router]);

  if (!eventId) return null;

  return <CapacityStatusPage />;
}
