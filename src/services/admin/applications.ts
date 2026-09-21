import { adminFetch } from "@/lib/admin/fetch";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { APPLICATION_PASSWORD_MIN } from "@/lib/register";
import { genderLabel, uiGenderFromApi } from "@/lib/registration-gender";
import {
  registrationStatusBadge,
  registrationStatusLabel,
  statusKey,
  type RegistrationStatus,
} from "@/lib/registration-status";
import {
  kindFromRegistrationType,
  registrationTypeFromKind,
  type ApplicationKind,
} from "@/lib/registration-type";
import {
  type AdminRaceEventId,
  type VirtualRoundId,
  VIRTUAL_ROUND_LABEL,
} from "@/lib/admin/raceEvents";
import { courseById, type CourseId } from "@/lib/register";

export type { ApplicationKind };

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
};

export type AdminEvent = {
  eventId: string;
  eventName: string;
  registrationType: string;
  registrationPeriod: string;
};

export type AdminEventCategory = {
  id: string;
  name: string;
};

export type AdminLeaderInfo = {
  groupName: string;
  name: string;
  phNum: string;
  birth: string;
  address: string;
  addressDetail: string;
};

export type AdminApplicationRow = {
  id: string;
  no: number;
  eventId: string;
  kind: ApplicationKind;
  orderNo: string;
  name: string;
  personName: string;
  groupName: string;
  leaderName?: string;
  leader?: AdminLeaderInfo;
  birth?: string;
  courseId?: CourseId;
  courseName?: string;
  round?: VirtualRoundId;
  souvenir: string;
  size: string;
  phone: string;
  email: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  guardianConsent?: boolean;
  gender?: "male" | "female";
  memberCount?: number;
  marketingConsent: boolean;
  amount: number;
  cardPaymentInfo: string;
  address: string;
  addressDetail: string;
  status: string;
  appliedAt: string;
  organizationId?: string;
};

type RegistrationListItem = {
  registrationId?: string;
  id?: string;
  listNumber?: number;
  type?: string;
  registrationType?: string;
  name?: string;
  orgName?: string;
  groupName?: string;
  organizationName?: string;
  birth?: string;
  gender?: string;
  courseName?: string;
  souvenirName?: string;
  phoneNumber?: string;
  phNum?: string;
  marketingConsent?: string | boolean | number;
  status?: string;
  createdAt?: string;
  organizationId?: string;
  orgId?: string;
};

type RegistrationDetail = {
  name?: unknown;
  orgName?: unknown;
  groupName?: unknown;
  organizationName?: unknown;
  courseName?: unknown;
  souvenirName?: unknown;
  souvenirSize?: unknown;
  gender?: unknown;
  birth?: unknown;
  phoneNumber?: unknown;
  phNum?: unknown;
  email?: unknown;
  guardianName?: unknown;
  guardianPhoneNumber?: unknown;
  guardianPhNum?: unknown;
  guardianPhone?: unknown;
  guardianRelationship?: unknown;
  guardianRelation?: unknown;
  guardianConsent?: unknown;
  createdAt?: unknown;
  amount?: unknown;
  orderId?: unknown;
  paymentMethod?: unknown;
  status?: unknown;
  registrationStatus?: unknown;
  address?: unknown;
  addressDetail?: unknown;
  organizationId?: unknown;
  orgId?: unknown;
  leaderInfo?: unknown;
  leaderInfoResponse?: unknown;
  leader?: unknown;
};

export type RegistrationListParams = {
  eventId: string;
  organizationId?: string;
  type?: ApplicationKind | "";
  status?: RegistrationStatus | "";
  keyword?: string;
  eventCategoryId?: string;
  page: number;
  size: number;
};

function compactName(name: string) {
  return name.replace(/\s/g, "");
}

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return "";
}

function asAmount(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/,/g, "").trim());
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asDetail(value: unknown): RegistrationDetail {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const obj = value as Record<string, unknown>;
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    return obj.data as RegistrationDetail;
  }
  return obj as RegistrationDetail;
}

/** 단체 소속 인원만 내려옴. 아니면 orgId처럼 null */
function asLeaderInfo(value: unknown): AdminLeaderInfo | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const info = value as Record<string, unknown>;
  const leader: AdminLeaderInfo = {
    groupName: firstText(info.groupName, info.orgName, info.organizationName),
    name: asText(info.name),
    phNum: firstText(info.phNum, info.phoneNumber, info.phone),
    birth: asText(info.birth),
    address: asText(info.address),
    addressDetail: asText(info.addressDetail),
  };
  if (
    !leader.groupName &&
    !leader.name &&
    !leader.phNum &&
    !leader.birth &&
    !leader.address &&
    !leader.addressDetail
  ) {
    return undefined;
  }
  return leader;
}

