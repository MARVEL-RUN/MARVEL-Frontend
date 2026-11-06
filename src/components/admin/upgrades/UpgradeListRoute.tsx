"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { UpgradeListPage } from "./UpgradeListPage";

export function UpgradeListRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId")?.trim() ?? "";

  useEffect(() => {
    if (!eventId) router.replace("/admin/upgrades");
  }, [eventId, router]);

  if (!eventId) return null;
  return <UpgradeListPage eventId={eventId} />;
}
