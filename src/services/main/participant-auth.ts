import { mainFetch, mainFetchDetailed, MainHttpError } from "@/lib/main/fetch";
import {
  readLoginSession,
  writeLoginSession,
  clearLoginSession,
  type VirtualRunAuthTokens,
} from "@/lib/virtual-run/login-session";
import {
  entriesFromParticipantOrder,
  parseOrderSettlement,
  parseParticipantOrder,
  parseParticipantOrderList,
  type ParticipantOrder,
  type ParticipantOrderSettlement,
} from "./participant-orders";
import { createRegistration } from "./registrations";
import type {
  IndividualRegistrationLookupRequest,
  PackageUpgradeOrder,
  PaymentRetryResponse,
  RegistrationCreateRequest,
  RegistrationCreateResponse,
  RegistrationEntryInput,
} from "./types";

export type ParticipantAuthResult = {
  registrationId: string;
  eventId: string;
  name: string;
  orderCount: number;
  tokens: VirtualRunAuthTokens;
};

export type {
  ParticipantOrder,
  ParticipantOrderSettlement,
};

function bearer(token: string) {
  const value = token.trim();
  if (!value) return "";
  return /^Bearer\s+/i.test(value) ? value : `Bearer ${value}`;
}

function headerToken(headers: Headers, name: string) {
  const raw = headers.get(name)?.trim() ?? "";
  return raw.replace(/^Bearer\s+/i, "").trim();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const data = row.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return row;
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const amount = Number(value);
    if (Number.isFinite(amount)) return amount;
  }
  return 0;
}

function authFromResponse(data: unknown, headers: Headers): ParticipantAuthResult {
  const row = asRecord(data);
  const accessToken = headerToken(headers, "authorization");
  const refreshToken = headerToken(headers, "refreshToken");
  if (!accessToken || !refreshToken) {
    throw new MainHttpError(200, "로그인 토큰을 받지 못했습니다.");
  }
  const orderCount = asAmount(row?.orderCount);
  return {
    registrationId: asText(row?.registrationId),
    eventId: asText(row?.eventId),
    name: asText(row?.name),
    orderCount: Number.isInteger(orderCount) ? orderCount : 0,
    tokens: { accessToken, refreshToken },
  };
}

function asUpgradeOrder(data: unknown): PackageUpgradeOrder {
  const row = asRecord(data);
  const orderId = asText(row?.orderId);
  const amount = asAmount(row?.amount);
  if (!orderId) throw new MainHttpError(200, "결제 주문번호가 없습니다.");
  return {
    upgradeId: asText(row?.upgradeId),
    targetCategoryId: asText(row?.targetCategoryId),
    targetCategoryName: asText(row?.targetCategoryName),
    paymentId: asText(row?.paymentId),
    orderId,
    orderName: asText(row?.orderName),
    amount,
  };
}

export async function loginParticipant(
  eventId: string,
  body: IndividualRegistrationLookupRequest,
) {
  const { data, headers } = await mainFetchDetailed<unknown>(
    `v1/public/events/${encodeURIComponent(eventId)}/participant-auth/login`,
    { method: "POST", body: JSON.stringify(body) },
  );
  return authFromResponse(data, headers);
}

export async function refreshParticipant(refreshToken: string) {
  const { data, headers } = await mainFetchDetailed<unknown>(
    "v1/public/participant-auth/refresh",
    {
      method: "POST",
      headers: { refreshToken: bearer(refreshToken) },
    },
  );
  return authFromResponse(data, headers);
}

export async function logoutParticipant(accessToken: string) {
  await mainFetch<void>("v1/participant/auth/logout", {
    method: "POST",
    headers: { Authorization: bearer(accessToken) },
  });
}

let refreshLock: Promise<ParticipantAuthResult> | null = null;

function refreshOnce(refreshToken: string) {
  if (!refreshLock) {
    refreshLock = refreshParticipant(refreshToken).finally(() => {
      refreshLock = null;
    });
  }
  return refreshLock;
}

function storeTokens(tokens: VirtualRunAuthTokens, patch?: Partial<ParticipantAuthResult>) {
  const session = readLoginSession();
  if (!session) return;
  writeLoginSession({
    ...session,
    tokens,
    ...(typeof patch?.orderCount === "number" ? { orderCount: patch.orderCount } : {}),
  });
}