/** 대시보드 슬러그. 이름에 버추얼이 있으면 virtual */
export function matchRaceEvent(events: AdminEvent[], slug: AdminRaceEventId) {
  if (slug === "virtual") {
    return events.find((event) => compactName(event.eventName).includes("버추얼"));
  }
  return events.find((event) => {
    const name = compactName(event.eventName);
    return name.includes("마블") && !name.includes("버추얼");
  });
}

export function raceEventSlug(event: AdminEvent): AdminRaceEventId | null {
  const name = compactName(event.eventName);
  if (name.includes("버추얼")) return "virtual";
  if (name.includes("마블")) return "marvel";
  return null;
}

function consentYes(value?: string | boolean | number) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const v = asText(value).toLowerCase();
  return v === "true" || v === "y" || v === "yes" || v === "1" || v === "동의";
}

function asOptionalBool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }
  const v = asText(value).toLowerCase();
  if (!v) return undefined;
  if (v === "true" || v === "y" || v === "yes" || v === "1" || v === "동의") return true;
  if (v === "false" || v === "n" || v === "no" || v === "0" || v === "미동의") return false;
  return undefined;
}

function displayName(kind: ApplicationKind, name: string, orgName: string) {
  if (kind === "group") return orgName || name;
  return name || orgName;
}

function asEventList(data: unknown): AdminEvent[] {
  if (Array.isArray(data)) return data as AdminEvent[];
  if (data && typeof data === "object" && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: AdminEvent[] }).content;
  }
  return [];
}

function emptyPage<T>(size: number, page: number): Page<T> {
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size,
    number: page,
    first: true,
    last: true,
    empty: true,
    numberOfElements: 0,
  };
}

function asRegistrationPage(
  data: unknown,
  size: number,
  page: number,
): Page<RegistrationListItem> {
  if (Array.isArray(data)) {
    const content = data as RegistrationListItem[];
    return {
      ...emptyPage<RegistrationListItem>(size, page),
      content,
      totalElements: content.length,
      totalPages: 1,
      empty: content.length === 0,
      numberOfElements: content.length,
      last: true,
    };
  }
  if (data && typeof data === "object" && Array.isArray((data as Page<RegistrationListItem>).content)) {
    return data as Page<RegistrationListItem>;
  }
  return emptyPage(size, page);
}

function listItemRegistrationType(item: RegistrationListItem) {
  return firstText(item.type, item.registrationType);
}

function toRow(item: RegistrationListItem, eventId: string): AdminApplicationRow {
  const kind = kindFromRegistrationType(listItemRegistrationType(item));
  const personName = asText(item.name);
  const groupName = firstText(item.orgName, item.groupName, item.organizationName);
  const organizationId = firstText(item.organizationId, item.orgId) || undefined;
  return {
    id: firstText(item.registrationId, item.id),
    no: asAmount(item.listNumber, 0),
    eventId,
    kind,
    orderNo: "",
    name: displayName(kind, personName, groupName),
    personName,
    groupName,
    birth: asText(item.birth),
    courseName: asText(item.courseName),
    souvenir: asText(item.souvenirName),
    size: "",
    phone: firstText(item.phoneNumber, item.phNum),
    email: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "",
    guardianConsent: undefined,
    gender: uiGenderFromApi(item.gender),
    marketingConsent: consentYes(item.marketingConsent),
    amount: 0,
    cardPaymentInfo: "",
    address: "",
    addressDetail: "",
    status: statusKey(item.status),
    appliedAt: formatAdminBoardDate(asText(item.createdAt) || undefined),
    organizationId,
  };
}

export function applyRegistrationDetail(
  row: AdminApplicationRow,
  detail: unknown,
): AdminApplicationRow {
  const data = asDetail(detail);
  const leader = asLeaderInfo(data.leaderInfo ?? data.leader ?? data.leaderInfoResponse);
  const personName = firstText(data.name) || row.personName;
  const groupName =
    firstText(data.orgName, data.groupName, data.organizationName, leader?.groupName) ||
    row.groupName;
  const createdAt = asText(data.createdAt);
  const organizationId =
    firstText(data.organizationId, data.orgId) || row.organizationId;
  return {
    ...row,
    personName,
    groupName,
    name: displayName(row.kind, personName, groupName),
    courseName: firstText(data.courseName) || row.courseName,
    souvenir: firstText(data.souvenirName) || row.souvenir,
    size: firstText(data.souvenirSize) || row.size,
    gender: uiGenderFromApi(asText(data.gender)) ?? row.gender,
    birth: firstText(data.birth) || row.birth,
    phone: firstText(data.phoneNumber, data.phNum) || row.phone,
    email: firstText(data.email) || row.email,
    guardianName: firstText(data.guardianName) || row.guardianName,
    guardianPhone:
      firstText(data.guardianPhoneNumber, data.guardianPhNum, data.guardianPhone) ||
      row.guardianPhone,
    guardianRelation:
      firstText(data.guardianRelationship, data.guardianRelation) || row.guardianRelation,
    guardianConsent: asOptionalBool(data.guardianConsent) ?? row.guardianConsent,
    appliedAt: createdAt ? formatAdminBoardDate(createdAt) : row.appliedAt,
    amount: asAmount(data.amount, row.amount),
    orderNo: firstText(data.orderId) || row.orderNo,
    cardPaymentInfo: firstText(data.paymentMethod) || row.cardPaymentInfo,
    status: statusKey(firstText(data.status, data.registrationStatus)) || row.status,
    address: firstText(data.address, leader?.address) || row.address,
    addressDetail: firstText(data.addressDetail, leader?.addressDetail) || row.addressDetail,
    organizationId,
    leaderName: leader?.name || row.leaderName,
    leader: leader ?? row.leader,
  };
}

