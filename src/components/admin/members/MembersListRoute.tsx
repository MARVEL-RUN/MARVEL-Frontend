"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { MembersListPage } from "./MembersListPage";

/** API eventId 전용. slug(marvel/virtual)는 [eventId] 라우트 */
export function MembersListRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId")?.trim() ?? "";

  useEffect(() => {
    if (!eventId) {
      router.replace("/admin/members");
    }
  }, [eventId, router]);

  if (!eventId) return null;

  return <MembersListPage />;
}
