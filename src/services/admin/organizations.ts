import { adminFetch } from "@/lib/admin/fetch";
import type { SpringPage } from "@/services/admin/boards/inquiries.types";

export type AdminOrganizationListItem = {
  listNumber: number;
  organizationId: string;
  groupName: string;
  eventName: string;
  leaderName: string;
  loginId: string;
  memberCount: number;
  createdAt: string;
};

export type AdminOrganizationMember = {
  registrationId: string;
  name: string;
  courseName: string;
  souvenirName: string;
  souvenirSize: string;
  birth: string;
  amount: number;
};

export type AdminOrganizationDetail = {
  organizationId: string;
  groupName: string;
  eventName: string;
  leaderName: string;
  loginId: string;
  createdAt: string;
  members: AdminOrganizationMember[];
};

export type OrganizationListParams = {
  eventId: string;
  keyword?: string;
  page?: number;
  size?: number;
};

function asText(value: unknown) {
  if (value == null) return "";
  return String(value).trim();
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function emptyPage(size: number, page: number): SpringPage<AdminOrganizationListItem> {
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

function toListItem(row: unknown): AdminOrganizationListItem | null {
  if (!row || typeof row !== "object") return null;
  const item = row as Record<string, unknown>;
  const organizationId = asText(item.organizationId);
  if (!organizationId) return null;
  return {
    listNumber: asNumber(item.listNumber),
    organizationId,
    groupName: asText(item.groupName),
    eventName: asText(item.eventName),
    leaderName: asText(item.leaderName),
    loginId: asText(item.loginId),
    memberCount: asNumber(item.memberCount),
    createdAt: asText(item.createdAt),
  };
}

function toMember(row: unknown): AdminOrganizationMember | null {
  if (!row || typeof row !== "object") return null;
  const item = row as Record<string, unknown>;
  const registrationId = asText(item.registrationId);
  if (!registrationId) return null;
  return {
    registrationId,
    name: asText(item.name),
    courseName: asText(item.courseName),
    souvenirName: asText(item.souvenirName),
    souvenirSize: asText(item.souvenirSize),
    birth: asText(item.birth),
    amount: asNumber(item.amount),
  };
}

function asOrganizationPage(
  data: unknown,
  size: number,
  page: number,
): SpringPage<AdminOrganizationListItem> {
  if (data && typeof data === "object" && Array.isArray((data as SpringPage<unknown>).content)) {
    const raw = data as SpringPage<unknown>;
    const content = raw.content.flatMap((row) => {
      const item = toListItem(row);
      return item ? [item] : [];
    });
    return {
      ...raw,
      content,
      empty: content.length === 0,
      numberOfElements: content.length,
    };
  }
  return emptyPage(size, page);
}

function asOrganizationDetail(data: unknown): AdminOrganizationDetail | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const organizationId = asText(row.organizationId);
  if (!organizationId) return null;
  const members = Array.isArray(row.members)
    ? row.members.flatMap((item) => {
        const member = toMember(item);
        return member ? [member] : [];
      })
    : [];
  return {
    organizationId,
    groupName: asText(row.groupName),
    eventName: asText(row.eventName),
    leaderName: asText(row.leaderName),
    loginId: asText(row.loginId),
    createdAt: asText(row.createdAt),
    members,
  };
}

export function fetchAdminOrganizations(params: OrganizationListParams) {
  const query = new URLSearchParams({
    eventId: params.eventId,
    page: String(params.page ?? 0),
    size: String(params.size ?? 15),
  });
  if (params.keyword?.trim()) query.set("keyword", params.keyword.trim());
  return adminFetch<unknown>(`v1/admin/organizations?${query}`).then((data) =>
    asOrganizationPage(data, params.size ?? 15, params.page ?? 0),
  );
}

export function fetchAdminOrganization(organizationId: string) {
  return adminFetch<unknown>(
    `v1/admin/organizations/${encodeURIComponent(organizationId)}`,
  ).then((data) => {
    const detail = asOrganizationDetail(data);
    if (!detail) throw new Error("단체 정보를 불러올 수 없습니다.");
    return detail;
  });
}