export function fetchAdminEvents() {
  return adminFetch<unknown>("v1/admin/events").then(asEventList);
}

function asEventCategoryList(data: unknown): AdminEventCategory[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as { id?: unknown; name?: unknown };
    const id = asText(row.id);
    if (!id) return [];
    const name = asText(row.name);
    return [{ id, name: name || id }];
  });
}

export function fetchAdminEventCategories(eventId: string) {
  return adminFetch<unknown>(
    `v1/admin/events/${encodeURIComponent(eventId)}/event-category`,
  ).then(asEventCategoryList);
}

export function fetchAdminRegistrations(params: RegistrationListParams) {
  const query = new URLSearchParams({
    eventId: params.eventId,
    page: String(params.page),
    size: String(params.size),
  });
  const apiType = registrationTypeFromKind(params.type ?? "");
  if (apiType) query.set("type", apiType);
  if (params.status) query.set("status", params.status);
  if (params.keyword?.trim()) query.set("keyword", params.keyword.trim());
  if (params.eventCategoryId?.trim()) {
    query.set("eventCategoryId", params.eventCategoryId.trim());
  }
  if (params.organizationId?.trim()) {
    query.set("organizationId", params.organizationId.trim());
  }

  return adminFetch<unknown>(`v1/admin/registrations?${query}`).then((data) =>
    asRegistrationPage(data, params.size, params.page),
  );
}

export function fetchAdminRegistration(registrationId: string) {
  return adminFetch<unknown>(
    `v1/admin/registrations/${encodeURIComponent(registrationId)}`,
  );
}

export function resetRegistrationPassword(
  registrationId: string,
  newPassword: string,
) {
  const password = newPassword.trim();
  if (!registrationId.trim()) throw new Error("신청 정보를 찾을 수 없습니다.");
  if (password.length < APPLICATION_PASSWORD_MIN) {
    throw new Error(`비밀번호는 ${APPLICATION_PASSWORD_MIN}자 이상이어야 합니다.`);
  }
  return adminFetch<void>(
    `v1/admin/registrations/${encodeURIComponent(registrationId)}/password`,
    { method: "PUT", body: JSON.stringify({ newPassword: password }) },
  );
}

export function mapRegistrationPage(
  page: Page<RegistrationListItem>,
  eventId: string,
): Page<AdminApplicationRow> {
  return {
    ...page,
    content: page.content.map((item) => toRow(item, eventId)),
  };
}

export async function listAllApplications() {
  try {
    const events = await fetchAdminEvents();
    const pages = await Promise.all(
      events.map((event) =>
        fetchAdminRegistrations({
          eventId: event.eventId,
          page: 0,
          size: 200,
        }).catch(() => emptyPage<RegistrationListItem>(200, 0)),
      ),
    );
    return events.flatMap((event, index) => {
      const slug = raceEventSlug(event) ?? event.eventId;
      return (pages[index]?.content ?? []).map((item) => toRow(item, slug));
    });
  } catch {
    return [];
  }
}

export function applicationKindLabel(kind: ApplicationKind) {
  return kind === "individual" ? "개인" : "단체";
}

export function applicationCourseLabel(row: AdminApplicationRow) {
  if (row.courseName) return row.courseName;
  if (row.round) return applicationRoundLabel(row);
  if (!row.courseId) return "-";
  return courseById(row.courseId)?.distance ?? row.courseId;
}

export function applicationRoundLabel(row: AdminApplicationRow) {
  if (!row.round) return "-";
  return VIRTUAL_ROUND_LABEL[row.round];
}

export function applicationGenderLabel(gender?: "male" | "female") {
  return genderLabel(gender);
}

export {
  registrationStatusBadge as applicationStatusBadge,
  registrationStatusLabel as applicationStatusLabel,
};

export function formatAmount(amount: number) {
  const n = asAmount(amount, Number.NaN);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString("ko-KR")}원`;
}