function activeRegistrationId() {
  const registrationId = readLoginSession()?.registrationId?.trim() ?? "";
  if (!registrationId) {
    throw new MainHttpError(400, "주문을 선택하세요.");
  }
  return registrationId;
}

function registrationPath(suffix = "") {
  return `v1/participant/registrations/${encodeURIComponent(activeRegistrationId())}${suffix}`;
}

export async function participantFetch<T>(
  endpoint: string,
  init: RequestInit = {},
  didRefresh = false,
): Promise<T> {
  const session = readLoginSession();
  const accessToken = session?.tokens?.accessToken ?? "";
  if (!accessToken) {
    throw new MainHttpError(401, "로그인이 필요합니다.");
  }
  try {
    return await mainFetch<T>(endpoint, {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init.headers).entries()),
        Authorization: bearer(accessToken),
      },
    });
  } catch (error) {
    if (
      !(error instanceof MainHttpError) ||
      error.status !== 401 ||
      didRefresh ||
      error.code === "BLACKLISTED_ACCESS_TOKEN"
    ) {
      if (error instanceof MainHttpError && error.code === "BLACKLISTED_ACCESS_TOKEN") {
        clearLoginSession();
      }
      throw error;
    }
    const refreshToken = session?.tokens?.refreshToken ?? "";
    if (!refreshToken) {
      clearLoginSession();
      throw error;
    }
    try {
      const next = await refreshOnce(refreshToken);
      storeTokens(next.tokens, next);
      return await participantFetch<T>(endpoint, init, true);
    } catch (refreshError) {
      clearLoginSession();
      throw refreshError;
    }
  }
}

export async function logoutParticipantSession() {
  const accessToken = readLoginSession()?.tokens?.accessToken ?? "";
  try {
    if (accessToken) await logoutParticipant(accessToken);
  } catch {
    /* 서버 로그아웃이 실패해도 이 브라우저 세션은 지운다 */
  }
  clearLoginSession();
}

export async function requestPackageUpgrade(entries: RegistrationEntryInput[]) {
  return participantFetch<unknown>(registrationPath("/upgrade"), {
    method: "POST",
    body: JSON.stringify({ entries }),
  }).then(asUpgradeOrder);
}

export async function reopenPackageUpgradePayment() {
  return participantFetch<unknown>(registrationPath("/upgrade/payment"), {
    method: "POST",
  }).then(asUpgradeOrder);
}

/** 진행 중인 상향이 없으면 404. 조회 API가 아니라 결제 재개로 구분한다 */
export async function fetchPendingPackageUpgrade() {
  try {
    return await reopenPackageUpgradePayment();
  } catch (error) {
    if (
      error instanceof MainHttpError &&
      (error.status === 404 || error.code === "PACKAGE_UPGRADE_NOT_FOUND")
    ) {
      return null;
    }
    throw error;
  }
}

export async function cancelPackageUpgrade() {
  await participantFetch<void>(registrationPath("/upgrade"), {
    method: "DELETE",
  });
}

export type ParticipantEntry = {
  entryId: string;
  itemSortOrder: number;
  productId: string;
  productName: string;
  eventCategoryId: string;
  categoryName: string;
  name: string;
  phNum: string;
  birth: string;
  gender: string;
};

export type ParticipantEntryUpdate = {
  entryId: string;
  name: string;
  phNum: string;
  birth: string;
  gender: "M" | "F";
};

function asEntry(value: unknown): ParticipantEntry | null {
  const row = asRecord(value);
  const entryId = asText(row?.entryId);
  if (!entryId) return null;
  const order = row?.itemSortOrder;
  return {
    entryId,
    itemSortOrder: typeof order === "number" && Number.isFinite(order) ? order : 0,
    productId: asText(row?.productId),
    productName: asText(row?.productName),
    eventCategoryId: asText(row?.eventCategoryId),
    categoryName: asText(row?.categoryName),
    name: asText(row?.name),
    phNum: asText(row?.phNum).replace(/\D/g, ""),
    birth: asText(row?.birth),
    gender: asText(row?.gender).toUpperCase(),
  };
}

function asEntryList(data: unknown) {
  const row = asRecord(data);
  const list = Array.isArray(row?.entries) ? row.entries : [];
  return list.flatMap((item) => {
    const entry = asEntry(item);
    return entry ? [entry] : [];
  });
}

