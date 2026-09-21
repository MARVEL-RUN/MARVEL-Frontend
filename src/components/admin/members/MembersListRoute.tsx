"use client";

import { hasAdminApi } from "@/lib/admin/config";
import { isAdminRaceSlug } from "@/lib/admin/eventLinks";
import { fetchAdminEvents, raceEventSlug } from "@/services/admin/applications";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { MembersListPage } from "./MembersListPage";

function slugHref(slug: string, query: string) {
  const params = new URLSearchParams(query);
  params.delete("eventId");
  const q = params.toString();
  return `/admin/members/${slug}${q ? `?${q}` : ""}`;
}

export function MembersListRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const eventId = searchParams.get("eventId")?.trim() ?? "";

  const events = useQuery({
    queryKey: ["admin", "events"],
    queryFn: fetchAdminEvents,
    enabled: hasAdminApi && Boolean(eventId) && !isAdminRaceSlug(eventId),
  });

  const slugRedirect = useMemo(() => {
    if (isAdminRaceSlug(eventId)) return eventId;
    if (!events.data) return null;
    const event = events.data.find((row) => row.eventId === eventId);
    return event ? raceEventSlug(event) : null;
  }, [eventId, events.data]);

  useEffect(() => {
    if (!eventId) {
      router.replace("/admin/members");
      return;
    }
    if (slugRedirect) {
      router.replace(slugHref(slugRedirect, query));
    }
  }, [eventId, query, router, slugRedirect]);

  if (!eventId || slugRedirect) {
    return null;
  }

  if (hasAdminApi && events.isLoading) {
    return (
      <div className="admin-page">
        <p className="admin-empty">불러오는 중…</p>
      </div>
    );
  }

  return <MembersListPage />;
}
