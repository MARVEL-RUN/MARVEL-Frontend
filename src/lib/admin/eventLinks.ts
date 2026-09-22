import type { AdminRaceEventId } from "@/lib/admin/raceEvents";
import type { AdminEvent } from "@/services/admin/applications";

const APPS = "/admin/applications";
const CAPS = "/admin/capacities";
const MEMBERS = "/admin/members";
const INQUIRY = "/admin/boards/inquiry";

export function isAdminRaceSlug(id: string): id is AdminRaceEventId {
  return id === "marvel" || id === "virtual";
}

/** API eventId → list?eventId=, marvel·virtual slug → /{slug} (북마크용) */
export function adminApplicationsHref(eventIdOrSlug: string, query?: string) {
  const path = isAdminRaceSlug(eventIdOrSlug)
    ? `${APPS}/${eventIdOrSlug}`
    : `${APPS}/list?eventId=${encodeURIComponent(eventIdOrSlug)}`;
  if (!query) return path;
  return isAdminRaceSlug(eventIdOrSlug) ? `${path}?${query}` : `${path}&${query}`;
}

export function adminApplicationsHrefFromEvent(event: AdminEvent, query?: string) {
  return adminApplicationsHref(event.eventId, query);
}

/** 대회 API eventId로 정원 상세 진입 */
export function adminCapacitiesHrefFromEvent(event: AdminEvent) {
  return adminCapacitiesHref(event.eventId);
}

export function adminCapacitiesHref(eventIdOrSlug: string) {
  if (isAdminRaceSlug(eventIdOrSlug)) return `${CAPS}/${eventIdOrSlug}`;
  return `${CAPS}/list?eventId=${encodeURIComponent(eventIdOrSlug)}`;
}

/** API eventId → list?eventId=, marvel·virtual slug → /{slug} (북마크용) */
export function adminMembersHref(eventIdOrSlug: string, query?: string) {
  const path = isAdminRaceSlug(eventIdOrSlug)
    ? `${MEMBERS}/${eventIdOrSlug}`
    : `${MEMBERS}/list?eventId=${encodeURIComponent(eventIdOrSlug)}`;
  if (!query) return path;
  return isAdminRaceSlug(eventIdOrSlug) ? `${path}?${query}` : `${path}&${query}`;
}

export function adminMembersHrefFromEvent(event: AdminEvent, query?: string) {
  return adminMembersHref(event.eventId, query);
}

export function adminMembersListBackHref(apiEventId: string) {
  return `${MEMBERS}/list?eventId=${encodeURIComponent(apiEventId)}`;
}

export function adminOrganizationDetailHref(
  organizationId: string,
  options: { apiEventId: string },
) {
  const params = new URLSearchParams({
    organizationId,
    eventId: options.apiEventId,
  });
  return `${MEMBERS}/detail?${params}`;
}

export function adminInquiriesHref(eventId: string) {
  return `${INQUIRY}/list?eventId=${encodeURIComponent(eventId)}`;
}

export function adminInquiriesHrefFromEvent(event: AdminEvent) {
  return adminInquiriesHref(event.eventId);
}

export function adminInquiryDetailHref(
  questionId: string,
  options: { apiEventId: string },
) {
  const params = new URLSearchParams({
    id: questionId,
    eventId: options.apiEventId,
  });
  return `${INQUIRY}/detail?${params}`;
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
