import type { AdminRaceEventId } from "@/lib/admin/raceEvents";
import { raceEventSlug, type AdminEvent } from "@/services/admin/applications";

const APPS = "/admin/applications";
const CAPS = "/admin/capacities";

export function isAdminRaceSlug(id: string): id is AdminRaceEventId {
  return id === "marvel" || id === "virtual";
}

/** marvel·virtual → /applications/{slug}, 그 외 API id → /applications/list?eventId= */
export function adminApplicationsHref(eventIdOrSlug: string, query?: string) {
  const path = isAdminRaceSlug(eventIdOrSlug)
    ? `${APPS}/${eventIdOrSlug}`
    : `${APPS}/list?eventId=${encodeURIComponent(eventIdOrSlug)}`;
  if (!query) return path;
  return isAdminRaceSlug(eventIdOrSlug) ? `${path}?${query}` : `${path}&${query}`;
}

export function adminApplicationsHrefFromEvent(event: AdminEvent, query?: string) {
  return adminApplicationsHref(raceEventSlug(event) ?? event.eventId, query);
}

/** marvel·virtual slug만 정원 상세 라우트 있음 */
export function adminCapacitiesHrefFromEvent(event: AdminEvent) {
  const slug = raceEventSlug(event);
  return slug ? `${CAPS}/${slug}` : null;
}

export function adminCapacitiesHref(eventIdOrSlug: string) {
  return isAdminRaceSlug(eventIdOrSlug) ? `${CAPS}/${eventIdOrSlug}` : null;
}
