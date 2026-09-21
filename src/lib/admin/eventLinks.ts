import type { AdminRaceEventId } from "@/lib/admin/raceEvents";
import { raceEventSlug, type AdminEvent } from "@/services/admin/applications";

const APPS = "/admin/applications";
const CAPS = "/admin/capacities";
const MEMBERS = "/admin/members";

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

/** marvel·virtual → /members/{slug}, 그 외 API id → /members/list?eventId= */
export function adminMembersHref(eventIdOrSlug: string, query?: string) {
  const path = isAdminRaceSlug(eventIdOrSlug)
    ? `${MEMBERS}/${eventIdOrSlug}`
    : `${MEMBERS}/list?eventId=${encodeURIComponent(eventIdOrSlug)}`;
  if (!query) return path;
  return isAdminRaceSlug(eventIdOrSlug) ? `${path}?${query}` : `${path}&${query}`;
}

export function adminMembersHrefFromEvent(event: AdminEvent, query?: string) {
  return adminMembersHref(raceEventSlug(event) ?? event.eventId, query);
}

export function adminMembersListBackHref(apiEventId: string, slug?: AdminRaceEventId | null) {
  if (slug) return `${MEMBERS}/${slug}`;
  return `${MEMBERS}/list?eventId=${encodeURIComponent(apiEventId)}`;
}

export function adminOrganizationDetailHref(
  organizationId: string,
  options: { apiEventId: string; slug?: AdminRaceEventId | null },
) {
  const params = new URLSearchParams({
    organizationId,
    eventId: options.apiEventId,
  });
  if (options.slug) params.set("slug", options.slug);
  return `${MEMBERS}/detail?${params}`;
}
