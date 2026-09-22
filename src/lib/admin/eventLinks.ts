const APPS = "/admin/applications";
const CAPS = "/admin/capacities";
const MEMBERS = "/admin/members";
const INQUIRY = "/admin/boards/inquiry";

function isRaceSlug(id: string) {
  return id === "marvel" || id === "virtual";
}

function withQuery(path: string, slugPath: boolean, query?: string) {
  if (!query) return path;
  return slugPath ? `${path}?${query}` : `${path}&${query}`;
}

/** API eventId → list?eventId=, marvel·virtual slug → /{slug} (북마크용) */
export function adminApplicationsHref(eventIdOrSlug: string, query?: string) {
  const slug = isRaceSlug(eventIdOrSlug);
  const path = slug
    ? `${APPS}/${eventIdOrSlug}`
    : `${APPS}/list?eventId=${encodeURIComponent(eventIdOrSlug)}`;
  return withQuery(path, slug, query);
}

export function adminApplicationsHrefFromEvent(
  event: { eventId: string },
  query?: string,
) {
  return adminApplicationsHref(event.eventId, query);
}

/** 대회 API eventId로 정원 상세 진입 */
export function adminCapacitiesHrefFromEvent(event: { eventId: string }) {
  return adminCapacitiesHref(event.eventId);
}

export function adminCapacitiesHref(eventIdOrSlug: string) {
  if (isRaceSlug(eventIdOrSlug)) return `${CAPS}/${eventIdOrSlug}`;
  return `${CAPS}/list?eventId=${encodeURIComponent(eventIdOrSlug)}`;
}

/** API eventId → list?eventId=, marvel·virtual slug → /{slug} (북마크용) */
export function adminMembersHref(eventIdOrSlug: string, query?: string) {
  const slug = isRaceSlug(eventIdOrSlug);
  const path = slug
    ? `${MEMBERS}/${eventIdOrSlug}`
    : `${MEMBERS}/list?eventId=${encodeURIComponent(eventIdOrSlug)}`;
  return withQuery(path, slug, query);
}

export function adminMembersHrefFromEvent(
  event: { eventId: string },
  query?: string,
) {
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

export function adminInquiriesHrefFromEvent(event: { eventId: string }) {
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

export function isAdminRaceSlug(id: string) {
  return isRaceSlug(id);
}
