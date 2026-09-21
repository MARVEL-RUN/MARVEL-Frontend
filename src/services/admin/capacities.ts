import { AdminHttpError, adminFetch } from "@/lib/admin/fetch";
import type { AdminRaceEventId } from "@/lib/admin/raceEvents";
import { DEFAULT_EVENT_ID } from "@/lib/main/config";

export type CapacityType =
  | "EVENT_TOTAL"
  | "CATEGORY"
  | "CHILD_CATEGORY"
  | "CATEGORY_GROUP"
  | "SOUVENIR";

export type CapacityState = "HELD" | "CONFIRMED";

export type CapacityRow = {
  capacityId: string;
  type: CapacityType | string;
  name: string;
  resourceKey: string;
  souvenirId: string | null;
  size: string;
  limitCount: number;
  confirmedCount: number;
  heldCount: number;
  active: boolean;
};

export type CapacityRegistration = {
  registrationId: string;
  name: string;
  birth: string;
  phNum: string;
  organizationName: string | null;
};

export type CapacityRegistrationPage = {
  capacityId?: string;
  state?: CapacityState;
  content: CapacityRegistration[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

const TYPE_LABEL: Record<CapacityType, string> = {
  EVENT_TOTAL: "대회 총원",
  CATEGORY: "종목 정원",
  CHILD_CATEGORY: "어린이 종목 정원",
  CATEGORY_GROUP: "종목 합산 정원",
  SOUVENIR: "기념품 재고",
};

/** 마블런만 공개 신청과 같은 대회 id. 버추얼은 아직 없음 */
export function capacityApiEventId(eventId: AdminRaceEventId) {
  if (eventId === "marvel") return DEFAULT_EVENT_ID;
  return null;
}

export function capacityTypeLabel(type: string) {
  return TYPE_LABEL[type as CapacityType] ?? type;
}

export function capacityUnit(type: string) {
  return type === "SOUVENIR" ? "개" : "명";
}

export function fetchEventCapacities(eventId: string) {
  return adminFetch<CapacityRow[]>(
    `v1/admin/events/${encodeURIComponent(eventId)}/capacities`,
  );
}

export function fetchCapacityRegistrations(
  eventId: string,
  capacityId: string,
  params: { state: CapacityState; page: number; size: number },
) {
  const query = new URLSearchParams({
    state: params.state,
    page: String(params.page),
    size: String(params.size),
  });
  return adminFetch<CapacityRegistrationPage>(
    `v1/admin/events/${encodeURIComponent(eventId)}/capacities/${encodeURIComponent(capacityId)}/registrations?${query}`,
  );
}

export function isAdminHttp(error: unknown, status?: number): error is AdminHttpError {
  if (!(error instanceof AdminHttpError)) return false;
  return status === undefined || error.status === status;
}
