import { adminFetch } from "@/lib/admin/fetch";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import {
  type AdminRaceEventId,
  type VirtualRoundId,
  VIRTUAL_ROUND_LABEL,
} from "@/lib/admin/raceEvents";
import { courseById, type CourseId } from "@/lib/register";
import type { AdminPayStatus } from "@/types/admin/admin";

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

export type ApplicationKind = "individual" | "group";

export type AdminEvent = {
  eventId: string;
  eventName: string;
  registrationType: string;
  registrationPeriod: string;
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
  birth?: string;
  courseId?: CourseId;
  courseName?: string;
  round?: VirtualRoundId;
  souvenir: string;
  size: string;
  phone: string;
  email: string;
  guardianPhone: string;
  guardianRelation: string;
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
  listNumber?: number;
  type?: string;
  name?: string;
  orgName?: string;
  birth?: string;
  gender?: string;
  courseName?: string;
  souvenirName?: string;
  phoneNumber?: string;
  marketingConsent?: string | boolean;
  status?: string;
  createdAt?: string;
  organizationId?: string;
};

type RegistrationDetail = {
  name?: string;
  orgName?: string;
  courseName?: string;
  souvenirName?: string;
  souvenirSize?: string;
  gender?: string;
  birth?: string;
  phoneNumber?: string;
  email?: string;
  guardianPhoneNumber?: string;
  guardianRelationship?: string;
  createdAt?: string;
  amount?: number;
  orderId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  address?: string;
  addressDetail?: string;
};

export type RegistrationListParams = {
  eventId: string;
  type?: ApplicationKind | "";
  status?: AdminPayStatus | "";
  keyword?: string;
  eventCategoryId?: string;
  page: number;
  size: number;
};

const PAY_STATUSES: AdminPayStatus[] = [
  "paid",
  "pending",
  "refund_requested",
  "refunded",
];

const STATUS_FROM_API: Record<string, AdminPayStatus> = {
  paid: "paid",
  completed: "paid",
  confirmed: "paid",
  done: "paid",
  pending: "pending",
  unpaid: "pending",
  ready: "pending",
  waiting: "pending",
  refund_requested: "refund_requested",
  refundrequested: "refund_requested",
  refunded: "refunded",
  canceled: "refunded",
  cancelled: "refunded",
};

const STATUS_TO_API: Record<AdminPayStatus, string> = {
  paid: "PAID",
  pending: "PENDING",
  refund_requested: "REFUND_REQUESTED",
  refunded: "REFUNDED",
};

function compactName(name: string) {
  return name.replace(/\s/g, "");
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

function normalizeStatus(value?: string) {
  if (!value) return "";
  const key = value.trim().toLowerCase().replace(/[\s-]/g, "_");
  return STATUS_FROM_API[key] ?? value.trim();
}

function consentYes(value?: string | boolean) {
  if (typeof value === "boolean") return value;
  const v = (value ?? "").trim().toLowerCase();
  return v === "true" || v === "y" || v === "yes" || v === "1" || v === "동의";
}

function kindFromApi(type?: string): ApplicationKind {
  const v = (type ?? "").trim().toUpperCase();
  if (v === "ORGANIZATION" || v === "GROUP" || v === "ORG" || type === "단체") {
    return "group";
  }
  return "individual";
}

function genderFromApi(value?: string): "male" | "female" | undefined {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "m" || v === "male" || v === "남" || v === "남성") return "male";
  if (v === "f" || v === "female" || v === "여" || v === "여성") return "female";
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

function toRow(item: RegistrationListItem, eventId: string): AdminApplicationRow {
  const kind = kindFromApi(item.type);
  const personName = item.name?.trim() ?? "";
  const groupName = item.orgName?.trim() ?? "";
  return {
    id: item.registrationId ?? "",
    no: item.listNumber ?? 0,
    eventId,
    kind,
    orderNo: "",
    name: displayName(kind, personName, groupName),
    personName,
    groupName,
    birth: item.birth ?? "",
    courseName: item.courseName ?? "",
    souvenir: item.souvenirName ?? "",
    size: "",
    phone: item.phoneNumber ?? "",
    email: "",
    guardianPhone: "",
    guardianRelation: "",
    gender: genderFromApi(item.gender),
    marketingConsent: consentYes(item.marketingConsent),
    amount: 0,
    cardPaymentInfo: "",
    address: "",
    addressDetail: "",
    status: normalizeStatus(item.status),
    appliedAt: formatAdminBoardDate(item.createdAt),
    organizationId: item.organizationId?.trim() || undefined,
  };
}

export function applyRegistrationDetail(
  row: AdminApplicationRow,
  detail: RegistrationDetail,
): AdminApplicationRow {
  const personName = detail.name?.trim() ?? row.personName;
  const groupName = detail.orgName?.trim() ?? row.groupName;
  return {
    ...row,
    personName,
    groupName,
    name: displayName(row.kind, personName, groupName),
    courseName: detail.courseName?.trim() || row.courseName,
    souvenir: detail.souvenirName?.trim() || row.souvenir,
    size: detail.souvenirSize?.trim() || row.size,
    gender: genderFromApi(detail.gender) ?? row.gender,
    birth: detail.birth?.trim() || row.birth,
    phone: detail.phoneNumber?.trim() || row.phone,
    email: detail.email?.trim() ?? row.email,
    guardianPhone: detail.guardianPhoneNumber?.trim() ?? row.guardianPhone,
    guardianRelation: detail.guardianRelationship?.trim() ?? row.guardianRelation,
    appliedAt: detail.createdAt ? formatAdminBoardDate(detail.createdAt) : row.appliedAt,
    amount: detail.amount ?? row.amount,
    orderNo: detail.orderId?.trim() || row.orderNo,
    cardPaymentInfo: detail.paymentMethod?.trim() || row.cardPaymentInfo,
    status: normalizeStatus(detail.paymentStatus) || row.status,
    address: detail.address?.trim() ?? row.address,
    addressDetail: detail.addressDetail?.trim() ?? row.addressDetail,
  };
}

export function fetchAdminEvents() {
  return adminFetch<unknown>("v1/admin/events").then(asEventList);
}

export function fetchAdminRegistrations(params: RegistrationListParams) {
  const query = new URLSearchParams({
    eventId: params.eventId,
    page: String(params.page),
    size: String(params.size),
  });
  if (params.type === "individual") query.set("type", "PERSONAL");
  if (params.type === "group") query.set("type", "ORGANIZATION");
  if (params.status) query.set("status", STATUS_TO_API[params.status]);
  if (params.keyword?.trim()) query.set("keyword", params.keyword.trim());
  if (params.eventCategoryId) query.set("eventCategoryId", params.eventCategoryId);

  return adminFetch<unknown>(`v1/admin/registrations?${query}`).then((data) =>
    asRegistrationPage(data, params.size, params.page),
  );
}

export function fetchAdminRegistration(registrationId: string) {
  return adminFetch<RegistrationDetail>(
    `v1/admin/registrations/${encodeURIComponent(registrationId)}`,
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

export function isPayStatus(value: string): value is AdminPayStatus {
  return PAY_STATUSES.includes(value as AdminPayStatus);
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
  if (gender === "male") return "남성";
  if (gender === "female") return "여성";
  return "-";
}

export function applicationPayLabel(status: string) {
  if (status === "paid") return "결제완료";
  if (status === "pending") return "미결제";
  if (status === "refund_requested") return "환불 대기";
  if (status === "refunded") return "환불완료";
  return status || "-";
}

export function applicationPayBadge(status: string) {
  return isPayStatus(status) ? status : "plain";
}

export function formatAmount(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}