export function participantProductLabel(entries: ParticipantEntry[]) {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const key = `${entry.itemSortOrder}:${entry.productId || entry.productName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (entry.productName) names.push(entry.productName);
  }
  return names.join(" · ");
}

export async function fetchParticipantOrders() {
  const data = await participantFetch<unknown>("v1/participant/registrations");
  return parseParticipantOrderList(data);
}

export async function fetchParticipantOrder(registrationId: string) {
  const data = await participantFetch<unknown>(
    `v1/participant/registrations/${encodeURIComponent(registrationId)}`,
  );
  return parseParticipantOrder(data);
}

export async function fetchParticipantEntries() {
  const order = await fetchParticipantOrder(activeRegistrationId());
  return entriesFromParticipantOrder(order);
}

export async function patchParticipantEntries(entries: ParticipantEntryUpdate[]) {
  const data = await participantFetch<unknown>(registrationPath("/entries"), {
    method: "PATCH",
    body: JSON.stringify({ entries }),
  });
  return asEntryList(data);
}

export async function modifyParticipantAddress(body: { address: string; addressDetail: string }) {
  await participantFetch<void>(registrationPath(), {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function modifyParticipantOrderer(body: {
  name: string;
  phNum: string;
  birth: string;
  gender: "M" | "F";
}) {
  await participantFetch<void>("v1/participant/orderer", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const session = readLoginSession();
  if (!session) return;
  writeLoginSession({
    ...session,
    access: {
      ...session.access,
      name: body.name,
      phNum: body.phNum,
      birth: body.birth,
    },
  });
}

export async function changeParticipantPassword(body: {
  currentPassword: string;
  newPassword: string;
}) {
  await participantFetch<void>("v1/participant/orderer/password", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const session = readLoginSession();
  if (!session?.tokens) return;
  writeLoginSession({
    ...session,
    access: { ...session.access, password: body.newPassword },
    tokens: { ...session.tokens, refreshToken: "" },
  });
}

export async function createParticipantAdditionalOrder(body: RegistrationCreateRequest) {
  const payload = {
    items: body.items ?? [],
    address: body.address,
    addressDetail: body.addressDetail,
    guardianConsent: body.guardianConsent ?? false,
    ...(body.guardianName ? { guardianName: body.guardianName } : {}),
    ...(body.guardianPhNum ? { guardianPhNum: body.guardianPhNum } : {}),
    ...(body.guardianRelationship ? { guardianRelationship: body.guardianRelationship } : {}),
    termsEssentialAgreed: body.termsEssentialAgreed,
    termsMarketingAgreed: body.termsMarketingAgreed,
    termsMarketingChannelAgreed: body.termsMarketingChannelAgreed,
    ...(body.startGroupId ? { startGroupId: body.startGroupId } : {}),
    startGroupUnselected: body.startGroupUnselected,
    ...(body.discountLinkCode ? { discountLinkCode: body.discountLinkCode } : {}),
  };
  return participantFetch<RegistrationCreateResponse>("v1/participant/registrations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelParticipantOrder(registrationId: string) {
  const data = await participantFetch<unknown>(
    `v1/participant/registrations/${encodeURIComponent(registrationId)}/cancellation`,
    { method: "POST" },
  );
  return parseOrderSettlement(data);
}

export async function retryParticipantPayment(registrationId: string, paymentId: string) {
  const data = await participantFetch<unknown>(
    `v1/participant/registrations/${encodeURIComponent(registrationId)}/payments/${encodeURIComponent(paymentId)}/retry`,
    { method: "POST" },
  );
  const row = asRecord(data);
  const orderId = asText(row?.orderId);
  if (!orderId) throw new MainHttpError(200, "결제 주문번호가 없습니다.");
  const result: PaymentRetryResponse = {
    paymentId: asText(row?.paymentId),
    orderId,
    orderName: asText(row?.orderName),
    amount: asAmount(row?.amount),
  };
  return result;
}

export async function submitVirtualRunRegistration(
  eventId: string,
  body: RegistrationCreateRequest,
) {
  if (readLoginSession()?.tokens?.accessToken) {
    return createParticipantAdditionalOrder(body);
  }
  return createRegistration(eventId, body);
}
