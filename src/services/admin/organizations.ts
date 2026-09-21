import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { adminFetch } from "@/lib/admin/fetch";
import { APPLICATION_PASSWORD_MIN } from "@/lib/register";
import { statusKey } from "@/lib/registration-status";
import { uiGenderFromApi } from "@/lib/registration-gender";
import type { SpringPage } from "@/services/admin/boards/inquiries.types";
import type { AdminApplicationRow } from "@/services/admin/applications";

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
  listNumber: number;
  registrationId: string;
  name: string;
  birth: string;
  gender: string;
  courseName: string;
  souvenirName: string;
  souvenirSize: string;
  phoneNumber: string;
  marketingConsent: string;
  status: string;
  createdAt: string;
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

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return "";
}

function marketingConsentYes(value?: string) {
  const v = asText(value).toLowerCase();
  return v === "true" || v === "y" || v === "yes" || v === "1" || v === "동의";
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
    listNumber: asNumber(item.listNumber),
    registrationId,
    name: asText(item.name),
    birth: asText(item.birth),
    gender: asText(item.gender),
    courseName: asText(item.courseName),
    souvenirName: asText(item.souvenirName),
    souvenirSize: asText(item.souvenirSize),
    phoneNumber: firstText(item.phoneNumber, item.phNum),
    marketingConsent: asText(item.marketingConsent),
    status: asText(item.status),
    createdAt: asText(item.createdAt),
    amount: asNumber(item.amount),
  };
}

export function mapOrganizationMemberToApplicationRow(
  member: AdminOrganizationMember,
  eventId: string,
  organizationId: string,
): AdminApplicationRow {
  return {
    id: member.registrationId,
    no: member.listNumber,
    eventId,
    kind: "individual",
    orderNo: "",
    name: member.name,
    personName: member.name,
    groupName: "",
    birth: member.birth,
    courseName: member.courseName,
    souvenir: member.souvenirName,
    size: member.souvenirSize,
    phone: member.phoneNumber,
    email: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "",
    gender: uiGenderFromApi(member.gender),
    marketingConsent: marketingConsentYes(member.marketingConsent),
    amount: member.amount,
    cardPaymentInfo: "",
    address: "",
    addressDetail: "",
    status: statusKey(member.status),
    appliedAt: formatAdminBoardDate(member.createdAt || undefined),
    organizationId,
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

export function resetOrganizationPassword(
  organizationId: string,
  newPassword: string,
) {
  const password = newPassword.trim();
  if (!organizationId.trim()) throw new Error("단체 정보를 찾을 수 없습니다.");
  if (password.length < APPLICATION_PASSWORD_MIN) {
    throw new Error(`비밀번호는 ${APPLICATION_PASSWORD_MIN}자 이상이어야 합니다.`);
  }
  return adminFetch<void>(
    `v1/admin/organizations/${encodeURIComponent(organizationId)}/password`,
    { method: "PUT", body: JSON.stringify({ newPassword: password }) },
  );
}

export type AdminOrganizationDuplicateCheckResult = {
  requestValue?: string;
  requestUseable?: boolean;
  requestedLoginId?: string;
  useableLoginId?: boolean;
};

export function checkAdminOrganizationDuplicateId(params: {
  eventId: string;
  groupLoginId: string;
}) {
  const eventId = params.eventId.trim();
  const groupLoginId = params.groupLoginId.trim();
  if (!eventId) throw new Error("대회 정보가 없습니다.");
  if (!groupLoginId) throw new Error("로그인 ID를 입력하세요.");

  const query = new URLSearchParams({
    eventId,
    groupLoginId,
  });
  return adminFetch<AdminOrganizationDuplicateCheckResult>(
    `v1/admin/organizations/organization/duplicate-id-check?${query}`,
  ).then((data) => {
    const row =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : null;
    const useable =
      row && typeof row.requestUseable === "boolean"
        ? row.requestUseable
        : row && typeof row.useableLoginId === "boolean"
          ? row.useableLoginId
          : row && typeof row.exists === "boolean"
            ? !row.exists
            : true;
    return {
      requestedLoginId: groupLoginId,
      useableLoginId: useable,
    };
  });
}
